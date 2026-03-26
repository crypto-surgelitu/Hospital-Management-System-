import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab', 'receptionist'] },
  { path: '/patients', label: 'Patients', icon: 'bi-people', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { path: '/appointments', label: 'Appointments', icon: 'bi-calendar-check', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { path: '/lab', label: 'Lab', icon: 'bi-droplet', roles: ['admin', 'lab'] },
  { path: '/pharmacy', label: 'Pharmacy', icon: 'bi-capsule', roles: ['admin', 'pharmacist'] },
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
      nurse: 'Nurse',
      pharmacist: 'Pharmacist',
      lab: 'Lab Technician',
      receptionist: 'Receptionist',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">HMS Meru</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level 5</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <i className={`bi ${item.icon} text-lg`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}