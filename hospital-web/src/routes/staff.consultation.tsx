import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  FileText,
  Save,
  Send,
  Building2,
  Calendar,
  History,
  ShieldAlert,
  Search,
  Activity,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { useStaffAuth } from "@/state/staff-auth";
import { useStaffStore } from "@/state/staff-store";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { findGenericEquivalent, PMBJP_DRUG_DATABASE } from "@/lib/janAushadhi";
import { HindiVoiceAssistant } from "@/components/prescriptions/HindiVoiceAssistant";

export const Route = createFileRoute("/staff/consultation")({
  head: () => ({
    meta: [
      { title: "Doctor Clinic & Consultations — Smart OPD" },
      { name: "description", content: "Doctor consultation workspace with multi-department queue support and SOAP clinical notes." },
    ],
  }),
  component: DoctorConsultationPage,
});

interface Department {
  id: string;
  name: string;
  code?: string;
  isPrimary?: boolean;
}

interface PatientQueueItem {
  id: string;
  token: string;
  priority: "RED" | "YELLOW" | "GREEN";
  status: string;
  arrival_time: string;
  visit_id: string;
  visits?: {
    id: string;
    patient_id: string;
    department_id: string;
    registered_at: string;
    raw_symptoms_text?: string;
    patients?: {
      id: string;
      full_name: string;
      patient_code: string;
      date_of_birth?: string;
      gender?: string;
      mobile?: string;
    };
  };
  departments?: {
    id: string;
    name: string;
  };
}

function DoctorConsultationPage() {
  const { user } = useStaffAuth();
  const { queue } = useStaffStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("all");
  const [doctorQueue, setDoctorQueue] = useState<PatientQueueItem[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [visitDetails, setVisitDetails] = useState<any | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // SOAP Clinical Form state
  const [subjectiveNotes, setSubjectiveNotes] = useState("");
  const [objectiveNotes, setObjectiveNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [plan, setPlan] = useState("");
  const [disposition, setDisposition] = useState("DISCHARGED");
  const [followUpDate, setFollowUpDate] = useState("");

  // 1. Fetch Doctor's Assigned Departments (Multi-department doctor support)
  const fetchMyDepartments = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/consultation/my-departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDepartments(json.data ?? []);
      }
    } catch (e) {
      console.warn("Using default department assignments", e);
    }
  };

  // 2. Fetch Queue for Doctor's assigned departments
  const fetchDoctorQueue = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/consultation/queue`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDoctorQueue(json.data ?? []);
      } else {
        // Fallback: filter global queue
        const filtered = queue.map((q) => ({
          id: q.id,
          token: q.token,
          priority: q.priority,
          status: q.status,
          arrival_time: q.arrivalTime,
          visit_id: q.id,
          visits: {
            id: q.id,
            patient_id: q.patient.id,
            department_id: "dept-1",
            registered_at: q.arrivalTime,
            raw_symptoms_text: q.symptomsSummary,
            patients: {
              id: q.patient.id,
              full_name: q.patient.name,
              patient_code: q.patient.idNumber,
              gender: q.patient.gender,
              mobile: q.patient.phone,
            },
          },
          departments: {
            id: "dept-1",
            name: q.department,
          },
        }));
        setDoctorQueue(filtered);
      }
    } catch (e) {
      console.error("Queue load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyDepartments();
    void fetchDoctorQueue();
  }, [user?.token]);

  // Load detailed visit data when selecting a patient
  const handleSelectPatient = async (item: PatientQueueItem) => {
    const visitId = item.visits?.id || item.visit_id;
    setSelectedVisit(item);
    if (!user?.token || !visitId) return;

    try {
      const res = await fetch(`${API_URL}/consultation/${visitId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setVisitDetails(json.data);
      }

      // Load patient historical visits
      const patientId = item.visits?.patient_id;
      if (patientId) {
        const histRes = await fetch(`${API_URL}/consultation/patient/${patientId}/history`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (histRes.ok) {
          const histJson = await histRes.json();
          setPatientHistory(histJson.data ?? []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Consultation
  const handleStartConsultation = async () => {
    if (!selectedVisit || !user?.token) return;
    const visitId = selectedVisit.visits?.id || selectedVisit.visit_id;
    try {
      const res = await fetch(`${API_URL}/consultation/${visitId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        toast.success(`Consultation started for ${selectedVisit.token}`);
        void fetchDoctorQueue();
      }
    } catch (err) {
      toast.error("Failed to start consultation");
    }
  };

  // Save Clinical Notes (SOAP)
  const handleSaveNotes = async () => {
    if (!selectedVisit || !user?.token) return;
    const visitId = selectedVisit.visits?.id || selectedVisit.visit_id;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/consultation/${visitId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          subjectiveNotes,
          objectiveNotes,
          assessment: diagnosis,
          plan,
          diagnosis,
          disposition,
          followUpDate: followUpDate || undefined,
        }),
      });
      if (res.ok) {
        toast.success("SOAP Clinical notes recorded successfully");
      } else {
        toast.error("Failed to save clinical notes");
      }
    } catch (err) {
      toast.error("Network error while saving notes");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete Visit & Disposition
  const handleCompleteVisit = async () => {
    if (!selectedVisit || !user?.token) return;
    if (!diagnosis.trim()) {
      toast.error("Please enter a clinical diagnosis before completing the visit.");
      return;
    }
    const visitId = selectedVisit.visits?.id || selectedVisit.visit_id;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/consultation/${visitId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          diagnosis,
          disposition,
          notes: plan,
        }),
      });
      if (res.ok) {
        toast.success(`Visit completed. Disposition: ${disposition}`);
        setSelectedVisit(null);
        setVisitDetails(null);
        setSubjectiveNotes("");
        setObjectiveNotes("");
        setDiagnosis("");
        setPlan("");
        void fetchDoctorQueue();
      } else {
        toast.error("Failed to complete visit");
      }
    } catch (err) {
      toast.error("Network error completing visit");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = doctorQueue.filter((item) => {
    if (selectedDeptId === "all") return true;
    return item.departments?.id === selectedDeptId || item.visits?.department_id === selectedDeptId;
  });

  return (
    <div className="space-y-6">
      {/* Header with Doctor Specialization Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Clinician Consultation Portal</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              DOCTOR
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Specialized multi-department queue intake & clinical SOAP encounters
          </p>
        </div>

        {/* Assigned Specializations */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Building2 className="size-3.5" /> Assigned Units:
          </span>
          {departments.length > 0 ? (
            departments.map((dept) => (
              <span
                key={dept.id}
                className="inline-flex items-center gap-1 rounded-xl bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground border border-border/60"
              >
                {dept.name}
                {dept.isPrimary && <span className="text-[10px] text-primary">★</span>}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">General OPD Duty Clinician</span>
          )}
        </div>
      </div>

      {/* Department Filter Tabs for Multi-Tasking Doctors */}
      {departments.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={selectedDeptId === "all" ? "default" : "outline"}
            onClick={() => setSelectedDeptId("all")}
            className="rounded-xl text-xs font-bold"
          >
            All Assigned Units ({doctorQueue.length})
          </Button>
          {departments.map((d) => {
            const count = doctorQueue.filter(
              (q) => q.departments?.id === d.id || q.visits?.department_id === d.id
            ).length;
            return (
              <Button
                key={d.id}
                size="sm"
                variant={selectedDeptId === d.id ? "default" : "outline"}
                onClick={() => setSelectedDeptId(d.id)}
                className="rounded-xl text-xs font-bold"
              >
                {d.name} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Waiting Queue (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Patient Queue ({filteredQueue.length})
            </h2>
            <Button size="sm" variant="ghost" onClick={fetchDoctorQueue} className="text-xs">
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Loading clinical queue...</span>
            </div>
          ) : filteredQueue.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground rounded-2xl">
              No patients waiting in your assigned departments.
            </Card>
          ) : (
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredQueue.map((item) => {
                const isSelected = selectedVisit?.id === item.id;
                const patient = item.visits?.patients;
                const priorityBadge =
                  item.priority === "RED"
                    ? "bg-red-500/15 text-red-700 border-red-200 dark:text-red-400"
                    : item.priority === "YELLOW"
                    ? "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400"
                    : "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectPatient(item)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                      isSelected
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "bg-card border-border/70 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-extrabold text-foreground">{item.token}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                          {item.priority}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" /> {item.arrival_time || "10:00"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="font-bold text-sm text-foreground">
                        {patient?.full_name || `Patient ${item.token}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.departments?.name || "General OPD"} · {patient?.gender || "Male"} · {patient?.patient_code || "PT-001"}
                      </p>
                    </div>

                    {item.visits?.raw_symptoms_text && (
                      <p className="mt-2 text-xs text-foreground/80 bg-muted/50 p-2 rounded-xl border border-border/50 line-clamp-2">
                        {item.visits.raw_symptoms_text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Consultation Encounter Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {selectedVisit ? (
            <div className="space-y-5">
              {/* Active Patient Card */}
              <Card className="p-5 rounded-3xl border-primary/30 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-foreground">
                        {selectedVisit.visits?.patients?.full_name || selectedVisit.token}
                      </h2>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Token {selectedVisit.token}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Code: {selectedVisit.visits?.patients?.patient_code || "PT-001"} · Phone:{" "}
                      {selectedVisit.visits?.patients?.mobile || "N/A"}
                    </p>
                  </div>

                  <Button size="sm" onClick={handleStartConsultation} className="rounded-xl gap-1.5 font-bold">
                    <Stethoscope className="size-4" /> Start Consultation
                  </Button>
                </div>

                {/* Triage summary banner */}
                {visitDetails?.triage && (
                  <div className="mt-4 rounded-2xl bg-muted/60 p-3.5 border border-border/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Activity className="size-3.5 text-primary" /> AI Triage Assessment
                      </span>
                      <span className="font-bold text-foreground">
                        Confidence: {Math.round((visitDetails.triage.confidence ?? 0.85) * 100)}%
                      </span>
                    </div>
                    <p className="text-foreground/90 font-medium">{visitDetails.triage.reasoning}</p>
                    {visitDetails.triage.red_flags && visitDetails.triage.red_flags.length > 0 && (
                      <div className="flex items-center gap-1 text-red-600 font-bold text-[11px]">
                        <ShieldAlert className="size-3.5" />
                        Red flags: {visitDetails.triage.red_flags.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* SOAP Encounter Documentation Form */}
              <Card className="p-5 rounded-3xl space-y-4">
                <div className="border-b border-border/70 pb-2">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                    SOAP Clinical Notes
                  </h3>
                  <p className="text-xs text-muted-foreground">Standard clinical record format for outpatient care</p>
                </div>

                <div className="space-y-3.5">
                  {/* Subjective */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      (S) Subjective — Chief Complaint & History
                    </label>
                    <textarea
                      rows={2}
                      value={subjectiveNotes}
                      onChange={(e) => setSubjectiveNotes(e.target.value)}
                      placeholder="Patient statements, symptoms onset, duration, pain progression..."
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Objective */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      (O) Objective — Physical Examination & Vitals
                    </label>
                    <textarea
                      rows={2}
                      value={objectiveNotes}
                      onChange={(e) => setObjectiveNotes(e.target.value)}
                      placeholder="Observed vitals, BP, HR, Auscultation, physical signs..."
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Assessment / Diagnosis */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      (A) Assessment — Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Plan / Rx */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        (P) Plan — Rx & Treatment Instructions
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        PMBJP Jan Aushadhi & Hindi Audio Enabled
                      </span>
                    </div>

                    {/* Quick Drug Add Buttons */}
                    <div className="flex flex-wrap gap-1 pb-1">
                      {PMBJP_DRUG_DATABASE.slice(0, 4).map((med) => (
                        <button
                          key={med.brandedName}
                          type="button"
                          onClick={() => {
                            const newPlan = plan ? `${plan}\n• ${med.brandedName} — ${med.dosage}` : `• ${med.brandedName} — ${med.dosage}`;
                            setPlan(newPlan);
                          }}
                          className="rounded-md bg-muted hover:bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground border border-border/60 transition-colors"
                        >
                          + {med.brandedName.split(" ")[0]}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="Prescriptions (Drug name, dosage, frequency), diet, rest..."
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                    />

                    {/* Jan Aushadhi Generic Salt & Savings Matching */}
                    {(() => {
                      const detected = PMBJP_DRUG_DATABASE.find(
                        (d) => plan.toLowerCase().includes(d.brandedName.toLowerCase().split(" ")[0].toLowerCase())
                      ) || (plan ? findGenericEquivalent(plan) : null);

                      if (!detected) return null;

                      return (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                Jan Aushadhi (PMBJP) Alternative
                              </span>
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                Save {detected.savingsPercent}%
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              ₹{detected.janAushadhiPriceInr} vs <s className="text-muted-foreground">₹{detected.brandedPriceInr}</s>
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-muted-foreground block text-[11px]">Chemical Salt Equivalent:</span>
                            <span className="font-semibold text-foreground">{detected.genericSalt}</span>
                          </div>

                          {/* Accessible Hindi Voice Assistant */}
                          <HindiVoiceAssistant
                            medicationName={detected.genericSalt}
                            hindiText={detected.directionsHindi}
                            englishText={detected.directionsEnglish}
                            patientName={selectedVisit.visits?.patients?.full_name}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Disposition & Follow-up */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Patient Disposition
                      </label>
                      <select
                        value={disposition}
                        onChange={(e) => setDisposition(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                      >
                        <option value="DISCHARGED">Discharge / Home Care</option>
                        <option value="ADMITTED">Admit to Inpatient / Ward</option>
                        <option value="REFERRED">Refer to Specialist Unit</option>
                        <option value="FOLLOW_UP">Follow-up Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Follow-up Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 border-t border-border/70 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={submitting}
                    className="rounded-xl gap-1.5 text-xs font-bold"
                  >
                    <Save className="size-3.5" /> Save SOAP Notes
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCompleteVisit}
                    disabled={submitting}
                    className="rounded-xl gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="size-3.5" /> Complete Encounter
                  </Button>
                </div>
              </Card>

              {/* Patient Historical Visits */}
              {patientHistory.length > 0 && (
                <Card className="p-5 rounded-3xl space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="size-3.5 text-primary" /> Past Encounters ({patientHistory.length})
                  </h3>
                  <div className="space-y-2">
                    {patientHistory.slice(0, 3).map((h) => (
                      <div key={h.id} className="rounded-xl bg-muted/40 p-3 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-foreground">{h.departments?.name || "OPD"}</p>
                          <p className="text-muted-foreground text-[11px]">
                            {new Date(h.registered_at).toLocaleDateString()} · {h.clinical_records?.[0]?.diagnosis || "Routine OPD checkup"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary">
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center rounded-3xl border-dashed">
              <Stethoscope className="size-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-bold text-base text-foreground">Select a Patient to Begin Encounter</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Choose a waiting patient from your assigned department queue on the left to review vitals, symptoms, and record SOAP documentation.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
