import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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

  const resetForm = useCallback(() => {
    if (open) setForm({ drug_name: '', generic_name: '', category: '', unit: '', quantity_in_stock: 0, reorder_level: 0, unit_price: '' });
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        resetForm();
      });
    }
  }, [open, resetForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto z-[10000]">
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

  const resetRestock = useCallback(() => {
    if (open) { setQuantity(''); setReason('Restock'); }
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        resetRestock();
      });
    }
  }, [open, resetRestock]);

  const handleSubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) return;
    onSubmit({ quantity_change: parseInt(quantity), reason });
  };

  if (!open || !drug) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-[10000]">
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

function DispenseModal({ open, onClose, onSubmit, loading, drugs, onSearchPatients: onSearchPatientsProp, searchResults, onSelectPatient, selectedPatient }) {
  const [items, setItems] = useState([{ drug_id: '', quantity: 1, dosage_instructions: '' }]);
  const [searchQuery, setSearchQuery] = useState('');

  const resetItems = useCallback(() => {
    if (open) setItems([{ drug_id: '', quantity: 1, dosage_instructions: '' }]);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        resetItems();
      });
    }
  }, [open, resetItems]);

  const onSearchPatients = useCallback((query) => {
    if (onSearchPatientsProp) onSearchPatientsProp(query);
  }, [onSearchPatientsProp]);

  useEffect(() => {
    if (searchQuery.length > 2) onSearchPatients(searchQuery);
  }, [searchQuery, onSearchPatients]);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto z-[10000]">
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
                  {drugs?.map(d => <option key={d.drug_id} value={d.drug_id}>{d.drug_name} (Stock: {d.quantity_in_stock})</option>)}
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

  const isPharmacist = user?.role === 'pharmacy';
  const isAdmin = user?.role === 'admin';

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/drugs');
      if (res.data.success) {
        setDrugs(res.data.drugs);
        setLowStockCount(res.data.lowStockCount);
      }
    } catch {
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
      const msg = err.response?.data?.message || 'Failed to add drug';
      setToast({ type: 'error', message: msg });
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
    } catch { setPatientSearch([]); }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-[12px] flex items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill text-[var(--color-error)] text-lg"></i>
          <span className="text-sm font-medium text-[var(--color-error)]">{lowStockCount} drug(s) are low on stock</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Pharmacy</h1>
          <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Manage drug inventory and dispensing</p>
        </div>
        <div className="flex gap-3">
          {(isPharmacist || isAdmin) && (
            <Button onClick={() => setAddModal(true)} icon="bi-plus-lg" variant="secondary">
              Add New Drug
            </Button>
          )}
          {isPharmacist && (
            <Button onClick={() => setDispenseModal(true)} icon="bi-prescription2">
              Dispense
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-[var(--color-surface-low)] rounded-[12px] inline-flex">
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wider rounded-[10px] transition-all duration-300 ${activeTab === 'inventory' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'}`}>
            Inventory
          </button>
        </div>
      </div>

      <Card noPadding className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-low)] border-b border-black/5">
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Drug Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Reorder</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : !drugs || drugs.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-muted)]">No drugs in inventory</td></tr>
              ) : (
                drugs.map(drug => (
                  <tr key={drug.drug_id} className={`hover:bg-[var(--color-surface-low)] transition-colors ${drug.low_stock ? 'bg-[var(--color-error)]/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-ink-900)]">{drug.drug_name}</p>
                        <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">{drug.generic_name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{drug.category || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono font-bold ${drug.low_stock ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-900)]'}`}>
                        {drug.quantity_in_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[var(--color-text-muted)] font-bold">{drug.unit || '—'}</td>
                    <td className="px-6 py-4 text-[13px] text-[var(--color-text-muted)] font-bold">{drug.reorder_level}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[var(--color-primary-container)]">KES {parseFloat(drug.unit_price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {(isPharmacist || isAdmin) && (
                        <Button variant="secondary" size="sm" onClick={() => setRestockModal({ open: true, drug })}>
                          Restock
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDrugModal open={addModal} onClose={() => setAddModal(false)} onSubmit={handleAddDrug} loading={actionLoading} />
      <RestockModal open={restockModal.open} onClose={() => setRestockModal({ open: false, drug: null })} onSubmit={handleRestock} loading={actionLoading} drug={restockModal.drug} />
      <DispenseModal open={dispenseModal} onClose={() => { setDispenseModal(false); setSelectedPatient(null); }} onSubmit={handleDispense} loading={actionLoading} drugs={drugs} onSearchPatients={handleSearchPatients} searchResults={patientSearch} onSelectPatient={(p) => { setSelectedPatient(p); setPatientSearch([]); }} selectedPatient={selectedPatient} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}