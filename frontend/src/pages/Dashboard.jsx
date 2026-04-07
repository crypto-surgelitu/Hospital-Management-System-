import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('hms_token');
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message);
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
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Overview</h1>
        <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">Welcome back, {user?.name || 'User'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-blue)]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[var(--color-module-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.totalPatients ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Total Patients</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-75">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-violet)]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[var(--color-module-violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.todayAppointments ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Appointments Today</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-150">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-mint)]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[var(--color-module-mint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.pendingLabTests ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Pending Lab Tests</div>
        </Card>

        <Card className="hover:-translate-y-1 transition-transform duration-300 delay-200">
          <div className="w-12 h-12 rounded-[10px] bg-[var(--color-module-amber)]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[var(--color-module-amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-[2.25rem] font-bold text-[var(--color-ink-900)] mb-1 leading-none">{stats?.lowStockDrugs ?? 0}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Low Stock Drugs</div>
        </Card>
      </div>
    </div>
  );
}