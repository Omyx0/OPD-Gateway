import { createFileRoute } from "@tanstack/react-router";
import { BellOff } from "lucide-react";
import { AlertBanner } from "@/components/staff/AlertBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { useStaffStore } from "@/state/staff-store";

export const Route = createFileRoute("/staff/alerts")({
  head: () => ({
    meta: [
      { title: "Emergency Alerts — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Persistent emergency alerts raised during OPD triage, with acknowledgement state.",
      },
      { property: "og:title", content: "Emergency Alerts — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Emergency alerts raised during OPD triage and their acknowledgement state.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts } = useStaffStore();
  const acknowledged = alerts.filter((a) => a.acknowledged);
  const active = alerts.filter((a) => !a.acknowledged);
  const { phase, setPhase, reload } = useMockLoad();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Emergency and escalation notices from the current mock queue
          </p>
        </div>
        <StateDemoBar phase={phase} onChange={setPhase} />
      </div>

      <AsyncSection
        phase={phase}
        loadingLabel="Checking for emergency alerts"
        errorTitle="Alerts didn't load"
        errorDescription="We couldn't check for emergency alerts. Watch the queue board and try again."
        onRetry={reload}
        emptyTitle="No alerts to show"
        emptyDescription="Emergency alerts raised at the kiosk will appear here."
      >
        {active.length > 0 ? (
          <AlertBanner />
        ) : (
          <EmptyState
            icon={BellOff}
            title="No active alerts"
            description="All emergency alerts have been acknowledged."
          />
        )}

        {acknowledged.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Acknowledged
            </h2>
            {acknowledged.map((a) => (
              <Card key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>
                  Token {a.token} · {a.department}
                </span>
                <span className="text-muted-foreground">{a.raisedAt}</span>
              </Card>
            ))}
          </section>
        ) : null}
      </AsyncSection>
    </div>
  );
}
