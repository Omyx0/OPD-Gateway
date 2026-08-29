import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Sparkles, Clock, ShieldCheck, QrCode, Stethoscope, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickDemo = async () => {
    try {
      await login('patient@opd.com', 'demo123');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto ambient-gradient text-slate-800 flex flex-col justify-between relative shadow-2xl overflow-y-auto antialiased">
      {/* Background ambient accents */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-60px] w-56 h-56 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/60 px-5 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Activity size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">Smart OPD</span>
              <span className="bg-teal-500/10 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-teal-500/20">PWA</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">AI-Assisted Patient Gateway</p>
          </div>
        </div>

        <button 
          onClick={handleQuickDemo}
          className="text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 transition-all flex items-center gap-1"
        >
          <Sparkles size={13} className="text-blue-600" />
          <span>Demo</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 flex flex-col gap-6 relative z-10">
        {/* Live Hospital Pulse Banner */}
        <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/90 shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-700">OPD Active · 14 Doctors on Duty</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-semibold text-blue-600">Avg. 12 min wait</span>
        </div>

        {/* Hero Copy */}
        <div className="space-y-3 pt-1">
          <h1 className="text-[34px] leading-[1.18] font-extrabold text-slate-900 tracking-tight">
            Healthcare without the endless <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">waiting queue</span>.
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-600 font-normal">
            Skip the physical reception line. Check-in from your phone, describe symptoms to our AI triage, and track your queue position in real-time.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col gap-3 pt-1">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-2xl p-4 font-semibold text-base shadow-lg shadow-blue-600/25 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-wide">Start OPD Check-in</div>
                <div className="text-[11px] text-blue-100 font-normal">AI Triage & Live Token Generation</div>
              </div>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full glass-panel hover:bg-white/90 text-slate-800 rounded-2xl p-3.5 font-semibold text-sm flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-800">Track Existing Token</span>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Card 1: AI Triage */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[13px] text-slate-900">Gemini AI Triage</h3>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Automated urgency & priority assessment</p>
            </div>
          </div>

          {/* Card 2: Live Queue */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[13px] text-slate-900">Live Status</h3>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Real-time token call updates & arrival time</p>
            </div>
          </div>
        </div>

        {/* Security / Compliance badge */}
        <div className="glass-panel rounded-2xl p-3.5 flex items-center gap-3 mt-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Encrypted & compliant with hospital outpatient guidelines. No personal data shared externally.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-5 py-3 text-center text-[11px] text-slate-400 border-t border-slate-200/50 bg-white/40">
        Smart OPD System · Patient Progressive Web App
      </footer>
    </div>
  );
}
