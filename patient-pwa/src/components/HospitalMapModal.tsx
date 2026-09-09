import { useState } from 'react';
import { X, MapPin, Compass, Footprints } from 'lucide-react';

interface HospitalMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoom?: string;
  departmentName?: string;
}

export default function HospitalMapModal({
  isOpen,
  onClose,
  targetRoom = 'Room 104 (OPD Clinic)',
  departmentName = 'General Medicine',
}: HospitalMapModalProps) {
  const [activeFloor, setActiveFloor] = useState<'floor-1' | 'floor-2'>('floor-1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Hospital Indoor Navigation</h3>
              <p className="text-[11px] text-slate-400">Wing A · OPD Main Building</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close indoor map"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Floor Selection & Target Banner */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex gap-1 bg-slate-200/80 p-1 rounded-xl font-bold">
            <button
              onClick={() => setActiveFloor('floor-1')}
              className={`px-3 py-1 rounded-lg transition-all ${activeFloor === 'floor-1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Floor 1 (OPD)
            </button>
            <button
              onClick={() => setActiveFloor('floor-2')}
              className={`px-3 py-1 rounded-lg transition-all ${activeFloor === 'floor-2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Floor 2 (Labs)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 font-bold text-[11px]">
            <MapPin size={13} className="text-teal-600" />
            <span>Target: {targetRoom}</span>
          </div>
        </div>

        {/* Vector SVG Floor Map */}
        <div className="relative p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
          <svg
            viewBox="0 0 500 360"
            className="w-full h-auto max-h-[340px] drop-shadow-md rounded-2xl bg-white border border-slate-200 select-none"
          >
            {/* Grid background lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="500" height="360" fill="url(#grid)" />

            {/* Main Hallway outline */}
            <rect x="180" y="40" width="140" height="280" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="10" />

            {/* Entrance / Waiting Area */}
            <rect x="190" y="270" width="120" height="40" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" rx="8" />
            <text x="250" y="295" fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle">
              Waiting Lobby & Kiosk
            </text>

            {/* Room 101 - Triage Desk */}
            <rect x="30" y="240" width="130" height="70" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" rx="8" />
            <text x="95" y="275" fill="#991b1b" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 101: Triage Desk
            </text>

            {/* Room 102 - Pharmacy */}
            <rect x="340" y="240" width="130" height="70" fill="#f0fdf4" stroke="#4ade80" strokeWidth="1.5" rx="8" />
            <text x="405" y="275" fill="#166534" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 102: Pharmacy
            </text>

            {/* Room 103 - General OPD */}
            <rect x="30" y="140" width="130" height="75" fill="#e0e7ff" stroke="#818cf8" strokeWidth="1.5" rx="8" />
            <text x="95" y="178" fill="#3730a3" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 103: GP Cabin A
            </text>

            {/* Room 104 - TARGET: Consultation Clinic */}
            <rect
              x="340"
              y="140"
              width="130"
              height="75"
              fill="#ccfbf1"
              stroke="#0d9488"
              strokeWidth="2.5"
              rx="8"
              className="animate-pulse"
            />
            <text x="405" y="172" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 104: Consultation
            </text>
            <text x="405" y="188" fill="#115e59" fontSize="9" fontWeight="medium" textAnchor="middle">
              {departmentName}
            </text>

            {/* Room 105 - Cardiology & Specialist Cabin */}
            <rect x="30" y="40" width="130" height="75" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" rx="8" />
            <text x="95" y="78" fill="#92400e" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 105: Specialist Unit
            </text>

            {/* Room 106 - Diagnostic / ECG */}
            <rect x="340" y="40" width="130" height="75" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="1.5" rx="8" />
            <text x="405" y="78" fill="#5b21b6" fontSize="10" fontWeight="bold" textAnchor="middle">
              Room 106: Diagnostic / ECG
            </text>

            {/* Navigation Path: Animated dotted line from Lobby (x=250, y=280) to Room 104 (x=340, y=177) */}
            <path
              d="M 250 280 L 250 177 L 340 177"
              fill="none"
              stroke="#0d9488"
              strokeWidth="4"
              strokeDasharray="6 4"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="20"
                to="0"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>

            {/* Start point marker */}
            <circle cx="250" cy="280" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />

            {/* Destination Target Marker */}
            <circle cx="340" cy="177" r="8" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="340" cy="177" r="14" fill="none" stroke="#0d9488" strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r" values="8;18;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Step-by-step turn guidance */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Footprints size={14} className="text-teal-600" />
            Walking Directions
          </h4>
          <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside font-medium">
            <li>Start at the <strong>Main Entrance / Waiting Lobby</strong>.</li>
            <li>Walk straight through the central corridor (approx. 20 meters).</li>
            <li>Turn <strong>Right</strong> past the Pharmacy.</li>
            <li><strong>Room 104 ({departmentName})</strong> will be directly on your left.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
