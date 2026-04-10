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

function NewAppointmentModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', notes: '' });
  const [doctors, setDoctors] = useState([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [patientResults, setPatientResults] = useState([]);

  useEffect(() => {
    if (open) {
      api.get('/admin/doctors').then(res => {
        if (res.data.success) setDoctors(res.data.doctors);
      }).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (searchPatient.length > 2) {
      api.get(`/patients/search?q=${encodeURIComponent(searchPatient)}`).then(res => {
        if (res.data.success) setPatientResults(res.data.patients);
      });
    } else {
      const timer = setTimeout(() => setPatientResults([]), 0);
      return () => clearTimeout(timer);
    }
  }, [searchPatient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">New Appointment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
            <input type="text" value={searchPatient} onChange={e => setSearchPatient(e.target.value)} placeholder="Search patient..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            {patientResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg mt-1 max-h-32 overflow-y-auto">
                {patientResults.map(p => (
                  <div key={p.id} onClick={() => { setForm({ ...form, patient_id: p.id }); setSearchPatient(p.full_name); setPatientResults([]); }} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">{p.full_name}</div>
                ))}
              </div>
            )}
            {!form.patient_id && <p className="text-xs text-red-500 mt-1">Please select a patient</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor *</label>
            <select required value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input type="date" required value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <input type="time" required value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading || !form.patient_id} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">Book Appointment</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotesModal({ open, onClose, onSubmit, currentNotes, loading }) {
  const [notes, setNotes] = useState(currentNotes || '');

  const handleSubmit = () => {
    onSubmit(notes);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Doctor's Notes</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Add notes about the appointment..." />
          <div className="pt-4 flex gap-3">
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">Save Notes</button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [notesModal, setNotesModal] = useState({ open: false, appointment: null });
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreate = ['admin', 'receptionist', 'doctor'].includes(user?.role);
  const canUpdateStatus = ['admin', 'doctor'].includes(user?.role);
  const isDoctor = user?.role === 'doctor';

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments?date=${selectedDate}`);
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load appointments' });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Appointment booked successfully' });
        setShowNewModal(false);
        fetchAppointments();
      } else {
        setToast({ type: 'error', message: res.data.message || 'Failed to book appointment' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to book appointment' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Status updated' });
        fetchAppointments();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to update status' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotesSubmit = async (notes) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/appointments/${notesModal.appointment.id}/notes`, { notes });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Notes saved' });
        setNotesModal({ open: false, appointment: null });
        fetchAppointments();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to save notes' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (time) => time?.substring(0, 5) || '';

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Appointments</h1>
          <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Manage patient appointments</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowNewModal(true)} icon="bi-plus-lg">
            New Appointment
          </Button>
        )}
      </div>

      <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-[16px] ghost-border shadow-sm inline-flex">
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 border border-[var(--color-outline-variant)] rounded-[10px] text-sm focus:ring-[var(--color-primary)] font-mono min-w-[150px]" />
        </div>
        <div className="w-px h-8 bg-[var(--color-outline-variant)]/30"></div>
        <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="text-sm text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-container)] transition-colors px-2">Today</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-5 bg-slate-100 rounded-lg w-1/2 mb-3"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
            </Card>
          ))
        ) : appointments.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[var(--color-text-muted)] font-medium bg-[var(--color-surface-low)] rounded-[16px] ghost-border">No appointments scheduled for this date.</div>
        ) : (
          appointments.map(apt => (
            <Card key={apt.id} className="hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-[var(--color-ink-900)] text-base">{apt.patient_name}</p>
                  <p className="text-[13px] font-medium text-[var(--color-text-muted)] mt-0.5">Dr. {apt.doctor_name}</p>
                </div>
                <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'pending' ? 'warning' : apt.status === 'in-progress' ? 'info' : 'danger'}>{apt.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-ink-900)] bg-[var(--color-surface-low)] p-2.5 rounded-[10px] mb-4 shadow-inner">
                <i className="bi bi-clock text-[var(--color-primary)]"></i>
                <span className="font-mono">{formatTime(apt.appointment_time)}</span>
              </div>
              {apt.notes && <p className="text-[13px] text-[var(--color-text-muted)] mb-4 line-clamp-2 leading-relaxed">{apt.notes}</p>}
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-outline-variant)]/30 mt-auto">
                {canUpdateStatus && (
                  <select value={apt.status} onChange={e => handleStatusChange(apt.id, e.target.value)} disabled={actionLoading} className="flex-1 px-3 py-2 text-[13px] font-medium border border-[var(--color-outline-variant)] rounded-[10px] bg-white focus:ring-[var(--color-primary)] cursor-pointer">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
                {isDoctor && apt.doctor_id === user.user_id && (
                  <Button size="sm" variant="secondary" onClick={() => setNotesModal({ open: true, appointment: apt })}>
                    Notes
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <NewAppointmentModal open={showNewModal} onClose={() => setShowNewModal(false)} onSubmit={handleCreate} loading={actionLoading} />
      <NotesModal open={notesModal.open} onClose={() => setNotesModal({ open: false, appointment: null })} onSubmit={handleNotesSubmit} currentNotes={notesModal.appointment?.notes} loading={actionLoading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}