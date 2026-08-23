import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useStaffStore } from "@/state/staff-store";
import { visitService } from "@/services";

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
  const { queue, alerts, acknowledgeAlert, setStatus } = useStaffStore();
  const entry = queue.find((e) => e.id === patientId);

  if (!entry) {
    return (
      <EmptyState
        title="Patient record not found"
        description="This record is not in the current mock queue."
        actionLabel="Back to patients"
        onAction={() => navigate({ to: "/staff/patients" })}
      />
    );
  }

  const visit = visitService.getVisitRecord(entry);
  const triage = visitService.getTriageRecord(entry);
  const related = alerts.filter((a) => a.token === entry.token);
  const ahead = queue.filter(
    (e) =>
      e.status === "WAITING" &&
      e.department === entry.department &&
      e.waitMinutes > entry.waitMinutes,
  ).length;

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
            onClick={() => {
              setStatus(entry.id, "CALLED");
              toast.success(`Called ${entry.token}`);
            }}
          >
            <PhoneCall aria-hidden />
            Call patient
          </Button>
          <Button
            onClick={() => {
              setStatus(entry.id, "COMPLETED");
              toast.success(`${entry.token} marked complete`);
            }}
          >
            <CheckCircle2 aria-hidden />
            Complete
          </Button>
        </div>
      </div>

      {related.some((a) => !a.acknowledged) ? (
        <Section title="Alerts" tone="emergency">
          <ul className="space-y-3">
            {related
              .filter((a) => !a.acknowledged)
              .map((a) => (
                <li key={a.id} role="alert" className="flex flex-wrap items-center gap-3">
                  <AlertTriangle className="size-5 text-emergency" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold uppercase tracking-wide text-emergency">
                      Emergency alert
                    </p>
                    <p className="text-sm">{a.message}</p>
                    <p className="text-sm text-foreground/80">
                      Department: {a.department} · raised {a.raisedAt}
                    </p>
                  </div>
                  <Button variant="emergency" size="sm" onClick={() => acknowledgeAlert(a.id)}>
                    Acknowledge
                  </Button>
                </li>
              ))}
          </ul>
        </Section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Patient information">
          <Detail label="Full name" value={entry.patient.name} />
          <Detail label="Age" value={`${entry.patient.age} yrs`} />
          <Detail label="Gender" value={entry.patient.gender} />
          <Detail label="Mobile" value={entry.patient.phone} />
          <Detail label="ID reference" value={entry.patient.idNumber} />
        </Section>

        <Section title="Visit information">
          <Detail label="Visit ID" value={visit.visitId} />
          <Detail label="Visit type" value={visit.visitType} />
          <Detail label="Registered via" value={visit.registrationMethod} />
          <Detail label="Arrival" value={visit.arrivalTime} />
          <Detail label="Department" value={visit.department} />
          <Detail label="Assigned room" value={visit.assignedRoom} />
          <Detail label="Clinician" value={visit.clinician} />
        </Section>

        <Section title="Symptoms">
          <p className="text-sm">{entry.symptomsSummary}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {triage.observations.map((o) => (
              <li key={o.label} className="rounded-lg border border-border bg-muted/40 p-2 text-sm">
                <span className="block text-xs text-muted-foreground">{o.label}</span>
                <span className="font-medium">{o.value}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Triage summary">
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={triage.priority} />
              <span className="font-medium">{triage.priorityLabel}</span>
            </div>
            <p>{triage.reviewNote}</p>
            <p className="rounded-lg border border-border bg-muted/40 p-2">
              <span className="block text-xs text-muted-foreground">Recommended action</span>
              {triage.recommendedAction}
            </p>
            {triage.redFlags.length > 0 ? (
              <div>
                <span className="text-xs text-muted-foreground">Flags</span>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {triage.redFlags.map((f) => (
                    <li
                      key={f}
                      className="rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Assessed {triage.assessedAt} · {triage.source}. Operational triage support only — not
              a diagnosis.
            </p>
          </div>
        </Section>

        <Section title="Queue information">
          <Detail label="Token" value={entry.token} />
          <Detail label="Current status" value={entry.status.replace("_", " ")} />
          <Detail label="Waiting time" value={`${entry.waitMinutes} min`} />
          <Detail label="Patients ahead in department" value={ahead} />
          <Detail label="Department" value={entry.department} />
        </Section>

        <Section title="Alert history">
          {related.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts raised for this token.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {related.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3">
                  <span>
                    {a.message}
                    <span className="block text-xs text-muted-foreground">
                      {a.department} · {a.raisedAt}
                    </span>
                  </span>
                  <span
                    className={
                      a.acknowledged
                        ? "text-xs font-medium text-routine"
                        : "text-xs font-medium text-emergency"
                    }
                  >
                    {a.acknowledged ? "Acknowledged" : "Active"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
