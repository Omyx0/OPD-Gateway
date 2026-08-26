import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Symptoms from './pages/Symptoms';
import Triage from './pages/Triage';

export default function App() {
  return (
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
            <Route path="queue" element={<div className="p-4">Queue View (Coming Soon)</div>} />
            <Route path="records" element={<div className="p-4">My Records (Coming Soon)</div>} />
            <Route path="profile" element={<div className="p-4">Profile Settings (Coming Soon)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
