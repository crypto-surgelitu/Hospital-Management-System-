import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Card from '../components/ui/Card';

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
          <div className="h-10 w-48 bg-white/50 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-white/50 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-[10px] mb-4"></div>
              <div className="h-10 w-20 bg-slate-100 rounded-lg mb-2"></div>
              <div className="h-4 w-24 bg-slate-100 rounded-lg"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] px-4 py-3 rounded-[10px] text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 gutter-breathing">
      <div className="mb-12">
        <h1 className="text-[2.5rem] font-display font-extrabold text-[var(--color-ink-900)] leading-[1.1] tracking-tight">System Overview</h1>
        <p className="text-[var(--color-text-muted)] text-base mt-2 font-medium">Welcome back to the clinical dashboard, {user?.name || 'User'}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-blue)]/10 flex items-center justify-center mb-4">
            <i className="bi bi-people-fill text-xl text-[var(--color-module-blue)]"></i>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.totalPatients ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Total Patients</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-75">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-violet)]/10 flex items-center justify-center mb-4">
            <i className="bi bi-calendar-check-fill text-xl text-[var(--color-module-violet)]"></i>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.todayAppointments ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Appointments Today</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-150">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-mint)]/10 flex items-center justify-center mb-4">
            <i className="bi bi-droplet-fill text-xl text-[var(--color-module-mint)]"></i>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.pendingLabTests ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Pending Lab Tests</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-200">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-amber)]/10 flex items-center justify-center mb-4">
            <i className="bi bi-box-seam-fill text-xl text-[var(--color-module-amber)]"></i>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.lowStockDrugs ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Low Stock Drugs</div>
        </Card>
      </div>
    </div>
  );
}