const { pool } = require('../config/db');

async function getInventory(req, res) {
  try {
    const [pharmacy_inventory] = await pool.query(`
      SELECT * FROM pharmacy_inventory 
      WHERE is_active = 1 
      ORDER BY drug_name ASC
    `);

    const pharmacy_inventoryWithLowStock = pharmacy_inventory.map(drug => ({
      ...drug,
      low_stock: drug.quantity_in_stock <= drug.reorder_level
    }));

    const lowStockCount = pharmacy_inventoryWithLowStock.filter(d => d.low_stock).length;

    res.json({
      success: true,
      drugs: pharmacy_inventoryWithLowStock,
      totalDrugs: pharmacy_inventoryWithLowStock.length,
      lowStockCount
    });
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
}

async function addDrug(req, res) {
  try {
    const { drug_name, generic_name, category, unit, quantity_in_stock, reorder_level, unit_price } = req.body;

    if (!drug_name) {
      return res.status(400).json({ success: false, message: 'Drug name is required' });
    }

    const qty = parseInt(quantity_in_stock) || 0;
    const level = parseInt(reorder_level) || 0;
    const price = parseFloat(unit_price) || 0;

    if (qty < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative' });
    }

    if (price <= 0) {
      return res.status(400).json({ success: false, message: 'Unit price must be greater than 0' });
    }

    const [existing] = await pool.query(
      'SELECT drug_id FROM pharmacy_inventory WHERE drug_name = ? AND is_active = 1',
      [drug_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Drug already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO pharmacy_inventory (drug_name, generic_name, category, quantity_in_stock, unit, reorder_level, unit_price, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [drug_name, generic_name || null, category || null, qty, unit || null, level, price]
    );

    const [newDrug] = await pool.query('SELECT * FROM pharmacy_inventory WHERE drug_id = ?', [result.insertId]);

    res.status(201).json({ success: true, drug: newDrug[0] });
  } catch (error) {
    console.error('addDrug error:', error);
    res.status(500).json({ success: false, message: 'Failed to add drug' });
  }
}

async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { quantity_change, reason } = req.body;
    const performed_by = req.user.id;

    if (quantity_change === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Quantity change and reason are required' });
    }

    const [[drug]] = await pool.query(
      'SELECT quantity_in_stock FROM pharmacy_inventory WHERE drug_id = ? AND is_active = 1',
      [id]
    );

    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    const newQuantity = drug.quantity_in_stock + parseInt(quantity_change);
    if (newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    await pool.query(
      'UPDATE pharmacy_inventory SET quantity_in_stock = ? WHERE drug_id = ?',
      [newQuantity, id]
    );

    await pool.query(
      `INSERT INTO stock_log (drug_id, quantity_change, reason, performed_by, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, quantity_change, reason, performed_by]
    );

    const [[updatedDrug]] = await pool.query('SELECT * FROM pharmacy_inventory WHERE drug_id = ?', [id]);

    res.json({ success: true, drug: updatedDrug });
  } catch (error) {
    console.error('updateStock error:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
}

async function dispenseMedication(req, res) {
  try {
    const { patient_id, items } = req.body;
    const pharmacist_id = req.user.id;

    if (!patient_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient ID and items are required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create the dispense record
      const [dispenseResult] = await connection.query(
        `INSERT INTO dispensing (patient_id, pharmacist_id, created_at)
         VALUES (?, ?, NOW())`,
        [patient_id, pharmacist_id]
      );

      const dispense_id = dispenseResult.insertId;
      const dispensedItems = [];
      const errors = [];

      for (const item of items) {
        const { drug_id, quantity, dosage_instructions } = item;

        if (!drug_id || !quantity || quantity < 1) {
          errors.push({ drug_id, message: 'Invalid drug or quantity' });
          continue;
        }

        const [[drug]] = await connection.query(
          'SELECT drug_id, quantity_in_stock, drug_name FROM pharmacy_inventory WHERE drug_id = ? AND is_active = 1',
          [drug_id]
        );

        if (!drug) {
          errors.push({ drug_id, message: 'Drug not found' });
          continue;
        }

        if (drug.quantity_in_stock < quantity) {
          errors.push({ drug_id, drug_name: drug.drug_name, message: `Insufficient stock. Available: ${drug.quantity_in_stock}` });
          continue;
        }

        await connection.query(
          'UPDATE pharmacy_inventory SET quantity_in_stock = quantity_in_stock - ? WHERE drug_id = ?',
          [quantity, drug_id]
        );

        await connection.query(
          `INSERT INTO dispensing_items (dispense_id, drug_id, quantity, dosage_instructions)
           VALUES (?, ?, ?, ?)`,
          [dispense_id, drug_id, quantity, dosage_instructions || null]
        );

        await connection.query(
          `INSERT INTO stock_log (drug_id, quantity_change, reason, performed_by, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [drug_id, -quantity, `Dispensed to patient ${patient_id}`, pharmacist_id]
        );

        dispensedItems.push({
          drug_id,
          drug_name: drug.drug_name,
          quantity,
          dispense_id
        });
      }

      if (errors.length > 0 && dispensedItems.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'No items could be dispensed', errors });
      }

      await connection.commit();

      res.json({
        success: true,
        dispenseId: dispense_id,
        items: dispensedItems,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('dispenseMedication error:', error);
    res.status(500).json({ success: false, message: 'Failed to dispense medication' });
  }
}

module.exports = {
  getInventory,
  addDrug,
  updateStock,
  dispenseMedication
};