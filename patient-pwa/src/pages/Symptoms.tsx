import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mic, Star, ArrowRight, Loader2 } from 'lucide-react';

export default function Symptoms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-3 days');
  const [severity, setSeverity] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!symptoms) return;
    setIsSubmitting(true);
    try {
      // Create visit
      const deptRes = await fetch(`${import.meta.env.VITE_API_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const deptData = await deptRes.json();
      const gpDept = (deptData?.data || []).find((d: any) => d.code === 'GP') || (deptData?.data?.[0] || { id: 'fallback-uuid' });

      const visitRes = await fetch(`${import.meta.env.VITE_API_URL}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          patientId: user?.id,
          departmentId: gpDept.id,
          visitType: "OPD",
          source: "KIOSK"
        })
      });

      if (!visitRes.ok) throw new Error("Failed to create visit");
      const visitData = await visitRes.json();

      // Submit symptoms
      await fetch(`${import.meta.env.VITE_API_URL}/visits/${visitData.data.id}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          symptomName: symptoms.slice(0, 50), // brief name
          patientDescription: symptoms,
          duration,
          severity: severity.toString()
        })
      });

      navigate('/dashboard/triage', { state: { visitId: visitData.data.id } });
    } catch (err) {
      console.error(err);
      alert("Error submitting symptoms");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-900 font-sans h-full overflow-y-auto flex flex-col relative pb-[100px]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(112,140,253,0.15)_0%,transparent_40%),radial-gradient(circle_at_85%_25%,rgba(57,128,244,0.1)_0%,transparent_45%),radial-gradient(circle_at_50%_80%,rgba(218,226,253,0.2)_0%,transparent_50%)] bg-slate-50"></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/50 flex justify-between items-center px-4 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-800 bg-white/60 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white/80 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">OPD Flow</h1>
        </div>
        <div className="text-slate-600 font-mono text-sm font-medium bg-white/50 px-3 py-1 rounded-full border border-white/60">Step 2 of 4</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16 px-4 py-6 flex flex-col gap-6 w-full max-w-lg mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">How are you feeling today?</h2>
          <p className="text-slate-600">Please describe your symptoms in detail.</p>
        </div>

        {/* Input Area */}
        <div className="relative bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-5 transition-colors focus-within:border-blue-400 focus-within:bg-white/70">
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-400 resize-none h-32 text-lg outline-none" 
            placeholder="E.g., I've had a severe headache and slight fever since yesterday morning..."
          />
          <button className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors border border-white/20">
            <Mic size={24} />
          </button>
        </div>

        {/* Quick Select Chips */}
        <div>
          <h3 className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">Common Symptoms</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {['Fever', 'Cough', 'Headache', 'Nausea', 'Fatigue'].map(s => (
              <button 
                key={s}
                onClick={() => setSymptoms(prev => prev ? `${prev}, ${s}` : s)}
                className="flex-shrink-0 px-5 py-2.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 text-slate-800 hover:bg-white/70 transition-colors shadow-sm whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Severity Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-5">
            <h3 className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">Duration</h3>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/40 border border-white/60 rounded-xl py-2.5 px-3 focus:border-blue-400 focus:ring-0 text-slate-800 outline-none shadow-sm"
            >
              <option>Less than 24 hours</option>
              <option>1-3 days</option>
              <option>3-7 days</option>
              <option>More than a week</option>
            </select>
          </div>

          <div className="bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-5 flex flex-col justify-between">
            <h3 className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Severity</h3>
            <div className="flex items-center justify-between mt-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  onClick={() => setSeverity(s)}
                  className={`w-6 h-6 ${s <= severity ? 'text-blue-500 fill-blue-500' : 'text-slate-300'}`} 
                />
              ))}
            </div>
            <div className="text-sm font-medium text-slate-800 mt-2 text-center bg-white/40 rounded-lg py-1 border border-white/50">
              {severity <= 2 ? 'Mild' : severity === 3 ? 'Moderate' : 'Severe'}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/60 backdrop-blur-xl border-t border-white/60 z-40 shadow-lg">
        <button 
          disabled={isSubmitting || !symptoms}
          onClick={handleSubmit}
          className="w-full max-w-lg mx-auto bg-slate-900 text-white rounded-2xl py-4 font-semibold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
            <>
              Continue to Triage
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
