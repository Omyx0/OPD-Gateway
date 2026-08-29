import { useState, useEffect } from 'react';
import { Clock3, Loader2, RefreshCw, Stethoscope, CheckCircle2, FilePlus2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { useNavigate } from 'react-router-dom';

type Ticket = {
  id: string;
  token: string;
  status: string;
  priority: string;
  arrival_time: string;
  departments?: { name: string };
};

export default function Queue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (!user?.token) return;
    try {
      const data = await apiRequest<Ticket[]>('/queue/my-status', user.token);
      setTickets(data ?? []);
    } catch (err) {
      console.error("Failed to load queue status", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    void refresh();
  };

  const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    RED: { bg: 'bg-red-500/20 border-red-400/40', text: 'text-red-300', label: 'Emergency' },
    YELLOW: { bg: 'bg-amber-500/20 border-amber-400/40', text: 'text-amber-300', label: 'Urgent' },
    GREEN: { bg: 'bg-emerald-500/20 border-emerald-400/40', text: 'text-emerald-300', label: 'Routine' },
  };

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Real-Time OPD Journey</p>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Live Queue Status</h2>
        </div>
        <button
          onClick={handleManualRefresh}
          aria-label="Refresh queue"
          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-slate-700 hover:text-blue-600 shadow-sm"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-16 gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-xs text-slate-500 font-medium">Fetching live queue tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-7 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock3 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900">No Active Queue Ticket</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              You do not have any pending OPD consultations in the queue right now.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/symptoms')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FilePlus2 size={16} />
            <span>Start OPD Check-In</span>
          </button>
        </div>
      ) : (
        /* Tickets List */
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const pBadge = priorityColors[ticket.priority] || priorityColors.GREEN;
            const isCalled = ticket.status === 'CALLED';

            return (
              <div
                key={ticket.id || ticket.token}
                className={`glass-panel-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl space-y-4 ${
                  isCalled ? 'ring-4 ring-amber-400' : ''
                }`}
              >
                {/* Glow ambient */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-teal-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      {ticket.departments?.name || 'General OPD'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pBadge.bg} ${pBadge.text}`}>
                    {pBadge.label}
                  </span>
                </div>

                <div className="relative z-10 py-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Token Number</span>
                  <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                    {ticket.token}
                  </div>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isCalled ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span className="font-semibold text-blue-100">Status: {ticket.status}</span>
                  </div>
                  <span className="text-slate-300 text-[11px]">
                    Arrival: {ticket.arrival_time ? new Date(ticket.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Guidelines */}
          <div className="glass-panel rounded-2xl p-4 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-teal-600" />
              Next Step Guidance
            </h4>
            <p className="leading-relaxed">
              When your number is called, your ticket badge will glow amber. Proceed directly to the consultation desk shown above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
