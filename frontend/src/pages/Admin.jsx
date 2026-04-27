import { useState, useEffect, useCallback } from 'react';
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
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-xl text-sm font-medium z-[200] ${
      type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {message}
    </div>
  );
}

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'danger' },
  { value: 'doctor', label: 'Doctor', color: 'info' },
  { value: 'receptionist', label: 'Receptionist', color: 'warning' },
  { value: 'lab', label: 'Lab Tech', color: 'success' },
  { value: 'pharmacy', label: 'Pharmacist', color: 'default' },
];

function UserModal({ open, onClose, onSubmit, loading, editUser }) {
  const [form, setForm] = useState({ full_name: '', username: '', password: '', role: 'doctor', department: '', is_active: true });

  useEffect(() => {
    if (open) {
      if (editUser) {
        setForm({
          full_name: editUser.full_name || '',
          username: editUser.username || '',
          password: '',
          role: editUser.role || 'doctor',
          department: editUser.department || '',
          is_active: editUser.is_active === 1 || editUser.is_active === true
        });
      } else {
        setForm({ full_name: '', username: '', password: '', role: 'doctor', department: '', is_active: true });
      }
    }
  }, [open, editUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{editUser ? 'Edit User' : 'Create User'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input required type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Dr. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
            <input required type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!editUser} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="j.doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{editUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" required={!editUser} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="General Medicine" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-container)] disabled:opacity-50 transition-colors">{editUser ? 'Update User' : 'Create User'}</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerateModal({ open, onClose, onSubmit, loading }) {
  const [count, setCount] = useState(5);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-all">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Generate Random Users</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of users (1-50)</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={count} 
              onChange={e => setCount(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 50))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <p className="text-xs text-slate-500">Each user will have a unique username, random role, and auto-generated temporary password.</p>
          <div className="pt-2 flex gap-3">
            <button 
              onClick={() => onSubmit(count)} 
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-container)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Users'}
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, editUser: null });
  const [generateModal, setGenerateModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (form) => {
    setActionLoading(true);
    try {
      let res;
      if (modal.editUser) {
        res = await api.put(`/admin/users/${modal.editUser.user_id}`, form);
      } else {
        res = await api.post('/admin/users', form);
      }
      if (res.data.success) {
        setToast({ type: 'success', message: modal.editUser ? 'User updated successfully' : 'User created successfully' });
        setModal({ open: false, editUser: null });
        fetchUsers();
      } else {
        setToast({ type: 'error', message: res.data.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

const handleToggleStatus = async (user) => {
  setActionLoading(true);
  try {
    const res = await api.patch(`/admin/users/${user.user_id}/toggle`);
    if (res.data.success) {
      setToast({ type: 'success', message: res.data.message });
      fetchUsers();
    } else {
      setToast({ type: 'error', message: res.data.message });
    }
  } catch {
    setToast({ type: 'error', message: 'Failed to update user status' });
  } finally {
    setActionLoading(false);
  }
};

const handleResetPassword = async (user) => {
  const password = prompt(`Enter new password for ${user.username}:`);
  if (!password || password.length < 6) {
    setToast({ type: 'error', message: 'Password must be at least 6 characters' });
    return;
  }
  setActionLoading(true);
  try {
    const res = await api.patch(`/admin/users/${user.user_id}/reset-password`, { password });
    if (res.data.success) {
      setToast({ type: 'success', message: 'Password reset successfully' });
    } else {
      setToast({ type: 'error', message: res.data.message });
    }
  } catch {
    setToast({ type: 'error', message: 'Failed to reset password' });
  } finally {
    setActionLoading(false);
  }
};

const handleGenerateUsers = async (count) => {
  setActionLoading(true);
  try {
    const res = await api.post('/admin/users/generate', { count });
    if (res.data.success) {
      const userList = res.data.users.map(u => `${u.username} (${u.temp_password})`).join('\n');
      setToast({ type: 'success', message: `Generated ${res.data.users.length} users` });
      setGenerateModal(false);
      fetchUsers();
      alert(`Generated users:\n\n${userList}\n\nShare these credentials with the users.`);
    } else {
      setToast({ type: 'error', message: res.data.message });
    }
  } catch {
    setToast({ type: 'error', message: 'Failed to generate users' });
  } finally {
    setActionLoading(false);
  }
};

  const getRoleBadge = (role) => {
    const found = ROLES.find(r => r.value === role);
    return found || { label: role, color: 'default' };
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">User Management</h1>
    <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Manage system users and access control</p>
  </div>
  <div className="flex gap-2">
    <Button variant="secondary" onClick={() => setGenerateModal(true)} icon="bi-magic">
      Generate
    </Button>
    <Button onClick={() => setModal({ open: true, editUser: null })} icon="bi-person-plus-fill">
      New User
    </Button>
  </div>
</div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role.value).length;
          return (
            <div key={role.value} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900 mb-1">{count}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{role.label}s</div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-low)] border-b border-black/5">
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">No users found</td></tr>
              ) : (
                users.map(user => {
                  const roleMeta = getRoleBadge(user.role);
                  return (
                    <tr key={user.user_id} className="hover:bg-[var(--color-surface-low)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-semibold text-[var(--color-ink-900)]">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-[var(--color-text-muted)]">{user.username}</td>
                      <td className="px-6 py-4">
                        <Badge variant={roleMeta.color}>{roleMeta.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{user.department || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, editUser: user })}>
                            <i className="bi bi-pencil-square"></i>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)} disabled={actionLoading}>
                            <i className="bi bi-key text-orange-500"></i>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} disabled={actionLoading}>
                            <i className={`bi ${user.is_active ? 'bi-toggle-on text-emerald-500' : 'bi-toggle-off text-red-400'} text-lg`}></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
</Card>

<GenerateModal open={generateModal} onClose={() => setGenerateModal(false)} onSubmit={handleGenerateUsers} loading={actionLoading} />
<UserModal open={modal.open} onClose={() => setModal({ open: false, editUser: null })} onSubmit={handleSubmit} loading={actionLoading} editUser={modal.editUser} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}