import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useStaffAuth } from "@/state/staff-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";

export const Route = createFileRoute("/staff/patients/$patientId")({
  head: () => ({
    meta: [
      { title: "Patient Record — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Patient information, visit details, reported symptoms, structured triage summary, queue position and related alerts.",
      },
      { property: "og:title", content: "Patient Record — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Visit, symptom, triage and queue details for one OPD patient.",
      },
    ],
  }),
  component: PatientDetailPage,
});

function Section({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "emergency";
}) {
  return (
    <Card
      className={
        tone === "emergency" ? "border-2 border-emergency/50 bg-emergency-soft p-4" : "p-4"
      }
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <Separator className="my-3" />
      {children}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PatientDetailPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useStaffAuth();
  const queryClient = useQueryClient();

  // Fetch the queue ticket detail from the real API
  const { data: entry, isLoading, error } = useQuery({
    queryKey: ["queue-ticket", patientId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/queue/${patientId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch patient");
      const { data } = await res.json();
      
      const dob = data.visits?.patients?.date_of_birth;
      const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : null;
      
      return {
        id: data.id,
        token: data.token,
        priority: data.priority,
        status: data.status,
        visitId: data.visit_id,
        departmentId: data.department_id,
        waitMinutes: Math.round((Date.now() - new Date(data.arrival_time).getTime()) / 60000),
        arrivalTime: new Date(data.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calledAt: data.called_at ? new Date(data.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        department: data.departments?.name ?? 'General',
        patient: {
          name: data.visits?.patients?.full_name ?? 'Unknown',
          age: age ?? '-',
          gender: data.visits?.patients?.gender ?? '-',
        },
      };
    },
    enabled: !!user?.token,
  });

  // Fetch symptoms for the visit
  const { data: symptoms = [] } = useQuery({
    queryKey: ["visit-symptoms", entry?.visitId],
    queryFn: async () => {
      if (!entry?.visitId) return [];
      const res = await fetch(`${API_URL}/visits/${entry.visitId}/symptoms`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) return [];
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!entry?.visitId && !!user?.token,
  });

  // Fetch triage assessment for the visit
  const { data: triage } = useQuery({
    queryKey: ["visit-triage", entry?.visitId],
    queryFn: async () => {
      if (!entry?.visitId) return null;
      const res = await fetch(`${API_URL}/triage/${entry.visitId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) return null;
      const { data } = await res.json();
      return data;
    },
    enabled: !!entry?.visitId && !!user?.token,
  });

  // Fetch alerts for this queue ticket
  const { data: alerts = [] } = useQuery({
    queryKey: ["ticket-alerts", patientId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/alerts?status=ACTIVE`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) return [];
      const { data } = await res.json();
      return (data ?? []).filter((a: any) => a.queue_ticket_id === patientId);
    },
    enabled: !!user?.token,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${API_URL}/queue/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-ticket", patientId] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: () => toast.error("Failed to update status on server"),
  });

  // Alert acknowledge mutation
  const ackMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`${API_URL}/alerts/${alertId}/acknowledge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to acknowledge");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-alerts", patientId] });
      toast.success("Alert acknowledged");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <EmptyState
        title="Patient record not found"
        description="This queue ticket could not be loaded from the server."
        actionLabel="Back to patients"
        onAction={() => navigate({ to: "/staff/patients" })}
      />
    );
  }

  const triageResult = triage?.structured_result;

  return (
    <div className="space-y-6">
      <Link
        to="/staff/patients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to patients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{entry.patient.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{entry.token}</span>
            <span>·</span>
            <span>{entry.department}</span>
            <PriorityBadge priority={entry.priority} variant="soft" />
            <StatusBadge status={entry.status} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={statusMutation.isPending}
            onClick={() => {
              statusMutation.mutate({ id: entry.id, status: "CALLED" }, {
                onSuccess: () => toast.success(`Called ${entry.token}`),
              });
            }}
          >
            <PhoneCall aria-hidden />
            Call patient
          </Button>
          <Button
            disabled={statusMutation.isPending}
            onClick={() => {
              statusMutation.mutate({ id: entry.id, status: "COMPLETED" }, {
                onSuccess: () => toast.success(`${entry.token} marked complete`),
              });
            }}
          >
            <CheckCircle2 aria-hidden />
            Complete
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Section title="Alerts" tone="emergency">
          <ul className="space-y-3">
            {alerts.map((a: any) => (
              <li key={a.id} role="alert" className="flex flex-wrap items-center gap-3">
                <AlertTriangle className="size-5 text-emergency" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-emergency">
                    {a.type || "Alert"}
                  </p>
                  <p className="text-sm">{a.message}</p>
                  <p className="text-sm text-foreground/80">
                    Severity: {a.severity} · {new Date(a.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="emergency"
                  size="sm"
                  disabled={ackMutation.isPending}
                  onClick={() => ackMutation.mutate(a.id)}
                >
                  Acknowledge
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Patient information">
          <Detail label="Full name" value={entry.patient.name} />
          <Detail label="Age" value={entry.patient.age !== '-' ? `${entry.patient.age} yrs` : '-'} />
          <Detail label="Gender" value={entry.patient.gender || '-'} />
        </Section>

        <Section title="Queue information">
          <Detail label="Token" value={entry.token} />
          <Detail label="Current status" value={entry.status.replace("_", " ")} />
          <Detail label="Arrival" value={entry.arrivalTime} />
          <Detail label="Waiting time" value={`${entry.waitMinutes} min`} />
          {entry.calledAt && <Detail label="Called at" value={entry.calledAt} />}
          <Detail label="Department" value={entry.department} />
          <Detail label="Priority" value={entry.priority} />
        </Section>

        <Section title="Symptoms">
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No symptoms recorded for this visit.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {symptoms.map((s: any) => (
                <li key={s.id} className="rounded-lg border border-border bg-muted/40 p-2 text-sm">
                  <span className="block text-xs text-muted-foreground">
                    {s.symptom_name || s.symptomName}
                  </span>
                  <span className="font-medium">
                    {s.patient_description || s.patientDescription || '-'}
                  </span>
                  {(s.duration || s.severity) && (
                    <span className="block text-xs text-muted-foreground mt-1">
                      {s.duration && `Duration: ${s.duration}`}
                      {s.duration && s.severity && ' · '}
                      {s.severity && `Severity: ${s.severity}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Triage summary">
          {!triage ? (
            <p className="text-sm text-muted-foreground">No triage assessment completed yet.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={triage.urgency || 'GREEN'} />
                <span className="font-medium">
                  {triage.urgency === 'RED' ? 'Emergency' : triage.urgency === 'YELLOW' ? 'Priority' : 'Routine'}
                </span>
                {triage.confidence != null && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(triage.confidence * 100).toFixed(0)}% confidence)
                  </span>
                )}
              </div>

              {triageResult?.reasoning && (
                <p className="rounded-lg border border-border bg-muted/40 p-2">
                  <span className="block text-xs text-muted-foreground">AI Reasoning</span>
                  {triageResult.reasoning}
                </p>
              )}

              <p className="rounded-lg border border-border bg-muted/40 p-2">
                <span className="block text-xs text-muted-foreground">Recommended action</span>
                {triage.recommended_action || triageResult?.recommendedAction || 'ROUTINE'}
              </p>

              {triage.red_flags && Array.isArray(triage.red_flags) && triage.red_flags.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Red Flags</span>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {triage.red_flags.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Assessed {new Date(triage.created_at).toLocaleString()} · Gemini AI.
                Operational triage support only — not a diagnosis.
              </p>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
