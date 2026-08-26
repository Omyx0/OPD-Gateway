import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Clock, FileText, UserCircle, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <Home size={24} /> },
    { name: 'Queue', path: '/dashboard/queue', icon: <Clock size={24} /> },
    { name: 'Records', path: '/dashboard/records', icon: <FileText size={24} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <UserCircle size={24} /> },
  ];

  return (
    <div className="h-full bg-slate-100 flex flex-col pb-16 relative">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10 shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Smart OPD</h1>
        <button 
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
