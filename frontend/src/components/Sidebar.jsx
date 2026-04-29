import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', roles: ['admin', 'doctor', 'receptionist', 'lab', 'pharmacy', 'nurse'] },
  { path: '/queue', label: 'Queue', icon: 'bi-list-ol', roles: ['admin', 'receptionist'] },
  { path: '/doctor-queue', label: 'Examination', icon: 'bi-clipboard-data', roles: ['admin', 'doctor'] },
  { path: '/patients', label: 'Patients', icon: 'bi-people', roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/appointments', label: 'Appointments', icon: 'bi-calendar-check', roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/lab', label: 'Lab Results', icon: 'bi-droplet', roles: ['admin', 'doctor', 'lab'] },
  { path: '/pharmacy', label: 'Pharmacy', icon: 'bi-capsule', roles: ['admin', 'pharmacy'] },
  { path: '/billing', label: 'Billing', icon: 'bi-credit-card', roles: ['admin', 'receptionist'] },
  { path: '/nurse-tasks', label: 'Nurse Tasks', icon: 'bi-clipboard-check', roles: ['admin', 'nurse'] },
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
      nurse: 'Nurse',
      receptionist: 'Receptionist',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-800 flex flex-col text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="font-bold text-white text-xl">HMS Meru</h1>
              <span className="text-xs text-blue-300 font-bold uppercase">Level 5 Facility</span>
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
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <i className={`bi ${item.icon} text-lg`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto bg-slate-900/50 m-4 rounded-xl">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-blue-300 font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 uppercase">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
