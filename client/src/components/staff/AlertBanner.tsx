import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaffStore } from "@/state/staff-store";

export function AlertBanner({ compact = false }: { compact?: boolean }) {
  const { alerts, acknowledgeAlert } = useStaffStore();
  const active = alerts.filter((a) => !a.acknowledged);

  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      {active.slice(0, compact ? 1 : active.length).map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-emergency/40 bg-emergency-soft px-4 py-3"
        >
          <AlertTriangle className="size-5 shrink-0 text-emergency" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emergency">
              EMERGENCY ALERT · Token {alert.token}
            </p>
            <p className="text-sm text-foreground/80">
              {alert.message} — {alert.department} · raised {alert.raisedAt}
            </p>
          </div>
          <Button variant="emergency" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
            Acknowledge
          </Button>
        </div>
      ))}
    </div>
  );
}
