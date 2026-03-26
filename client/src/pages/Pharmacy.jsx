import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-50 ${
      type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {message}
    </div>
  );
}

function AddDrugModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    drug_name: '', generic_name: '', category: '', unit: '', quantity_in_stock: 0, reorder_level: 0, unit_price: ''
  });

  useEffect(() => {
    if (open) setForm({ drug_name: '', generic_name: '', category: '', unit: '', quantity_in_stock: 0, reorder_level: 0, unit_price: '' });
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Add New Drug</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Drug Name *</label>
              <input required type="text" value={form.drug_name} onChange={e => setForm({ ...form, drug_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label>
              <input type="text" value={form.generic_name} onChange={e => setForm({ ...form, generic_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Select</option>
                <option>Antibiotic</option>
                <option>Analgesic</option>
                <option>Antimalaria</option>
                <option>Antiviral</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="e.g. tablets" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input required type="number" min="0" value={form.quantity_in_stock} onChange={e => setForm({ ...form, quantity_in_stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
              <input type="number" min="0" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (KES) *</label>
              <input required type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">Add Drug</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RestockModal({ open, onClose, onSubmit, loading, drug }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Restock');

  useEffect(() => {
    if (open) { setQuantity(''); setReason('Restock'); }
  }, [open, drug]);

  const handleSubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) return;
    onSubmit({ quantity_change: parseInt(quantity), reason });
  };

  if (!open || !drug) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Restock Drug</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{drug.drug_name}</p>
            <p className="text-xs text-slate-500">Current stock: {drug.quantity_in_stock} {drug.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Add</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option>Restock</option>
              <option>Return from ward</option>
              <option>Donation</option>
              <option>Other</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !quantity} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">Confirm Restock</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DispenseModal({ open, onClose, onSubmit, loading, drugs, onSearchPatients, searchResults, onSelectPatient, selectedPatient }) {
  const [items, setItems] = useState([{ drug_id: '', quantity: 1, dosage_instructions: '' }]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) setItems([{ drug_id: '', quantity: 1, dosage_instructions: '' }]);
  }, [open]);

  useEffect(() => {
    if (searchQuery.length > 2) onSearchPatients(searchQuery);
  }, [searchQuery]);

  const addItem = () => setItems([...items, { drug_id: '', quantity: 1, dosage_instructions: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!selectedPatient || items.filter(i => i.drug_id && i.quantity > 0).length === 0) return;
    onSubmit({ patient_id: selectedPatient.id, items: items.filter(i => i.drug_id && i.quantity > 0) });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Dispense Medication</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patient..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg mt-1 max-h-32 overflow-y-auto">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => onSelectPatient(p)} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">{p.full_name}</div>
                ))}
              </div>
            )}
            {selectedPatient && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                Selected: {selectedPatient.full_name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prescription Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <select value={item.drug_id} onChange={e => updateItem(idx, 'drug_id', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Select drug</option>
                  {drugs.map(d => <option key={d.drug_id} value={d.drug_id}>{d.drug_name} (Stock: {d.quantity_in_stock})</option>)}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} className="w-20 px-2 py-2 border border-slate-300 rounded-lg text-sm" />
                <input type="text" value={item.dosage_instructions} onChange={e => updateItem(idx, 'dosage_instructions', e.target.value)} placeholder="Dosage" className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm" />
                {items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">×</button>}
              </div>
            ))}
            <button onClick={addItem} className="text-sm text-emerald-600 hover:underline">+ Add another item</button>
          </div>

          <div className="pt-4 flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !selectedPatient} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">Dispense</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pharmacy() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [restockModal, setRestockModal] = useState({ open: false, drug: null });
  const [dispenseModal, setDispenseModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const isPharmacist = user?.role === 'pharmacist';
  const isAdmin = user?.role === 'admin';

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/drugs');
      if (res.data.success) {
        setDrugs(res.data.drugs);
        setLowStockCount(res.data.lowStockCount);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load inventory' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddDrug = async (form) => {
    setActionLoading(true);
    try {
      const res = await api.post('/pharmacy/drugs', form);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Drug added successfully' });
        setAddModal(false);
        fetchInventory();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add drug' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestock = async ({ quantity_change, reason }) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/pharmacy/drugs/${restockModal.drug.drug_id}/stock`, { quantity_change, reason });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Stock updated successfully' });
        setRestockModal({ open: false, drug: null });
        fetchInventory();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update stock' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispense = async ({ patient_id, items }) => {
    setActionLoading(true);
    try {
      const res = await api.post('/pharmacy/dispense', { patient_id, items });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Medication dispensed successfully' });
        setDispenseModal(false);
        setSelectedPatient(null);
        fetchInventory();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to dispense' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchPatients = async (q) => {
    try {
      const res = await api.get(`/patients/search?q=${encodeURIComponent(q)}`);
      if (res.data.success) setPatientSearch(res.data.patients);
    } catch (err) { setPatientSearch([]); }
  };

  return (
    <div className="p-6">
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="text-sm font-medium text-red-700">{lowStockCount} drug(s) are low on stock</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy</h1>
          <p className="text-sm text-slate-500 mt-1">Manage drug inventory and dispensing</p>
        </div>
        <div className="flex gap-2">
          {(isPharmacist || isAdmin) && (
            <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
              + Add New Drug
            </button>
          )}
          {isPharmacist && (
            <button onClick={() => setDispenseModal(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
              Dispense
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-1 border-b border-slate-200">
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Inventory
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Drug Name</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Category</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Stock</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Unit</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Reorder</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Price</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : drugs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No drugs in inventory</td></tr>
              ) : (
                drugs.map(drug => (
                  <tr key={drug.drug_id} className={`hover:bg-slate-50 ${drug.low_stock ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{drug.drug_name}</p>
                        <p className="text-xs text-slate-400">{drug.generic_name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{drug.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${drug.low_stock ? 'text-red-600' : 'text-slate-900'}`}>
                        {drug.quantity_in_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{drug.unit || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{drug.reorder_level}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">KES {parseFloat(drug.unit_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {(isPharmacist || isAdmin) && (
                        <button onClick={() => setRestockModal({ open: true, drug })} className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                          Restock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDrugModal open={addModal} onClose={() => setAddModal(false)} onSubmit={handleAddDrug} loading={actionLoading} />
      <RestockModal open={restockModal.open} onClose={() => setRestockModal({ open: false, drug: null })} onSubmit={handleRestock} loading={actionLoading} drug={restockModal.drug} />
      <DispenseModal open={dispenseModal} onClose={() => { setDispenseModal(false); setSelectedPatient(null); }} onSubmit={handleDispense} loading={actionLoading} drugs={drugs} onSearchPatients={handleSearchPatients} searchResults={patientSearch} onSelectPatient={(p) => { setSelectedPatient(p); setPatientSearch([]); }} selectedPatient={selectedPatient} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}