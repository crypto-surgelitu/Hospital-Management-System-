import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Lab from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import NurseTasks from './pages/NurseTasks';
import Queue from './pages/Queue';
import DoctorQueue from './pages/DoctorQueue';
import Unauthorized from './pages/Unauthorized';

const ROLE_ROUTES = {
  admin: ['/dashboard', '/queue', '/doctor-queue', '/patients', '/appointments', '/lab', '/pharmacy', '/billing', '/admin', '/nurse-tasks'],
  doctor: ['/dashboard', '/doctor-queue', '/patients', '/appointments', '/lab'],
  receptionist: ['/dashboard', '/queue', '/patients', '/appointments', '/billing'],
  lab: ['/dashboard', '/lab'],
  pharmacy: ['/dashboard', '/pharmacy'],
  nurse: ['/dashboard', '/nurse-tasks'],
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Sidebar />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<ProtectedRoute roles={['admin', 'receptionist']} />}>
                <Route path="/queue" element={<Queue />} />
                <Route path="/billing" element={<Billing />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'doctor', 'receptionist']} />}>
                <Route path="/patients" element={<Patients />} />
                <Route path="/appointments" element={<Appointments />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'doctor']} />}>
                <Route path="/doctor-queue" element={<DoctorQueue />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'doctor', 'lab']} />}>
                <Route path="/lab" element={<Lab />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'pharmacy']} />}>
                <Route path="/pharmacy" element={<Pharmacy />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin', 'nurse']} />}>
                <Route path="/nurse-tasks" element={<NurseTasks />} />
              </Route>
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export { ROLE_ROUTES };
export default App;
