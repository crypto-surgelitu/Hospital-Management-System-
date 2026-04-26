import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', roles: ['admin', 'doctor', 'receptionist', 'lab', 'pharmacist'] },
  { path: '/patients', label: 'Patients', icon: 'bi-people', roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/appointments', label: 'Appointments', icon: 'bi-calendar-check', roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/lab', label: 'Lab', icon: 'bi-droplet', roles: ['admin', 'lab'] },
  { path: '/pharmacy', label: 'Pharmacy', icon: 'bi-capsule', roles: ['admin', 'pharmacy'] },
  { path: '/billing', label: 'Billing', icon: 'bi-credit-card', roles: ['admin', 'receptionist'] },
  { path: '/admin', label: 'Admin', icon: 'bi-gear', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      doctor: 'Doctor',
      pharmacy: 'Pharmacist',
      lab: 'Lab Technician',
      receptionist: 'Receptionist',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="w-64 bg-[var(--color-sidebar)] flex flex-col text-[var(--color-surface-lowest)] shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-[var(--color-ink-900)] font-bold text-xl shadow-lg">
              M
            </div>
            <div>
              <h1 className="font-display font-bold text-white leading-none text-xl tracking-tight">HMS Meru</h1>
              <span className="text-[10px] text-[var(--color-primary-container)] font-bold uppercase tracking-widest mt-1 block">Level 5 Facility</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--color-ink-800)] text-[var(--color-primary-container)] rounded-[10px]'
                    : 'text-[var(--color-outline-variant)] hover:bg-[var(--color-ink-800)] hover:text-white rounded-[10px]'
                }`
              }
            >
              <i className={`bi ${item.icon} text-lg`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto bg-[var(--color-ink-800)]/40 backdrop-blur-md m-4 rounded-[16px]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-[var(--color-ink-800)] rounded-full flex items-center justify-center text-[var(--color-primary-container)] font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-wider">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-[10px] transition-all duration-300"
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto z-10">
        <Outlet />
      </main>
    </div>
  );
}