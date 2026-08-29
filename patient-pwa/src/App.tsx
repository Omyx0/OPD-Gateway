import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Symptoms from './pages/Symptoms';
import Triage from './pages/Triage';
import Queue from './pages/Queue';
import Records from './pages/Records';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#eef5f8]">
      <div className="min-h-[100dvh] w-full bg-white relative overflow-hidden flex flex-col isolate">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="symptoms" element={<Symptoms />} />
                <Route path="triage" element={<Triage />} />
                {/* Placeholders for future pages */}
                <Route path="queue" element={<Queue />} />
                <Route path="records" element={<Records />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </div>
  );
}
