import { useState } from "react";
import { AlertTriangle, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientDetailDialog } from "@/components/staff/PatientDetailDialog";
import { useStaffStore } from "@/state/staff-store";
import type { QueueEntry } from "@/types/opd";

export function EmergencyAlertPanel({ limit }: { limit?: number }) {
  const { alerts, acknowledgeAlert, queue, setStatus } = useStaffStore();
  const [viewing, setViewing] = useState<QueueEntry | null>(null);
  const active = alerts.filter((a) => !a.acknowledged);
  const shown = limit ? active.slice(0, limit) : active;

  if (active.length === 0) {
    return (
      <section
        aria-label="Emergency alerts"
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
      >
        <Check className="size-5 text-routine" aria-hidden />
        <p className="text-sm text-muted-foreground">
          No unacknowledged emergency alerts. New alerts stay here until acknowledged.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Emergency alerts" className="space-y-3">
      <div className="flex items-center gap-2">
        <BellRing className="size-4 text-emergency" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emergency">
          Emergency alert panel
        </h2>
        <span className="rounded-full bg-emergency px-2 py-0.5 text-xs font-semibold text-emergency-foreground">
          {active.length} active
        </span>
      </div>

      <ul className="space-y-3">
        {shown.map((alert) => {
          const entry = queue.find((q) => q.token === alert.token) ?? null;
          return (
            <li
              key={alert.id}
              className="rounded-xl border border-emergency/50 bg-emergency-soft p-4"
            >
              <div
                role="alert"
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:flex sm:items-center"
              >
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-emergency" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold">
                    <span className="text-xs font-bold uppercase tracking-wide text-emergency">
                      Emergency
                    </span>
                    <span className="tabular-nums">Token {alert.token}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {alert.department} · {alert.raisedAt}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">{alert.message}</p>
                </div>
                <div className="col-span-2 flex flex-wrap gap-2 sm:col-auto sm:shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewing(entry)}
                    disabled={!entry}
                    aria-label={`View patient for token ${alert.token}`}
                  >
                    View patient
                  </Button>
                  <Button
                    variant="emergency"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    aria-label={`Acknowledge alert for token ${alert.token}`}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {limit && active.length > limit ? (
        <p className="text-xs text-muted-foreground">
          +{active.length - limit} more awaiting acknowledgement.
        </p>
      ) : null}

      <PatientDetailDialog
        entry={viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        onCall={(e) => {
          setStatus(e.id, "CALLED");
          setViewing(null);
        }}
      />
    </section>
  );
}
