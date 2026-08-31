import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Stethoscope, Activity, FilePlus2, Loader2, Sparkles, 
  Clock, MapPin, Phone, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveTicket();
    const interval = setInterval(fetchActiveTicket, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchActiveTicket = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/queue/my-status`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.length > 0) {
        setActiveTicket(data.data[0]);
      } else {
        setActiveTicket(null);
      }
    } catch (err) {
      console.error("Failed to fetch ticket status", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchActiveTicket();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-xs font-semibold text-slate-500">Checking active OPD visits...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 1: NO ACTIVE VISIT TODAY
  // ----------------------------------------------------
  if (!activeTicket) {
    return (
      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">Outpatient Portal</p>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Welcome, Patient</h2>
            <p className="text-xs text-slate-500 font-medium">Ready for your OPD appointment today?</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            {user?.role?.charAt(0) || 'P'}
          </div>
        </div>

        {/* Primary Action Hero Card: Start Check-In */}
        <div 
          onClick={() => navigate('/dashboard/symptoms')}
          className="glass-panel-dark rounded-3xl p-6 text-white relative overflow-hidden cursor-pointer group shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <FilePlus2 size={24} />
              </div>
              <span className="bg-teal-400/20 text-teal-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Sparkles size={11} /> AI Powered
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight">Start OPD Check-In</h3>
              <p className="text-xs text-blue-100/80 leading-relaxed mt-1">
                Enter your symptoms to receive instant Gemini AI triage assessment and generate a live queue token.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-teal-300 border-t border-white/10">
              <span>Begin Symptom Intake</span>
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hospital Status Bento */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Department Status</span>
            <span className="text-[11px] font-semibold text-blue-600">Updated now</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope size={16} />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">General Practice</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Wait: ~8 mins</p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Activity size={16} />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Cardiology</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Wait: ~15 mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Essential OPD Guidelines */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock size={14} className="text-blue-600" />
            Hospital Information
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>Outpatient Block, Floors 1-3. Main Hospital Campus.</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>OPD Helpline: <strong className="text-slate-800">1800-419-0022</strong> (Emergency: 108)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 2: ACTIVE QUEUE TICKET PRESENT
  // ----------------------------------------------------
  const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    RED: { bg: 'bg-red-500/20 border-red-400/40', text: 'text-red-300', label: 'Emergency Priority' },
    YELLOW: { bg: 'bg-amber-500/20 border-amber-400/40', text: 'text-amber-300', label: 'Urgent Priority' },
    GREEN: { bg: 'bg-emerald-500/20 border-emerald-400/40', text: 'text-emerald-300', label: 'Routine Priority' },
  };

  const pBadge = priorityColors[activeTicket.priority] || priorityColors.GREEN;

  const isCalled = activeTicket.status === 'CALLED';
  const isInProgress = activeTicket.status === 'IN_PROGRESS';

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">Active Care Journey</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Queue Token</h2>
        </div>
        <button
          onClick={handleManualRefresh}
          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm"
          title="Refresh ticket status"
          aria-label="Refresh status"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {/* Hero Token Card (Sapphire Glass) */}
      <div className={`glass-panel-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl ${isCalled ? 'ring-4 ring-amber-400 ring-offset-2' : ''}`}>
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          {/* Department Tag */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full border border-white/20 text-xs font-semibold text-blue-100">
            <Stethoscope size={13} className="text-teal-300" />
            <span>{activeTicket.departments?.name || 'General Practice'}</span>
          </div>

          {/* Huge Token Code */}
          <div className="text-6xl font-black tracking-tight text-white my-1 font-mono drop-shadow-md">
            {activeTicket.token}
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full border border-white/25 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isCalled ? 'bg-amber-400 animate-ping' : isInProgress ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'}`} />
            <span className="font-bold text-xs tracking-wider uppercase">
              {isCalled ? '🔔 Called to Room' : isInProgress ? '👨‍⚕️ In Consultation' : '⏳ Waiting in Queue'}
            </span>
          </div>

          {/* Priority Pill */}
          <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border ${pBadge.bg} ${pBadge.text}`}>
            {pBadge.label}
          </div>
        </div>
      </div>

      {/* Urgent Notice if Called */}
      {isCalled && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl flex items-start gap-3 shadow-md animate-bounce">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-extrabold text-sm text-amber-900">Your Number Has Been Called!</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Please proceed immediately to the <strong>{activeTicket.departments?.name || 'Consultation Room'}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Stepper / Timeline Card */}
      <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Care Progress</h3>

        <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white">
              <CheckCircle2 size={12} />
            </div>
            <div className="text-xs font-bold text-slate-800">Registration & Check-In</div>
            <div className="text-[11px] text-emerald-600 font-medium">Completed via PWA</div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white">
              <CheckCircle2 size={12} />
            </div>
            <div className="text-xs font-bold text-slate-800">AI Symptom Triage</div>
            <div className="text-[11px] text-emerald-600 font-medium">Assessed ({activeTicket.priority})</div>
          </div>

          {/* Step 3: Current */}
          <div className="relative">
            <div className={`absolute -left-[33px] top-0 w-5 h-5 rounded-full ${isCalled || isInProgress ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center text-white ring-4 ring-blue-100 ${!isInProgress ? 'pulse-ring' : ''}`}>
              <Activity size={12} />
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900">Waiting Area</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Current</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Please remain seated near the department waiting display. You will hear an announcement when called.
              </p>
            </div>
          </div>

          {/* Step 4: Pending */}
          <div className="relative opacity-50">
            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white" />
            <div className="text-xs font-bold text-slate-700">Doctor Consultation</div>
            <div className="text-[11px] text-slate-400 font-medium">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/dashboard/queue')}
          className="glass-panel hover:bg-white p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-700 border border-blue-100 shadow-sm transition-all"
        >
          <Clock size={16} />
          <span>Full Queue View</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/records')}
          className="glass-panel hover:bg-white p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          <Activity size={16} />
          <span>View Records</span>
        </button>
      </div>
    </div>
  );
}
