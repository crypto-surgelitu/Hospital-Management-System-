import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        } else {
          setError(res.data.message);
        }
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  const roleCards = {
    admin: [
      { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: 'bi-people-fill', color: 'blue' },
      { label: 'Appointments Today', value: stats?.todayAppointments ?? 0, icon: 'bi-calendar-check-fill', color: 'violet' },
      { label: 'Pending Lab Tests', value: stats?.pendingLabTests ?? 0, icon: 'bi-droplet-fill', color: 'mint' },
      { label: 'Low Stock Drugs', value: stats?.lowStockDrugs ?? 0, icon: 'bi-box-seam-fill', color: 'amber' },
    ],
    doctor: [
      { label: 'My Patients', value: stats?.myPatients ?? 0, icon: 'bi-people-fill', color: 'blue' },
      { label: 'Appointments Today', value: stats?.todayAppointments ?? 0, icon: 'bi-calendar-check-fill', color: 'violet' },
      { label: 'Pending Lab Results', value: stats?.pendingLabTests ?? 0, icon: 'bi-droplet-fill', color: 'mint' },
      { label: 'Unfinished Notes', value: stats?.unfinishedNotes ?? 0, icon: 'bi-file-earmark-text', color: 'amber' },
    ],
    receptionist: [
      { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: 'bi-people-fill', color: 'blue' },
      { label: 'Appointments Today', value: stats?.todayAppointments ?? 0, icon: 'bi-calendar-check-fill', color: 'violet' },
      { label: 'Pending Payments', value: stats?.pendingPayments ?? 0, icon: 'bi-credit-card', color: 'mint' },
      { label: 'Invoices Today', value: stats?.invoicesToday ?? 0, icon: 'bi-receipt', color: 'amber' },
    ],
    pharmacy: [
      { label: 'Drugs in Stock', value: stats?.drugsInStock ?? 0, icon: 'bi-capsule', color: 'blue' },
      { label: 'Low Stock Items', value: stats?.lowStockDrugs ?? 0, icon: 'bi-exclamation-triangle', color: 'amber' },
      { label: 'Pending Dispense', value: stats?.pendingDispense ?? 0, icon: 'bi-hourglass-split', color: 'mint' },
      { label: 'Dispensed Today', value: stats?.dispensedToday ?? 0, icon: 'bi-check2-all', color: 'violet' },
    ],
    lab: [
      { label: 'Pending Tests', value: stats?.pendingLabTests ?? 0, icon: 'bi-droplet-fill', color: 'blue' },
      { label: 'Completed Today', value: stats?.completedTests ?? 0, icon: 'bi-check-circle', color: 'mint' },
      { label: 'Urgent Requests', value: stats?.urgentRequests ?? 0, icon: 'bi-exclamation-circle', color: 'amber' },
      { label: 'Avg Turnaround', value: stats?.avgTurnaround ?? '2h', icon: 'bi-clock', color: 'violet' },
    ],
  };

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    mint: 'bg-teal-100 text-teal-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  const cards = roleCards[user?.role] || roleCards.admin;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name || 'User'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${colorMap[card.color]} flex items-center justify-center mb-4`}>
              <i className={`bi ${card.icon} text-lg`}></i>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{card.value}</div>
            <div className="text-sm text-slate-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}