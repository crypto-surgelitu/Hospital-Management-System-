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

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function PatientDrawer({ patient, onClose, onUpdate, onDelete, canEdit, canDelete, loading }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', emergency_contact: '' });

  const resetForm = useCallback(() => {
    if (patient) {
      setForm({ full_name: patient.full_name || '', phone: patient.phone || '', address: patient.address || '', emergency_contact: patient.emergency_contact || '' });
    }
  }, [patient]);

  useEffect(() => {
    if (patient) {
      requestAnimationFrame(() => {
        resetForm();
      });
    }
  }, [patient, resetForm]);

  const handleSave = async () => {
    await onUpdate(patient.patient_id, form);
    setEditMode(false);
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Patient Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-1">Full Name</p>
            {editMode ? (
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            ) : <p className="text-slate-900 font-medium">{patient.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase mb-1">Date of Birth</p>
              <p className="text-slate-900">{patient.dob ? new Date(patient.dob).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase mb-1">Gender</p>
              <p className="text-slate-900 capitalize">{patient.gender || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-1">Phone</p>
            {editMode ? (
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            ) : <p className="text-slate-900">{patient.phone}</p>}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-1">National ID</p>
            <p className="text-slate-900 font-mono">{patient.national_id}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-1">Address</p>
            {editMode ? (
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={2} />
            ) : <p className="text-slate-900">{patient.address || '—'}</p>}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-1">Emergency Contact</p>
            {editMode ? (
              <input value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            ) : <p className="text-slate-900">{patient.emergency_contact || '—'}</p>}
          </div>

          {patient.recentAppointments?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase mb-3">Recent Appointments</p>
              <div className="space-y-2">
                {patient.recentAppointments.map(apt => (
                  <div key={apt.appointment_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{new Date(apt.appointment_date || apt.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{apt.appointment_time || '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === 'Completed' ? 'bg-green-50 text-green-600' : apt.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                    }`}>{apt.status || 'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
          {editMode ? (
            <>
              <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Save</button>
              <button onClick={() => setEditMode(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
            </>
          ) : (
            <>
              {canEdit && <button onClick={() => setEditMode(true)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Edit</button>}
              {canDelete && <button onClick={onDelete} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">Delete</button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NewPatientModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ full_name: '', dob: '', gender: '', phone: '', national_id: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">New Patient</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
              <input type="date" required value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
              <select required value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">National ID *</label>
            <input required value={form.national_id} onChange={e => setForm({ ...form, national_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Create Patient</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor';
  const canEdit = user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor';
  const canDelete = user?.role === 'admin';

  const fetchPatients = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const endpoint = searchTerm ? `/patients/search?q=${encodeURIComponent(searchTerm)}` : `/patients?page=${pageNum}&limit=20`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setPatients(searchTerm ? res.data.patients : res.data.patients);
        if (!searchTerm) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages(1);
        }
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPatients(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  useEffect(() => {
    fetchPatients(page, search);
  }, [page, search, fetchPatients]);

  const fetchPatientDetails = async (id) => {
    try {
      const res = await api.get(`/patients/${id}`);
      if (res.data.success) {
        setSelectedPatient(res.data.patient);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load patient details' });
    }
  };

  const fetchFullHistory = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/patients/${id}/history`);
      if (res.data.success) {
        setPatientHistory(res.data.history);
        setShowHistoryModal(true);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load history' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.post('/patients', formData);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Patient created successfully' });
        setShowNewModal(false);
        fetchPatients(page, search);
      } else {
        setToast({ type: 'error', message: res.data.message || 'Failed to create patient' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create patient' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/patients/${id}`, formData);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Patient updated successfully' });
        setSelectedPatient(res.data.patient);
        fetchPatients(page, search);
      } else {
        setToast({ type: 'error', message: res.data.message || 'Failed to update patient' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to update patient' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const patient = deleteDialog.patient;
    setActionLoading(true);
    try {
      const res = await api.delete(`/patients/${patient.patient_id}`);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Patient archived' });
        setDeleteDialog({ open: false, patient: null });
        setSelectedPatient(null);
        fetchPatients(page, search);
      } else {
        setToast({ type: 'error', message: res.data.message || 'Failed to archive patient' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to archive patient' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '—';

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Patients</h1>
          <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Manage patient records</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowNewModal(true)} icon="bi-plus-lg">
            New Patient
          </Button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, national ID, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <Card noPadding className="mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-low)] border-b border-black/5">
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">DOB</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">National ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td colSpan={6} className="px-4 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div></td>
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">No patients found</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p.patient_id} className="hover:bg-[var(--color-surface-low)] transition-colors cursor-pointer group" onClick={() => fetchPatientDetails(p.patient_id)}>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--color-ink-900)]">{p.full_name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">{formatDate(p.date_of_birth)}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] capitalize">{p.gender || '—'}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">{p.phone}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono">{p.national_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); fetchPatientDetails(p.patient_id); }} className="text-[var(--color-primary)] hover:text-[var(--color-primary-container)] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">View <i className="bi bi-eye ml-1"></i></button>
                      <button onClick={(e) => { e.stopPropagation(); fetchFullHistory(p.patient_id); }} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">History <i className="bi bi-clock-history ml-1"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {!search && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={handleUpdate}
          onDelete={() => setDeleteDialog({ open: true, patient: selectedPatient })}
          canEdit={canEdit}
          canDelete={canDelete}
          loading={actionLoading}
        />
      )}

      <NewPatientModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Archive Patient"
        message="Are you sure you want to archive this patient? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, patient: null })}
      />

      {showHistoryModal && patientHistory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={() => setShowHistoryModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto z-[10000]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Patient History</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {patientHistory.appointments?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Appointments</p>
                  <div className="space-y-2">
                    {patientHistory.appointments.map(apt => (
                      <div key={apt.appointment_id} className="p-3 bg-slate-50 rounded-lg flex justify-between">
                        <div>
                          <p className="text-sm font-medium">{new Date(apt.appointment_date || apt.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{apt.doctor_name}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{apt.status || 'pending'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {patientHistory.labResults?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Lab Results</p>
                  <div className="space-y-2">
                    {patientHistory.labResults.map(lr => (
                      <div key={lr.lab_request_id} className="p-3 bg-slate-50 rounded-lg flex justify-between">
                        <div>
                          <p className="text-sm font-medium">{lr.test_type}</p>
                          <p className="text-xs text-slate-500">{new Date(lr.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${lr.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{lr.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {patientHistory.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Prescriptions</p>
                  <div className="space-y-2">
                    {patientHistory.prescriptions.map(rx => (
                      <div key={rx.referral_id} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium">{rx.item_description}</p>
                        <p className="text-xs text-slate-500">Qty: {rx.quantity} - {new Date(rx.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {patientHistory.bills?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Billing</p>
                  <div className="space-y-2">
                    {patientHistory.bills.map(bill => (
                      <div key={bill.bill_id} className="p-3 bg-slate-50 rounded-lg flex justify-between">
                        <div>
                          <p className="text-sm font-medium">KES {bill.total_amount}</p>
                          <p className="text-xs text-slate-500">{new Date(bill.bill_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${bill.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{bill.payment_status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!patientHistory.appointments?.length && !patientHistory.labResults?.length && !patientHistory.prescriptions?.length && !patientHistory.bills?.length) && (
                <p className="text-center text-slate-400 py-4">No history found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}