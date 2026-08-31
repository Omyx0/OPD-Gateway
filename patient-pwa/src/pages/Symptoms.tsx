import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mic, MicOff, Star, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

const COMMON_SYMPTOMS = [
  { label: 'High Fever', category: 'General' },
  { label: 'Persistent Cough', category: 'Respiratory' },
  { label: 'Chest Discomfort', category: 'Emergency' },
  { label: 'Severe Headache', category: 'Neurological' },
  { label: 'Shortness of Breath', category: 'Respiratory' },
  { label: 'Abdominal Pain', category: 'Digestive' },
  { label: 'Dizziness', category: 'General' },
  { label: 'Nausea & Vomiting', category: 'Digestive' },
];

export default function Symptoms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-3 days');
  const [severity, setSeverity] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleVoiceInput = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech recognition transcription for demo
      setTimeout(() => {
        setSymptoms((prev) => 
          prev 
            ? `${prev}, severe pain with elevated body temperature since yesterday` 
            : 'Severe pain with elevated body temperature since yesterday morning'
        );
        setIsRecording(false);
      }, 2400);
    } else {
      setIsRecording(false);
    }
  };

  const handleTogglePill = (label: string) => {
    setSymptoms((prev) => {
      if (!prev) return label;
      if (prev.includes(label)) return prev;
      return `${prev}, ${label}`;
    });
  };

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setIsSubmitting(true);
    try {
      if (!user?.token) throw new Error('Your session has expired. Please sign in again.');
      
      const [departments, patient] = await Promise.all([
        apiRequest<any[]>('/departments', user.token),
        apiRequest<{ id: string }>('/patients/me', user.token),
      ]);

      // Look for GP department first, fallback to first active
      const gpDept = departments.find((d: any) => d.code === 'GP') || departments[0];
      if (!gpDept) throw new Error('No departments are available right now.');

      // 1. Create visit
      const visit = await apiRequest<{ id: string }>('/visits', user.token, {
        method: 'POST',
        body: JSON.stringify({
          patientId: patient.id,
          departmentId: gpDept.id,
          visitType: "OPD",
          source: "KIOSK"
        })
      });

      // 2. Submit symptoms to backend
      await apiRequest(`/visits/${visit.id}/symptoms`, user.token, {
        method: 'POST',
        body: JSON.stringify({
          symptomName: symptoms.slice(0, 60),
          patientDescription: symptoms,
          duration,
          severity: severity.toString()
        })
      });

      // 3. Navigate to Triage
      navigate('/dashboard/triage', { state: { visitId: visit.id } });
    } catch (err: any) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error submitting symptoms");
      setIsSubmitting(false);
    }
  };

  const severityLabels: Record<number, { text: string; color: string; desc: string }> = {
    1: { text: 'Very Mild', color: 'text-emerald-600', desc: 'Minimal discomfort, does not interrupt daily tasks' },
    2: { text: 'Mild', color: 'text-emerald-700', desc: 'Noticeable discomfort, manageable without pain relievers' },
    3: { text: 'Moderate', color: 'text-amber-600', desc: 'Distracting discomfort, affects normal activity' },
    4: { text: 'Severe', color: 'text-orange-600', desc: 'Intense pain or discomfort, difficult to concentrate' },
    5: { text: 'Critical / Emergency', color: 'text-red-600', desc: 'Unbearable distress, requires immediate clinical care' },
  };

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
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Symptom Intake</h1>
            <p className="text-[10px] text-slate-500 font-medium">Check-In Step 2 of 4</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full">
          AI Triage
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-md mx-auto w-full">
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">How are you feeling today?</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Describe what brings you to the OPD. Our clinical AI model will parse your symptoms and route you to the appropriate specialist.
          </p>
        </div>

        {/* Freeform input card with voice support */}
        <div className="glass-panel rounded-3xl p-4 shadow-sm relative transition-all focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Your Description</span>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Listening...
              </span>
            )}
          </div>

          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-slate-900 placeholder:text-slate-400 resize-none h-28 text-sm outline-none font-medium leading-relaxed" 
            placeholder="E.g., I've had a severe headache and continuous high fever with chills since yesterday evening..."
          />

          <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 mt-1">
            <span className="text-[11px] text-slate-400">
              {symptoms.length > 0 ? `${symptoms.length} characters` : 'Type or speak'}
            </span>

            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isRecording 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isRecording ? 'Stop' : 'Voice Input'}</span>
            </button>
          </div>
        </div>

        {/* Quick select symptom pills */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Common Symptoms (Tap to add)</span>
            <span className="text-[11px] text-slate-400">Quick Tags</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((item) => {
              const selected = symptoms.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleTogglePill(item.label)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm ${
                    selected
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'glass-panel hover:bg-white text-slate-700'
                  }`}
                >
                  {selected && <CheckCircle2 size={12} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration & Severity Bento Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Duration */}
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Symptom Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="Less than 24 hours">Less than 24 hours</option>
              <option value="1-3 days">1 to 3 days</option>
              <option value="4-7 days">4 to 7 days (About a week)</option>
              <option value="1-2 weeks">1 to 2 weeks</option>
              <option value="More than 2 weeks">More than 2 weeks (Chronic)</option>
            </select>
          </div>

          {/* Severity Meter */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Discomfort Severity
              </label>
              <span className={`text-xs font-black uppercase ${severityLabels[severity].color}`}>
                {severityLabels[severity].text}
              </span>
            </div>

            {/* Stars */}
            <div className="flex justify-between items-center bg-white/70 rounded-xl p-2.5 border border-slate-200/80">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className="p-1 hover:scale-125 transition-transform"
                  aria-label={`Severity ${s}`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      s <= severity ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {severityLabels[severity].desc}
            </p>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Continue Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-4 bg-white/85 backdrop-blur-xl border-t border-white/90 z-50 shadow-xl">
        <button
          disabled={isSubmitting || !symptoms.trim()}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-2xl py-3.5 font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Running Gemini AI Triage...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Continue to AI Triage</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
