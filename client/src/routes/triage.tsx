import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { triageService } from "@/services";

const TRIAGE_PROCESSING_STEPS = triageService.getProcessingSteps();
import { useKioskSession } from "@/state/kiosk-session";

export const Route = createFileRoute("/triage")({
  head: () => ({
    meta: [
      { title: "Assessment Result — Smart OPD Kiosk" },
      {
        name: "description",
        content: "Your answers are being reviewed to assign an OPD department and queue priority.",
      },
      { property: "og:title", content: "Assessment Result — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Operational queue priority and department assignment for your OPD visit.",
      },
    ],
  }),
  component: TriagePage,
});

function TriagePage() {
  const { session } = useKioskSession();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const result = session.triageResult;

  useEffect(() => {
    if (!result) return;
    const timers = [
      window.setTimeout(() => setStepIndex(1), 1200),
      window.setTimeout(() => setStepIndex(2), 2400),
      window.setTimeout(() => setDone(true), 3600),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [result]);

  if (!result) {
    return (
      <KioskShell step="symptoms">
        <EmptyState
          className="mt-6"
          title="Nothing to review yet"
          description="Please share your symptoms first so we can assign your queue."
        />
        <div className="mt-6 flex justify-center">
          <Button size="kioskLg" asChild>
            <Link to="/symptoms">Go to symptoms</Link>
          </Button>
        </div>
      </KioskShell>
    );
  }

  if (!done) {
    return (
      <KioskShell step="symptoms">
        <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
          <Loader2 className="size-12 animate-spin text-teal" aria-hidden />
          <h1 className="kiosk-heading mt-8">Reviewing your information…</h1>
          <p className="kiosk-sub mt-4 text-muted-foreground" role="status" aria-live="polite">
            {TRIAGE_PROCESSING_STEPS[stepIndex]}
          </p>
          <p className="mt-8 text-base text-muted-foreground">
            This takes a few seconds. Please stay at the kiosk.
          </p>
        </div>
      </KioskShell>
    );
  }

  const emergency = result.priority === "RED";

  return (
    <KioskShell step="symptoms">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: session.reducedMotion ? 0 : 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span
          className={
            emergency
              ? "mx-auto flex size-20 items-center justify-center rounded-full bg-emergency/10 text-emergency"
              : "mx-auto flex size-20 items-center justify-center rounded-full bg-teal/10 text-teal"
          }
        >
          {emergency ? (
            <ShieldAlert className="size-10" aria-hidden />
          ) : (
            <CheckCircle2 className="size-10" aria-hidden />
          )}
        </span>

        <h1 className="kiosk-heading mt-6">Your information has been assessed.</h1>
        <p className="kiosk-sub mt-4 text-muted-foreground">
          {triageService.getPriorityStatusLine(result.priority)}
        </p>

        <Card className="mt-8 grid gap-6 p-8 text-left sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Priority</p>
            <p className="mt-2 text-3xl font-bold">
              {triageService.getPriorityLabel(result.priority)}
            </p>
            <div className="mt-3">
              <PriorityBadge priority={result.priority} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="mt-2 text-3xl font-bold">{result.department}</p>
          </div>
        </Card>

        <p className="mt-6 text-base text-muted-foreground">
          This is an operational queue decision only. It is not a diagnosis, and a clinician will
          review you in person.
        </p>

        <Button size="kioskLg" className="mt-8" onClick={() => navigate({ to: "/ticket" })}>
          See my token
          <ArrowRight aria-hidden />
        </Button>
      </motion.div>
    </KioskShell>
  );
}
