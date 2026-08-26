import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Map, ChevronRight, Stethoscope, Activity, FilePlus2, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTicket();
    // Poll every 5 seconds
    const interval = setInterval(fetchActiveTicket, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchActiveTicket = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/queue/my-status`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.length > 0) {
        // Assume first active ticket is the current one
        setActiveTicket(data.data[0]);
      } else {
        setActiveTicket(null);
      }
    } catch (err) {
      console.error("Failed to fetch ticket status", err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;
  }

  // No active visit state
  if (!activeTicket) {
    return (
      <div className="flex-1 px-4 py-8 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.phone}</h2>
          <p className="text-slate-500">You have no active visits today.</p>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard/symptoms')}
          className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-transform"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
            <FilePlus2 size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-800">Start New Visit</h3>
            <p className="text-slate-500 text-sm">Enter symptoms to check-in</p>
          </div>
        </button>
      </div>
    );
  }

  // Active visit state (Stitch Design: pwa_queue_status)
  return (
    <div className="flex-1 mt-6 pb-[120px] px-5 flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* Hero Token Number */}
      <section className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_10px_40px_rgba(0,26,66,0.04)]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none"></div>
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest relative z-10 font-bold">Your Queue Number</p>
        <div className="text-7xl leading-none text-slate-900 font-bold relative z-10 tracking-tighter drop-shadow-sm">
          {activeTicket.token}
        </div>
        <div className="mt-8 inline-flex items-center gap-2 bg-white/70 px-5 py-2.5 rounded-full border border-white shadow-sm relative z-10 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(55,85,195,0.6)]"></span>
          <span className="font-mono text-blue-600 font-bold tracking-wide">Status: {activeTicket.status}</span>
        </div>
      </section>

      {/* Vertical Progress Stepper */}
      <section className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-7 shadow-[0_10px_40px_rgba(0,26,66,0.04)]">
        <h2 className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">Journey Status</h2>
        
        <div className="relative pl-8 border-l-2 border-white space-y-12">
          {/* Step 1: Completed */}
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <span className="text-blue-600 text-[12px] font-bold">✓</span>
            </div>
            <h3 className="text-[17px] text-slate-800 font-semibold">Registration</h3>
            <p className="text-[14px] text-slate-500 mt-1.5">Completed</p>
          </div>

          {/* Step 2: Current (Active) */}
          <div className="relative">
            <div className="absolute -left-[43px] top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-[#f4f7fb] shadow-[0_0_0_0_rgba(55,85,195,0.3)] animate-[pulse-active_2s_infinite]"></div>
            <div className="bg-white/80 rounded-[20px] p-6 border border-white shadow-sm backdrop-blur-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[19px] text-slate-900 font-bold">Waiting</h3>
                <span className="bg-blue-600/15 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Current</span>
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                Please wait in the waiting area. You will be called soon.
              </p>
              
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5 text-slate-600 text-[14px] font-semibold">
                  <Activity size={20} className="text-blue-600" />
                  Priority: {activeTicket.priority}
                </div>
                <button className="text-blue-600 font-bold text-[15px] flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                  View Map
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Pending */}
          <div className="relative opacity-50">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white/50 border border-slate-200 shadow-sm"></div>
            <h3 className="text-[17px] text-slate-800 font-semibold">Consultation</h3>
            <p className="text-[14px] text-slate-500 mt-1.5">Doctor Assigned</p>
          </div>
        </div>
      </section>

      {/* Department Live Status */}
      <section className="flex flex-col gap-5 mt-4">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold pl-2">Department Status</h2>
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x -mx-5 px-5">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl min-w-[220px] snap-center shrink-0 flex flex-col items-center text-center p-7 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-5 shadow-inner">
              <Stethoscope size={28} />
            </div>
            <h3 className="text-[15px] font-bold mb-4 text-slate-800 uppercase tracking-widest">Cardiology</h3>
            <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              NORMAL LOAD
            </div>
          </div>
        </div>
      </section>

      {/* Patient Info */}
      <section className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-sm">
        <p className="text-sm text-slate-500 text-center">
          🔔 You will be notified when your number is called. Stay nearby.
        </p>
      </section>
    </div>
  );
}
