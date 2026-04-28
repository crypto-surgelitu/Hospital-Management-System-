import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';

export default function DoctorQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [showNurseModal, setShowNurseModal] = useState(false);
  
  const [labForm, setLabForm] = useState({ test_type: '', priority: 'routine' });
  const [labTestTypes, setLabTestTypes] = useState([]);
  const [drugsList, setDrugsList] = useState([]);
  const [pharmacyForm, setPharmacyForm] = useState({ drug_id: '', quantity: 1, dosage_instructions: '' });
  const [nurseForm, setNurseForm] = useState({ task_description: '', task_type: 'other', priority: 'normal' });

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

  const fetchLabTestTypes = async () => {
    try {
      const res = await api.get('/lab/types');
      if (res.data.success) {
        setLabTestTypes(res.data.types);
      }
    } catch (err) {
      console.error('Failed to fetch test types:', err);
    }
  };

  const fetchDrugsList = async () => {
    try {
      const res = await api.get('/pharmacy/drugs');
      if (res.data.success) {
        setDrugsList(res.data.drugs);
      }
    } catch (err) {
      console.error('Failed to fetch drugs:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchLabTestTypes();
    fetchDrugsList();
  }, []);

  const handleStartConsultation = async (queueId) => {
    try {
      await api.patch(`/queue/${queueId}/start`);
      fetchQueue();
    } catch (err) {
      console.error('Failed to start:', err);
    }
  };

  const handleComplete = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await api.patch(`/queue/${selectedPatient.queue_id}/complete`, {
        notes: consultationNotes
      });
      setSelectedPatient(null);
      setConsultationNotes('');
      fetchQueue();
    } catch (err) {
      console.error('Failed to complete:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLabReferral = async () => {
    if (!selectedPatient || !labForm.test_type) return;
    try {
      await api.post('/referrals/lab', {
        queue_id: selectedPatient.queue_id,
        patient_id: selectedPatient.patient_id,
        test_type: labForm.test_type,
        priority: labForm.priority
      });
      setShowLabModal(false);
      setLabForm({ test_type: '', priority: 'normal' });
      alert('Lab test ordered successfully');
    } catch (err) {
      console.error('Failed to order lab:', err);
    }
  };

  const handleCreatePharmacyReferral = async () => {
    if (!selectedPatient || !pharmacyForm.drug_id) return;
    try {
      await api.post('/referrals/pharmacy', {
        queue_id: selectedPatient.queue_id,
        patient_id: selectedPatient.patient_id,
        drug_id: pharmacyForm.drug_id,
        quantity: pharmacyForm.quantity,
        dosage_instructions: pharmacyForm.dosage_instructions
      });
      setShowPharmacyModal(false);
      setPharmacyForm({ drug_id: '', quantity: 1, dosage_instructions: '' });
      alert('Prescription created successfully');
    } catch (err) {
      console.error('Failed to create prescription:', err);
    }
  };

  const handleCreateNurseTask = async () => {
    if (!selectedPatient || !nurseForm.task_description) return;
    try {
      await api.post('/referrals/nurse', {
        queue_id: selectedPatient.queue_id,
        patient_id: selectedPatient.patient_id,
        task_description: nurseForm.task_description,
        task_type: nurseForm.task_type,
        priority: nurseForm.priority
      });
      setShowNurseModal(false);
      setNurseForm({ task_description: '', task_type: 'other', priority: 'normal' });
      alert('Nurse task assigned successfully');
    } catch (err) {
      console.error('Failed to assign nurse task:', err);
    }
  };

  const myQueue = queue.filter(q => q.doctor_id == user?.id || q.status === 'waiting');
  const activePatient = myQueue.find(q => q.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Queue</h1>
        <p className="text-slate-600">Examine and manage patients</p>
      </div>

      {activePatient ? (
        <Card className="border-emerald-500 border-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                In Progress
              </span>
              <h2 className="text-xl font-bold mt-2">{activePatient.patient_name}</h2>
              <p className="text-slate-500">Queue #{activePatient.queue_number}</p>
            </div>
            <button
              onClick={() => setSelectedPatient(activePatient)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              View Details
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8 text-slate-500">
            No patient in consultation
          </div>
        </Card>
      )}

      <div>
        <h3 className="font-semibold text-slate-700 mb-3">Waiting Patients</h3>
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse"></div>
            ))
          ) : myQueue.filter(q => q.status === 'waiting').length === 0 ? (
            <Card><div className="text-center py-6 text-slate-500">No patients waiting</div></Card>
          ) : (
            myQueue.filter(q => q.status === 'waiting').map(patient => (
              <Card key={patient.queue_id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{patient.patient_name}</p>
                  <p className="text-sm text-slate-500">{patient.chief_complaint || 'No complaint noted'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {patient.priority === 'urgent' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>
                    )}
                    <span className="text-xs text-slate-400">Wait: {patient.wait_time}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartConsultation(patient.queue_id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Start
                </button>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={() => setSelectedPatient(null)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto z-[10000] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-semibold">{selectedPatient.patient_name}</h3>
                <p className="text-sm text-slate-500">Queue #{selectedPatient.queue_number}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Chief Complaint</h4>
                <p className="text-slate-600">{selectedPatient.chief_complaint || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Notes</label>
                <textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter examination notes, diagnosis, treatment..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setShowLabModal(true)}
                  className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 text-center"
                >
                  Order Lab Test
                </button>
                <button
                  onClick={() => setShowPharmacyModal(true)}
                  className="px-4 py-3 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 text-center"
                >
                  Prescribe Medicine
                </button>
                <button
                  onClick={() => setShowNurseModal(true)}
                  className="px-4 py-3 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 text-center"
                >
                  Assign Nurse Task
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Completing...' : 'Complete Consultation'}
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLabModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[10000]" onClick={() => setShowLabModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-[10001] p-6">
            <h3 className="text-lg font-semibold mb-4">Order Lab Test</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Type *</label>
                <select
                  value={labForm.test_type}
                  onChange={(e) => setLabForm({ ...labForm, test_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select test</option>
                  {labTestTypes.map((test) => (
                    <option key={test.test_type_id} value={test.test_name}>{test.test_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={labForm.priority}
                  onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateLabReferral}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Order Test
                </button>
                <button
                  onClick={() => setShowLabModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPharmacyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[10000]" onClick={() => setShowPharmacyModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-[10001] p-6">
            <h3 className="text-lg font-semibold mb-4">Prescribe Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drug Name *</label>
                <select
                  value={pharmacyForm.drug_id}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, drug_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select drug</option>
                  {drugsList.map((drug) => (
                    <option key={drug.drug_id} value={drug.drug_id}>
                      {drug.drug_name} {drug.generic_name ? `(${drug.generic_name})` : ''} - KES {drug.unit_price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={pharmacyForm.quantity}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage Instructions</label>
                <textarea
                  value={pharmacyForm.dosage_instructions}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, dosage_instructions: e.target.value })}
                  rows={2}
                  placeholder="e.g. Take twice daily after meals"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreatePharmacyReferral}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                >
                  Prescribe
                </button>
                <button
                  onClick={() => setShowPharmacyModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNurseModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[10000]" onClick={() => setShowNurseModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-[10001] p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Nurse Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Type</label>
                <select
                  value={nurseForm.task_type}
                  onChange={(e) => setNurseForm({ ...nurseForm, task_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="injection">Injection</option>
                  <option value="vital_signs">Vital Signs</option>
                  <option value="wound_care">Wound Care</option>
                  <option value="observation">Observation</option>
                  <option value="dressing">Dressing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Description *</label>
                <textarea
                  value={nurseForm.task_description}
                  onChange={(e) => setNurseForm({ ...nurseForm, task_description: e.target.value })}
                  rows={3}
                  placeholder="Describe the task..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={nurseForm.priority}
                  onChange={(e) => setNurseForm({ ...nurseForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateNurseTask}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
                >
                  Assign Task
                </button>
                <button
                  onClick={() => setShowNurseModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}