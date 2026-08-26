import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle, ArrowRight, Loader2, TriangleAlert } from 'lucide-react';

export default function Triage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const visitId = location.state?.visitId;
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [visit, setVisit] = useState<any>(null);

  useEffect(() => {
    if (!visitId) {
      navigate('/dashboard');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/visits`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const data = await res.json();
        const currentVisit = data.data.find((v: any) => v.id === visitId);
        setVisit(currentVisit);

        const symRes = await fetch(`${import.meta.env.VITE_API_URL}/visits/${visitId}/symptoms`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const symData = await symRes.json();
        setSymptoms(symData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [visitId, user, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-full overflow-y-auto"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  const primarySymptom = symptoms[0];
  const severityStr = primarySymptom?.severity <= 2 ? 'Mild' : primarySymptom?.severity === 3 ? 'Moderate' : 'Severe';

  return (
    <div className="text-slate-900 font-sans h-full overflow-y-auto flex flex-col relative pb-24 md:pb-0">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(112,140,253,0.15)_0%,transparent_40%),radial-gradient(circle_at_85%_25%,rgba(57,128,244,0.1)_0%,transparent_45%),radial-gradient(circle_at_50%_80%,rgba(218,226,253,0.2)_0%,transparent_50%)] bg-slate-50"></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/50 flex justify-between items-center px-4 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-800 bg-white/60 backdrop-blur-md shadow-sm border border-white/80 hover:bg-white/80 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">OPD Flow</h1>
        </div>
        <div className="text-slate-600 font-mono text-sm font-medium bg-white/50 px-3 py-1 rounded-full border border-white/60">Step 3 of 4</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mt-16 px-4 py-6 w-full max-w-lg mx-auto flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Triage Result</h1>
          <p className="text-slate-600 text-sm">Based on your reported symptoms.</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-white/40 border border-white/60 rounded-xl p-4 flex gap-3 items-start backdrop-blur-md shadow-[0_4px_16px_0_rgba(255,218,214,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5"></div>
          <AlertCircle className="text-red-500 mt-0.5 relative z-10 shrink-0" size={20} />
          <p className="text-sm text-slate-800 relative z-10 font-medium">Not a diagnosis; clinical decisions are made by staff.</p>
        </div>

        {/* Preliminary Assessment Bento Card */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-6">Preliminary Assessment</h2>
          
          <div className="flex flex-col gap-6">
            {/* Priority Row */}
            <div className="flex items-center justify-between border-b border-white/40 pb-4">
              <span className="text-slate-600 font-medium">Urgency Priority</span>
              <div className="bg-white/60 backdrop-blur-md text-amber-600 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/80 shadow-sm">
                <TriangleAlert size={16} />
                <span className="text-xs uppercase font-bold">{severityStr === 'Severe' ? 'High' : 'Standard'}</span>
              </div>
            </div>

            {/* Recommended Dept Row */}
            <div className="flex items-center justify-between border-b border-white/40 pb-4">
              <span className="text-slate-600 font-medium">Recommended Dept.</span>
              <span className="text-lg font-semibold text-slate-900 bg-white/40 px-3 py-1 rounded-lg border border-white/50">
                {visit?.department?.name || 'General Practice'}
              </span>
            </div>

            {/* Key Symptoms Summary */}
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Key Indicators</span>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(sym => (
                  <span key={sym.id} className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg font-mono text-sm text-slate-800 border border-white/60 shadow-sm">
                    {sym.symptomName} ({sym.duration})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps Bento Card */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Next Steps</h2>
          <p className="text-sm text-slate-700 mb-6 font-medium leading-relaxed">
            Your queue token has been generated. You will be called by the <span className="font-bold text-slate-900 bg-white/60 px-2 py-0.5 rounded border border-white/50">{visit?.department?.name || 'General Practice'}</span> department shortly.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors border border-white/20"
          >
            View Live Queue Status
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
