import { useState } from 'react';
import { LogOut, UserRound, Phone, Globe, HeartPulse, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      {/* Profile Header Hero Card */}
      <div className="glass-panel-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 p-0.5 shadow-lg shadow-blue-500/25">
            <div className="w-full h-full bg-[#082247] rounded-[14px] flex items-center justify-center text-white">
              <UserRound size={30} />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-400/20 text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-400/30 mb-1">
              <span>Verified Patient</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">OPD Patient Account</h2>
            <p className="text-xs text-blue-200/80 font-mono mt-0.5">ID: {user?.id?.slice(0, 12) || 'P-10001'}...</p>
          </div>
        </div>
      </div>

      {/* Patient Vitals & Info Bento */}
      <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Details</h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Phone size={15} className="text-blue-600" />
              Registered Contact
            </span>
            <span className="font-bold text-slate-800">{user?.phone || '+91 99999 99999'}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Globe size={15} className="text-teal-600" />
              Preferred Language
            </span>
            <span className="font-bold text-slate-800">English (EN)</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 flex items-center gap-2">
              <HeartPulse size={15} className="text-red-500" />
              Emergency Helpline
            </span>
            <span className="font-bold text-red-600">108 (Ambulance)</span>
          </div>
        </div>
      </div>

      {/* Preferences Bento */}
      <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferences</h3>

        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Queue SMS & Push Alerts</div>
              <div className="text-[10px] text-slate-500">Get notified when doctor calls your token</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            aria-label="Toggle notifications"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => void logout()}
        className="w-full glass-panel hover:bg-red-50 border border-red-200/80 text-red-700 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-xs transition-all active:scale-[0.99]"
      >
        <LogOut size={16} />
        <span>Sign Out of Patient Portal</span>
      </button>
    </div>
  );
}
