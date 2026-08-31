import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('patient@opd.com');
    setPassword('demo123');
    setLoading(true);
    setError(null);
    try {
      await login('patient@opd.com', 'demo123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto ambient-gradient flex flex-col justify-between p-5 relative shadow-2xl overflow-y-auto">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-48 h-48 bg-teal-400/20 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-sm"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Portal</span>
        <div className="w-10" />
      </div>

      {/* Main Login Card */}
      <div className="w-full my-auto py-6 z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/25 mb-1">
              <Activity size={28} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500 font-medium">Sign in to track your queue status and health records</p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@opd.com"
                  autoComplete="email"
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99] text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white/80 px-2 text-slate-400 rounded-full">Quick Evaluation</span>
            </div>
          </div>

          {/* Quick Demo Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 text-teal-800 font-bold py-3 rounded-xl hover:bg-teal-100/60 transition-all flex items-center justify-center gap-2 text-xs shadow-sm"
          >
            <Sparkles size={16} className="text-teal-600" />
            <span>1-Click Demo Patient Login</span>
          </button>

          {/* Switch to Register */}
          <div className="text-center mt-5">
            <p className="text-xs text-slate-500">
              New patient?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-400 pb-2 z-10">
        Protected with Supabase Authentication & Role-Based Access
      </div>
    </div>
  );
}
