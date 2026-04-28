import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';

export default function NurseTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedTask, setSelectedTask] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/nurse/tasks${filter ? `?status=${filter}` : ''}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleStart = async (taskId) => {
    try {
      await api.patch(`/nurse/tasks/${taskId}/start`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to start task:', err);
    }
  };

  const handleComplete = async () => {
    if (!selectedTask) return;
    setCompleting(true);
    try {
      await api.patch(`/nurse/tasks/${selectedTask.task_id}/complete`, { notes: completeNotes });
      setSelectedTask(null);
      setCompleteNotes('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'urgent' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nurse Tasks</h1>
          <p className="text-slate-600">View and complete assigned tasks</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 rounded"></div>
            </Card>
          ))
        ) : tasks.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-slate-500">
              No {filter.replace('_', ' ')} tasks found
            </div>
          </Card>
        ) : (
          tasks.map(task => (
            <Card key={task.task_id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.priority === 'urgent' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        URGENT
                      </span>
                    )}
                    <span className="text-sm text-slate-500">
                      Task #{task.task_id}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{task.task_type}</h3>
                  <p className="text-slate-600 mt-1">{task.task_description}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                    <span>Patient: {task.patient_name}</span>
                    <span>Queue #: {task.queue_number || '-'}</span>
                    <span>Assigned by: {task.assigned_by_name}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStart(task.task_id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 z-[9999]" onClick={() => setSelectedTask(null)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto z-[10000] p-6">
            <h3 className="text-lg font-semibold mb-4">Complete Task</h3>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="font-medium">{selectedTask.task_type}</p>
              <p className="text-sm text-slate-600 mt-1">{selectedTask.task_description}</p>
              <p className="text-sm text-slate-500 mt-2">Patient: {selectedTask.patient_name}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Completion Notes
              </label>
              <textarea
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Add notes about the task..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'Complete Task'}
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
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