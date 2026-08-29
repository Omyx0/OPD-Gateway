import { useState } from 'react';
import { ShieldCheck, Stethoscope, Pill, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Records() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'all' | 'visits' | 'prescriptions' | 'labs'>('all');

  const SAMPLE_RECORDS = [
    {
      id: 'rec-01',
      date: 'Today, OPD Session',
      dept: 'General Practice',
      doctor: 'Duty Medical Officer',
      type: 'OPD Check-In',
      status: 'Active / Registered',
      badge: 'Current Visit',
    },
    {
      id: 'rec-02',
      date: '14 Jan 2026',
      dept: 'Cardiology',
      doctor: 'Dr. A. Menon (MD)',
      type: 'Routine Consultation',
      status: 'Completed',
      diagnosis: 'Mild Sinus Tachycardia',
      medications: ['Metoprolol 25mg (OD)', 'Electrolyte Hydration'],
    },
  ];

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Digital Health Record</p>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Records</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Your OPD visit summaries, prescriptions & lab results</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm text-xs font-bold">
        {[
          { id: 'all', label: 'All' },
          { id: 'visits', label: 'Visits' },
          { id: 'prescriptions', label: 'Rx' },
          { id: 'labs', label: 'Labs' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Records Timeline */}
      <div className="space-y-3">
        {SAMPLE_RECORDS.map((rec) => (
          <div key={rec.id} className="glass-panel rounded-3xl p-5 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{rec.dept}</h3>
                  <p className="text-[11px] text-slate-500">{rec.doctor}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {rec.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
              <Calendar size={14} className="text-slate-400" />
              <span>{rec.date}</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">{rec.type}</span>
            </div>

            {rec.medications && (
              <div className="bg-slate-50/80 rounded-2xl p-3 space-y-1.5 border border-slate-200/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Pill size={12} className="text-blue-600" />
                  Prescribed Medications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rec.medications.map((m, idx) => (
                    <span key={idx} className="bg-white text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="text-xs">
          <div className="font-bold text-slate-800">ABDM & ABDM Standard Compliant</div>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
            Your clinical data is protected and private to account ({user?.phone || 'Patient'}).
          </p>
        </div>
      </div>
    </div>
  );
}
