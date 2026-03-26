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

function ResultsModal({ open, onClose, onSubmit, loading, request }) {
  const [results, setResults] = useState('');

  useEffect(() => {
    if (open) setResults(request?.results || '');
  }, [open, request]);

  const handleSubmit = () => {
    if (!results.trim()) return;
    onSubmit(results);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
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

const priorityColors = {
  routine: 'bg-slate-100 text-slate-600 border-slate-200',
  urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  stat: 'bg-red-50 text-red-700 border-red-200'
};

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

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === 'pending' ? 'pending' : 'completed';
      const res = await api.get(`/lab?status=${status}&limit=100`);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save results' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laboratory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage lab test requests and results</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-1 border-b border-slate-200">
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Pending Requests
          </button>
          <button onClick={() => setActiveTab('completed')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Completed Results
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {activeTab === 'pending' ? 'No pending lab requests' : 'No completed results'}
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{req.patient_name}</p>
                  <p className="text-sm text-slate-500">{req.test_type}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColors[req.priority]}`}>
                  {priorityLabels[req.priority] || req.priority}
                </span>
              </div>
              
              <div className="text-xs text-slate-400 mb-3">
                Requested by {req.requested_by_name} • {formatDate(req.created_at)}
              </div>

              {req.notes && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-3">
                  {req.notes}
                </div>
              )}

              {activeTab === 'pending' && isLab && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {!req.specimen_collected ? (
                    <button onClick={() => handleSpecimenCollect(req.id)} disabled={actionLoading} className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50">
                      Mark Specimen Collected
                    </button>
                  ) : (
                    <span className="text-xs text-violet-600 font-medium">Specimen collected • {formatDateShort(req.specimen_collected_at)}</span>
                  )}
                  <button onClick={() => setResultsModal({ open: true, request: req })} className="px-3 py-1.5 text-cyan-600 border border-cyan-200 rounded-lg text-xs font-medium hover:bg-cyan-50">
                    Enter Results
                  </button>
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Results:</div>
                  <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {req.results || 'No results recorded'}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Completed • {formatDate(req.completed_at)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ResultsModal open={resultsModal.open} onClose={() => setResultsModal({ open: false, request: null })} onSubmit={handleResultsSubmit} loading={actionLoading} request={resultsModal.request} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}