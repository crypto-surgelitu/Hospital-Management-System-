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
import Unauthorized from './pages/Unauthorized';

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
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'doctor', 'nurse', 'receptionist']} />}>
            <Route element={<Sidebar />}>
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'lab']} />}>
            <Route element={<Sidebar />}>
              <Route path="/lab" element={<Lab />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'pharmacist']} />}>
            <Route element={<Sidebar />}>
              <Route path="/pharmacy" element={<Pharmacy />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'receptionist']} />}>
            <Route element={<Sidebar />}>
              <Route path="/billing" element={<Billing />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<Sidebar />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;