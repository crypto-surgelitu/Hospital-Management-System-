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

function NewInvoiceModal({ open, onClose, onSubmit, loading }) {
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: '' }]);

  useEffect(() => {
    if (open) {
      setPatientSearch('');
      setSearchResults([]);
      setSelectedPatient(null);
      setItems([{ description: '', quantity: 1, unit_price: '' }]);
    }
  }, [open]);

  useEffect(() => {
    if (patientSearch.length > 2) {
      api.get(`/patients/search?q=${encodeURIComponent(patientSearch)}`).then(res => {
        if (res.data.success) setSearchResults(res.data.patients);
      }).catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [patientSearch]);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)), 0);

  const handleSubmit = () => {
    if (!selectedPatient || items.filter(i => i.description && i.quantity > 0).length === 0) return;
    onSubmit({
      patient_id: selectedPatient.id,
      items: items.filter(i => i.description && i.quantity > 0)
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">New Invoice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
            <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg mt-1 max-h-32 overflow-y-auto">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(p.full_name); setSearchResults([]); }} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">{p.full_name}</div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Line Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description" className="flex-1 px-2 py-2 border border-slate-300 rounded-lg text-sm" />
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-sm" />
                <input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} placeholder="Price" className="w-24 px-2 py-2 border border-slate-300 rounded-lg text-sm" />
                {items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">×</button>}
              </div>
            ))}
            <button onClick={addItem} className="text-sm text-violet-600 hover:underline">+ Add another item</button>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-200">
            <span className="text-sm font-medium text-slate-700">Total:</span>
            <span className="text-lg font-bold text-slate-900">KES {total.toFixed(2)}</span>
          </div>

          <div className="pt-4 flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !selectedPatient} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">Create Invoice</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ open, onClose, onSubmit, loading, invoice }) {
  const [amount, setAmount] = useState('');
  const [payment_method, setPaymentMethod] = useState('cash');
  const [reference_number, setReferenceNumber] = useState('');

  useEffect(() => {
    if (open && invoice) {
      const remaining = invoice.total - (invoice.amount_paid || 0);
      setAmount(remaining.toFixed(2));
      setPaymentMethod('cash');
      setReferenceNumber('');
    }
  }, [open, invoice]);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onSubmit({ amount_paid: parseFloat(amount), payment_method, reference_number });
  };

  if (!open || !invoice) return null;

  const remaining = invoice.total - (invoice.amount_paid || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Record Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">Invoice: {invoice.invoice_number}</p>
            <p className="text-xs text-slate-500">Total: KES {invoice.total?.toFixed(2)} | Paid: KES {(invoice.amount_paid || 0).toFixed(2)} | Due: KES {remaining.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select value={payment_method} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="insurance">Insurance</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
            <input type="text" value={reference_number} onChange={e => setReferenceNumber(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="pt-4 flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !amount} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">Record Payment</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceDrawer({ open, onClose, invoice, items, payments, onRecordPayment, loading }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => document.body.style.overflow = 'unset';
  }, [open]);

  if (!open || !invoice) return null;

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    paid: 'bg-green-50 text-green-700 border-green-200',
    partial: 'bg-orange-50 text-orange-700 border-orange-200',
    waived: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => {
    window.print();
  };

  const remaining = invoice.total - (invoice.amount_paid || 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="print:hidden space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{invoice.invoice_number}</p>
                <p className="text-sm text-slate-500">{invoice.patient_name}</p>
                <p className="text-xs text-slate-400">{formatDate(invoice.created_at)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-sm font-bold text-slate-900">KES {invoice.total?.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Paid</p>
                <p className="text-sm font-bold text-green-600">KES {(invoice.amount_paid || 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Due</p>
                <p className="text-sm font-bold text-red-600">KES {remaining.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {remaining > 0 && (
                <button onClick={() => setShowPaymentModal(true)} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
                  Record Payment
                </button>
              )}
              <button onClick={handlePrint} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                Print
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Line Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs font-medium text-slate-500">Description</th>
                  <th className="text-right py-2 text-xs font-medium text-slate-500">Qty</th>
                  <th className="text-right py-2 text-xs font-medium text-slate-500">Price</th>
                  <th className="text-right py-2 text-xs font-medium text-slate-500">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">KES {parseFloat(item.unit_price || 0).toFixed(2)}</td>
                    <td className="py-2 text-right">KES {parseFloat(item.subtotal || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments?.length > 0 && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Payment History</h3>
              <div className="space-y-2">
                {payments.map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">KES {payment.amount_paid?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{payment.payment_method} {payment.reference_number ? `• ${payment.reference_number}` : ''}</p>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(payment.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSubmit={onRecordPayment} loading={loading} invoice={invoice} />
    </div>
  );
}

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  partial: 'bg-orange-50 text-orange-700 border-orange-200',
  waived: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newInvoiceModal, setNewInvoiceModal] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, invoice: null, items: [], payments: [] });

  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing?limit=100');
      if (res.data.success) {
        setInvoices(res.data.invoices);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load invoices' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = async (data) => {
    setActionLoading(true);
    try {
      const res = await api.post('/billing', data);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Invoice created successfully' });
        setNewInvoiceModal(false);
        fetchInvoices();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create invoice' });
    } finally {
      setActionLoading(false);
    }
  };

  const openInvoiceDrawer = async (invoice) => {
    try {
      const res = await api.get(`/billing/${invoice.id}`);
      if (res.data.success) {
        setDrawer({ open: true, invoice: res.data.invoice, items: res.data.items, payments: res.data.payments });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load invoice details' });
    }
  };

  const handleRecordPayment = async (paymentData) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/billing/${drawer.invoice.id}/payment`, paymentData);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Payment recorded successfully' });
        setDrawer({ open: false, invoice: null, items: [], payments: [] });
        fetchInvoices();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to record payment' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Manage invoices and payments</p>
        </div>
        {(isAdmin || isReceptionist) && (
          <button onClick={() => setNewInvoiceModal(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
            + New Invoice
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Invoice #</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Patient</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Date</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Total</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No invoices found</td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{inv.patient_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(inv.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">KES {inv.total?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openInvoiceDrawer(inv)} className="text-violet-600 hover:text-violet-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewInvoiceModal open={newInvoiceModal} onClose={() => setNewInvoiceModal(false)} onSubmit={handleCreateInvoice} loading={actionLoading} />
      <InvoiceDrawer open={drawer.open} onClose={() => setDrawer({ open: false, invoice: null, items: [], payments: [] })} invoice={drawer.invoice} items={drawer.items} payments={drawer.payments} onRecordPayment={handleRecordPayment} loading={actionLoading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}