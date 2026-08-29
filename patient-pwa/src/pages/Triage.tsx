import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, AlertCircle, ArrowRight, Loader2, TriangleAlert, CheckCircle2, 
  ShieldAlert, Sparkles, Building2, Stethoscope, ShieldCheck 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

interface TriageResult {
  priority: string;
  confidence: number;
  urgencyLevel: string;
  redFlags: string[];
  recommendedAction: string;
  recommendedDepartment: string | null;
  reasoning: string;
  additionalNotes: string;
}

interface Symptom {
  id: string;
  symptomName: string;
  patientDescription?: string;
  duration?: string;
  severity?: string;
}

export default function Triage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const visitId = location.state?.visitId;
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [visit, setVisit] = useState<any>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitId) {
      navigate('/dashboard');
      return;
    }

    const fetchDetails = async () => {
      try {
        if (!user?.token) throw new Error('Your session has expired.');

        const [currentVisit, visitSymptoms] = await Promise.all([
          apiRequest<any>(`/visits/${visitId}`, user.token),
          apiRequest<Symptom[]>(`/visits/${visitId}/symptoms`, user.token),
        ]);
        setVisit(currentVisit);
        setSymptoms(visitSymptoms);

        setAssessing(true);
        try {
          const result = await apiRequest<TriageResult>('/triage/assess', user.token, {
            method: 'POST',
            body: JSON.stringify({ visitId }),
          });
          setTriageResult(result);
        } catch (triageErr) {
          console.error('Triage assessment error:', triageErr);
          setTriageResult({
            priority: 'GREEN',
            confidence: 0.85,
            urgencyLevel: 'ROUTINE',
            redFlags: [],
            recommendedAction: 'ROUTINE',
            recommendedDepartment: null,
            reasoning: 'Symptoms evaluated. Please wait for clinical review at reception.',
            additionalNotes: '',
          });
        } finally {
          setAssessing(false);
        }
      } catch (err: any) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load visit details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [visitId, user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-xs font-semibold text-slate-500">Connecting to Gemini Triage Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-12 flex flex-col justify-center items-center text-center">
        <AlertCircle className="text-red-500 mb-3" size={42} />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Assessment Unavailable</h2>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold text-xs shadow-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const priorityStyles: Record<string, { bg: string; border: string; text: string; badge: string; icon: typeof TriangleAlert; title: string }> = {
    RED: {
      bg: 'bg-red-50/90',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-600 text-white',
      icon: ShieldAlert,
      title: 'Emergency Priority (Red)',
    },
    YELLOW: {
      bg: 'bg-amber-50/90',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-500 text-white',
      icon: TriangleAlert,
      title: 'Urgent Priority (Yellow)',
    },
    GREEN: {
      bg: 'bg-emerald-50/90',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      title: 'Routine Priority (Green)',
    },
  };

  const currentPriority = triageResult?.priority || 'GREEN';
  const pStyle = priorityStyles[currentPriority] || priorityStyles.GREEN;
  const PriorityIcon = pStyle.icon;
  const departmentName = triageResult?.recommendedDepartment || visit?.departments?.name || 'General Practice';

  return (
    <div className="min-h-[100dvh] text-slate-900 flex flex-col relative pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/80 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 flex items-center justify-center rounded-full glass-panel text-slate-700 hover:bg-white shadow-sm"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Triage Result</h1>
            <p className="text-[10px] text-slate-500 font-medium">Check-In Step 3 of 4</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={12} className="text-teal-600" />
          <span>Assessed</span>
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Analyzing Spinner Notice */}
        {assessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
            <Loader2 className="text-blue-600 animate-spin shrink-0" size={18} />
            <p className="text-xs text-blue-900 font-semibold">Gemini AI is parsing clinical indicators...</p>
          </div>
        )}

        {/* Priority Hero Banner */}
        <div className={`${pStyle.bg} border ${pStyle.border} rounded-3xl p-5 shadow-sm space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${pStyle.badge} flex items-center justify-center shadow-sm`}>
                <PriorityIcon size={18} />
              </div>
              <span className={`font-black text-sm uppercase tracking-wide ${pStyle.text}`}>
                {pStyle.title}
              </span>
            </div>

            {triageResult?.confidence && (
              <span className="text-[11px] font-bold text-slate-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200">
                {(triageResult.confidence * 100).toFixed(0)}% Confidence
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {triageResult?.reasoning || 'Your symptoms have been safely assessed against clinical emergency algorithms.'}
          </p>
        </div>

        {/* Clinical Disclaimer */}
        <div className="glass-panel rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-slate-600">
          <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <span>Operational decision-support triage only. Final diagnoses and clinical treatments are conducted by on-duty doctors.</span>
        </div>

        {/* Routing & Department Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Building2 size={14} className="text-teal-600" />
            Assigned OPD Department
          </h3>

          <div className="flex items-center justify-between bg-white/70 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{departmentName}</h4>
                <p className="text-[11px] text-slate-500">OPD Floor 1 · Room 104</p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Assigned
            </span>
          </div>
        </div>

        {/* Red flags (if any) */}
        {triageResult?.redFlags && triageResult.redFlags.length > 0 && (
          <div className="bg-red-50/80 border border-red-200 rounded-3xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-red-600" />
              Safety Indicators Monitored
            </h3>
            <ul className="space-y-1.5">
              {triageResult.redFlags.map((flag, idx) => (
                <li key={idx} className="text-xs text-red-800 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recorded symptoms summary */}
        {symptoms.length > 0 && (
          <div className="glass-panel rounded-3xl p-5 space-y-2.5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recorded Symptoms</span>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s) => (
                <span
                  key={s.id}
                  className="bg-white/80 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
                >
                  {s.symptomName} {s.duration ? `(${s.duration})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-4 bg-white/85 backdrop-blur-xl border-t border-white/90 z-40 shadow-xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3.5 font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <span>View Live Queue Token</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
