const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { VALID_ROLES } = require('../middleware/auth');

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Pediatrics', 'Surgery', 'Emergency', 'Orthopedics', 'Neurology', 'Oncology', 'Gynecology', 'Urology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology', 'Pathology', 'ICU', 'Nursing', 'Pharmacy', 'Laboratory', 'Front Desk'];

// ─── List all users ──────────────────────────────────────────
async function getUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, username, role, department, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}

// ─── Get doctors (for appointment booking) ───────────────────
async function getDoctors(req, res) {
  try {
    const [doctors] = await pool.query(
      `SELECT id, full_name, department
       FROM users WHERE role = 'doctor' AND is_active = 1
       ORDER BY full_name ASC`
    );
    res.json({ success: true, doctors });
  } catch (error) {
    console.error('getDoctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
}

// ─── Create user ─────────────────────────────────────────────
async function createUser(req, res) {
  try {
    const { full_name, username, password, role, department } = req.body;

    if (!full_name || !username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, username, password_hash, role, department)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, username, password_hash, role, department || null]
    );

    const [newUser] = await pool.query(
      'SELECT id, full_name, username, role, department, is_active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, user: newUser[0] });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
}

// ─── Update user ─────────────────────────────────────────────
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { full_name, role, department, is_active, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let query = 'UPDATE users SET full_name = ?, role = ?, department = ?, is_active = ? WHERE id = ?';
    let params = [full_name, role, department || null, is_active !== undefined ? is_active : 1, id];

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET full_name = ?, role = ?, department = ?, is_active = ?, password_hash = ? WHERE id = ?';
      params = [full_name, role, department || null, is_active !== undefined ? is_active : 1, password_hash, id];
    }

    await pool.query(query, params);

    const [updated] = await pool.query(
      'SELECT id, full_name, username, role, department, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
}

// ─── Toggle user active status ───────────────────────────────
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, is_active FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = existing[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
}

// ─── Generate random users ───────────────────────────────────
async function generateRandomUsers(req, res) {
  try {
    const { count = 5 } = req.body;
    const numUsers = Math.min(Math.max(parseInt(count, 10) || 5, 1), 50);
    
    const generated = [];
    const usedUsernames = new Set();
    
    const [existing] = await pool.query('SELECT username FROM users');
    existing.forEach(u => usedUsernames.add(u.username.toLowerCase()));

    for (let i = 0; i < numUsers; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      
      let username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      let suffix = 1;
      while (usedUsernames.has(username)) {
        username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}`;
        suffix++;
      }
      usedUsernames.add(username);
      
      const role = VALID_ROLES[Math.floor(Math.random() * VALID_ROLES.length)];
      const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const password = Math.random().toString(36).slice(-8);
      const password_hash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users (full_name, username, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`,
        [fullName, username, password_hash, role, department]
      );

      generated.push({ id: result.insertId, full_name: fullName, username, role, department, temp_password: password });
    }

    res.status(201).json({ success: true, message: `Generated ${generated.length} random users`, users: generated });
  } catch (error) {
    console.error('generateRandomUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate users' });
  }
}

module.exports = { getUsers, getDoctors, createUser, updateUser, toggleUserStatus, generateRandomUsers };
