import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('9999999999');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(phone);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full text-white shadow-md">
              <Activity size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Smart OPD</h1>
          <p className="text-sm text-slate-500">Patient Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number (Demo)</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} />
            Use Demo Patient Credentials
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-400">
            For demonstration purposes, no actual OTP will be sent.
          </p>
        </div>
      </div>
    </div>
  );
}
