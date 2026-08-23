import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, FilePlus2, Stethoscope, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Patient ID: {user?.phone}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <Stethoscope size={24} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 px-1">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Link to="/register" className="bg-blue-600 text-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
            <FilePlus2 size={28} />
            <span className="text-sm font-medium">New Visit</span>
          </Link>
          
          <Link to="/book" className="bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <CalendarCheck size={28} className="text-blue-500" />
            <span className="text-sm font-medium">Pre-Register</span>
          </Link>

          <Link to="/nearest" className="bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors col-span-2">
            <MapPin size={28} className="text-blue-500" />
            <span className="text-sm font-medium text-center">Find Nearest OPD<br/><span className="text-xs text-slate-400 font-normal">Map Integration</span></span>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800 px-1">Current Status</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-2">
            <CalendarCheck size={24} />
          </div>
          <p className="text-slate-600 font-medium">No active visits today</p>
          <p className="text-sm text-slate-400">Start a new visit to get a queue token.</p>
        </div>
      </div>
    </div>
  );
}
