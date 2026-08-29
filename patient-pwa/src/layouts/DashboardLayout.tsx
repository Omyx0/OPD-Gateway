import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Clock, FileText, UserCircle, LogOut, Bell, Activity } from 'lucide-react';

export default function DashboardLayout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Queue', path: '/dashboard/queue', icon: Clock },
    { name: 'Records', path: '/dashboard/records', icon: FileText },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#e8f1f7] flex justify-center items-center antialiased">
      {/* Mobile container viewport */}
      <div className="min-h-[100dvh] w-full max-w-md bg-[#eef4f8] shadow-2xl flex flex-col relative overflow-hidden isolate">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-[-30px] w-60 h-60 bg-blue-400/15 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-20 left-[-30px] w-60 h-60 bg-teal-400/15 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* Top App Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/80 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex justify-between items-center sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">OPD Flow</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-200">Live</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Smart Outpatient Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => alert("All hospital announcements & alerts are up to date.")}
              className="relative w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-white transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 relative z-10">
          <Outlet />
        </main>

        {/* Floating Bottom Navigation Bar */}
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[420px] glass-panel rounded-2xl border border-white/90 shadow-lg px-2 py-1.5 flex justify-around items-center z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25 scale-[1.03]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
