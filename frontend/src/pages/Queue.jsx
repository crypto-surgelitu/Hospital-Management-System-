import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';

export default function Queue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', priority: 'normal', chief_complaint: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/queue');
      if (res.data.success) {
        setQueue(res.data.queue);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const searchPatients = async (query) => {
    if (query.length < 2) {
      setPatients([]);
      return;
    }
    try {
      const res = await api.get(`/patients/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      console.error('Failed to search patients:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchPatients(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddToQueue = async () => {
    if (!form.patient_id) return;
    setSubmitting(true);
    try {
      await api.post('/queue', form);
      setShowAddModal(false);
      setForm({ patient_id: '', doctor_id: '', priority: 'normal', chief_complaint: '' });
      setSearchQuery('');
      setPatients([]);
      fetchQueue();
    } catch (err) {
      console.error('Failed to add to queue:', err);
      alert(err.response?.data?.message || 'Failed to add to queue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallPatient = async (queueId) => {
    try {
      await api.patch(`/queue/${queueId}/call`);
      fetchQueue();
    } catch (err) {
      console.error('Failed to call patient:', err);
    }
  };

  const handleRemove = async (queueId) => {
    if (!confirm('Remove this patient from queue?')) return;
    try {
      await api.delete(`/queue/${queueId}`);
      fetchQueue();
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const inProgressQueue = queue.filter(q => q.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Queue</h1>
          <p className="text-slate-600">Manage patient waiting queue</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
        >
          + Add to Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{waitingQueue.length}</p>
            <p className="text-sm text-yellow-700">Waiting</p>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{inProgressQueue.length}</p>
            <p className="text-sm text-blue-700">In Progress</p>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{queue.filter(q => q.status === 'completed').length}</p>
            <p className="text-sm text-green-700">Completed Today</p>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </Card>
      ) : queue.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-slate-500">
            No patients in queue
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wait Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((entry, idx) => (
                <tr key={entry.queue_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{entry.queue_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.patient_name}</p>
                    {entry.chief_complaint && (
                      <p className="text-xs text-slate-500">{entry.chief_complaint}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{entry.doctor_name || '-'}</td>
                  <td className="px-4 py-3">
                    {entry.priority === 'urgent' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Urgent</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Normal</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{entry.wait_time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      entry.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                      entry.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {entry.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {entry.status === 'waiting' && (
                      <button
                        onClick={() => handleCallPatient(entry.queue_id)}
                        className="text-blue-600 hover:underline text-sm mr-3"
                      >
                        Call
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(entry.queue_id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto z-[10000]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Patient to Queue</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Search *</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                {patients.length > 0 && (
                  <div className="border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                    {patients.map(p => (
                      <div
                        key={p.patient_id}
                        onClick={() => {
                          setForm({ ...form, patient_id: p.patient_id });
                          setSelectedPatient(p);
                          setPatients([]);
                          setSearchQuery(p.full_name);
                        }}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        {p.full_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Doctor</label>
                <select
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Auto-assign</option>
                  {doctors.map(d => (
                    <option key={d.user_id} value={d.user_id}>{d.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint</label>
                <textarea
                  value={form.chief_complaint}
                  onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                  rows={3}
                  placeholder="Why is the patient here?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={handleAddToQueue}
                disabled={submitting || !form.patient_id}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add to Queue'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}