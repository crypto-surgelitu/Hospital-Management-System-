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

function ResultsModal({ open, onClose, onSubmit, loading, request }) {
  const [results, setResults] = useState('');

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setResults(request?.results || '');
      });
    }
  }, [open, request]);

  const handleSubmit = () => {
    if (!results.trim()) return;
    onSubmit(results);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Enter Lab Results</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600"><span className="font-medium">Patient:</span> {request?.patient_name}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Test:</span> {request?.test_type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Results / Clinical Findings</label>
            <textarea value={results} onChange={e => setResults(e.target.value)} rows={6} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" placeholder="Enter clinical findings, values, and observations..." />
          </div>
          <div className="pt-2 flex gap-3">
            <button onClick={handleSubmit} disabled={loading || !results.trim()} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50">Save & Complete</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}



const priorityLabels = {
  routine: 'Routine',
  urgent: 'Urgent',
  stat: 'STAT'
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}



export default function Lab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resultsModal, setResultsModal] = useState({ open: false, request: null });

  const isLab = user?.role === 'lab';

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending' ? 'pending' : 'completed';
      const res = await api.get(`/lab?status=${status}&limit=100`);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load lab requests' });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSpecimenCollect = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/lab/${id}/specimen`, { specimen_collected: true });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Specimen marked as collected' });
        fetchRequests();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to update specimen status' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResultsSubmit = async (results) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/lab/${resultsModal.request.id}/results`, { results });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Results saved successfully' });
        setResultsModal({ open: false, request: null });
        fetchRequests();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to save results' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Laboratory</h1>
          <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Manage lab test requests and results</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-[var(--color-surface-low)] rounded-[12px] inline-flex">
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wider rounded-[10px] transition-all duration-300 ${activeTab === 'pending' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'}`}>
            Pending Requests
          </button>
          <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wider rounded-[10px] transition-all duration-300 ${activeTab === 'completed' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink-900)]'}`}>
            Completed Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-5 bg-slate-100 rounded-lg w-1/3 mb-3"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            </Card>
          ))
        ) : requests.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[var(--color-text-muted)] font-medium bg-[var(--color-surface-low)] rounded-[16px] ghost-border">
            {activeTab === 'pending' ? 'No pending lab requests' : 'No completed results'}
          </div>
        ) : (
          requests.map(req => (
            <Card key={req.id} className="hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-[var(--color-ink-900)] text-base">{req.patient_name}</p>
                  <p className="text-[13px] font-medium text-[var(--color-text-muted)] mt-0.5">{req.test_type}</p>
                </div>
                <Badge variant={req.priority === 'stat' ? 'danger' : req.priority === 'urgent' ? 'warning' : 'default'}>
                  {priorityLabels[req.priority] || req.priority}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-ink-900)] bg-[var(--color-surface-low)] p-2.5 rounded-[10px] mb-3 shadow-inner">
                <i className="bi bi-person-badge text-[var(--color-text-muted)]"></i>
                <span className="font-mono">Req: {req.requested_by_name}</span>
                <span className="mx-1 opacity-40">•</span>
                <span className="font-mono opacity-80">{formatDate(req.created_at)}</span>
              </div>

              {req.notes && (
                <p className="text-[13px] text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed">
                  {req.notes}
                </p>
              )}

              {activeTab === 'pending' && isLab && (
                <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-outline-variant)]/30 mt-auto">
                  {!req.specimen_collected ? (
                    <Button variant="secondary" size="sm" onClick={() => handleSpecimenCollect(req.id)} disabled={actionLoading} className="flex-1 px-3">
                      Mark Collected
                    </Button>
                  ) : (
                    <span className="flex-1 text-[11px] text-[var(--color-primary-container)] font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="bi bi-check-circle-fill"></i> Collected
                    </span>
                  )}
                  <Button variant="primary" size="sm" onClick={() => setResultsModal({ open: true, request: req })} className="px-4">
                    Enter Results
                  </Button>
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="pt-4 border-t border-[var(--color-outline-variant)]/30 mt-auto">
                  <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Results</div>
                  <div className="text-[13px] text-[var(--color-ink-900)] bg-[var(--color-surface-low)] p-3 rounded-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto ghost-border">
                    {req.results || 'No results recorded'}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] font-bold mt-3 text-right opacity-70">
                    Completed • {formatDate(req.completed_at)}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <ResultsModal open={resultsModal.open} onClose={() => setResultsModal({ open: false, request: null })} onSubmit={handleResultsSubmit} loading={actionLoading} request={resultsModal.request} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}