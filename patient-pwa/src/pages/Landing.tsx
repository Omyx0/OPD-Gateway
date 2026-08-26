import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Search, Users, QrCode } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-sky-100 via-violet-100 to-teal-100 text-slate-800 font-sans h-full overflow-y-auto overflow-x-hidden antialiased">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/85 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 md:px-10 h-16">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center overflow-hidden border border-white/20">
            {/* Generic Logo / Avatar */}
            <span className="font-bold">OPD</span>
          </div>
          <span className="text-xl font-bold text-white">OPD Flow</span>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors scale-95 active:scale-90">
          <Bell size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 md:px-10 max-w-[1440px] mx-auto min-h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* Left Column: Hero & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center gap-8 pr-0 lg:pr-12">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl text-slate-900 font-bold tracking-tight leading-tight">
                Healthcare without the waiting-room confusion.
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                Streamline your visit with instant registration, real-time queue tracking, and smart alerts sent directly to your device.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-slate-900 text-white rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1 transition-transform"
              >
                <span>Start OPD Registration</span>
                <ArrowRight size={18} />
              </button>
              
              <button 
                onClick={() => navigate('/login')}
                className="bg-white/40 backdrop-blur-md border border-white/60 text-slate-900 rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/60 transition-colors shadow-sm"
              >
                <Search size={18} />
                <span>Track Existing Token</span>
              </button>
            </div>
          </div>

          {/* Right Column: Bento Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-6 auto-rows-[160px] mt-8 lg:mt-0">
            
            {/* Live Queue Status */}
            <div className="col-span-2 row-span-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 flex items-center justify-between shadow-[0_10px_40px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">CURRENT QUEUE</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl text-slate-900 font-extrabold drop-shadow-sm">Token #14</span>
                  <span className="text-base text-teal-600 font-medium bg-teal-50/50 px-3 py-1 rounded-full border border-teal-100">
                    is being served
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center text-teal-600 shadow-sm border border-white/60 backdrop-blur-md">
                <Users size={32} />
              </div>
            </div>

            {/* Smart Alerts */}
            <div className="col-span-1 row-span-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 flex flex-col justify-between shadow-[0_10px_40px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition-transform">
              <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">SMART ALERTS</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-600 bg-teal-50/50 w-fit px-3 py-1.5 rounded-full border border-teal-100">
                  <span className="font-mono text-sm font-medium">Dr. Chen on time</span>
                </div>
                <p className="text-slate-500 text-sm font-medium px-1">Est. wait: 15 mins</p>
              </div>
            </div>

            {/* Instant Access */}
            <div className="col-span-1 row-span-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition-transform">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-teal-500 to-transparent"></div>
              <span className="text-xs text-slate-500 font-bold tracking-wider uppercase relative z-10">QUICK ACCESS</span>
              <div className="flex items-center gap-3 relative z-10 bg-white/40 p-3 rounded-2xl border border-white/60 backdrop-blur-sm w-fit mt-auto">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <QrCode size={20} />
                </div>
                <span className="text-base font-semibold text-slate-900">Scan Card</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
