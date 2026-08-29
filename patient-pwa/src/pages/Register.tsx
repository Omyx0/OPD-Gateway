import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto ambient-gradient flex flex-col justify-between p-5 relative shadow-2xl overflow-y-auto">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-48 h-48 bg-blue-400/20 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-sm"
          aria-label="Back to login"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Registration</span>
        <div className="w-10" />
      </div>

      {/* Main Registration Card */}
      <div className="w-full my-auto py-6 z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/25 mb-1">
              <Activity size={28} className="stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-500 font-medium">Join Smart OPD for digital queue tokens & AI triage</p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
                  required
                  minLength={6}
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-white/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
              <span>Free registration for outpatient check-ins and history</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99] text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center mt-5">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 pb-2 z-10">
        Smart OPD Portal · Encrypted & Private
      </div>
    </div>
  );
}
