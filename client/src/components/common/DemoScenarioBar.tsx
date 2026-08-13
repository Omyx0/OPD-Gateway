import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Play, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { demoService, type DemoScenario } from "@/services";
import { useKioskSession } from "@/state/kiosk-session";
import { useStaffStore } from "@/state/staff-store";

/**
 * Frontend-only demo launcher. Fills the kiosk session with a scripted
 * journey and pushes the same patient into the shared mock queue.
 */
export function DemoScenarioBar() {
  const navigate = useNavigate();
  const { update } = useKioskSession();
  const { addPatient, positionForPriority } = useStaffStore();
  const [busy, setBusy] = useState<string | null>(null);

  function run(scenario: DemoScenario) {
    setBusy(scenario.id);
    const entry = addPatient(demoService.toIntake(scenario));
    update({
      registrationMethod: "ID_SCAN",
      patient: scenario.patient,
      symptoms: demoService.toMessages(scenario),
      triageResult: demoService.toTriageResult(scenario),
      ticket: {
        token: entry.token,
        position: positionForPriority(scenario.priority),
        estimatedWaitMinutes:
          scenario.priority === "RED" ? 2 : scenario.priority === "YELLOW" ? 12 : 24,
      },
    });
    toast.success(`${scenario.patient.name} added to the queue as ${entry.token}`);
    navigate({ to: "/triage" });
  }

  function addRush() {
    setBusy("rush");
    demoService.listRushIntakes().forEach((intake) => addPatient(intake));
    toast.success(`${demoService.listRushIntakes().length} more patients added to the mock queue`);
    setBusy(null);
  }

  return (
    <Card className="mt-10 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Demonstration scenarios</h2>
        <p className="text-sm text-muted-foreground">
          Mock data only — each scenario also appears on the staff dashboard.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {demoService.listScenarios().map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => run(scenario)}
            disabled={busy !== null}
            className="flex min-h-28 flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
          >
            <span className="flex">
              <PriorityBadge priority={scenario.priority} />
            </span>
            <span className="mt-3 font-semibold">{scenario.label}</span>
            <span className="mt-1 text-sm text-muted-foreground">{scenario.description}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              <Play className="size-4" aria-hidden />
              Run journey
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={addRush}
          disabled={busy !== null}
          className="flex min-h-28 flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-surface text-primary">
            <Users className="size-4" aria-hidden />
          </span>
          <span className="mt-3 font-semibold">Multiple patients</span>
          <span className="mt-1 text-sm text-muted-foreground">
            Add four more waiting patients across departments.
          </span>
          <span className="mt-3 text-sm font-medium text-primary">Fill the queue</span>
        </button>
      </div>

      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/login" })}>
          Open staff dashboard
        </Button>
      </div>
    </Card>
  );
}
