import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ListOrdered, Loader2, MapPin, Printer, Users } from "lucide-react";
import { motion } from "motion/react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { useKioskSession } from "@/state/kiosk-session";

export const Route = createFileRoute("/ticket")({
  head: () => ({
    meta: [
      { title: "Your OPD Token — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Your OPD queue token with department, estimated wait time and the number of patients ahead of you.",
      },
      { property: "og:title", content: "Your OPD Token — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Your OPD token, department, estimated wait and patients ahead.",
      },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { session } = useKioskSession();
  const { ticket, triageResult } = session;
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [failNext, setFailNext] = useState(false);

  useEffect(() => {
    setPhase("loading");
    const t = window.setTimeout(() => setPhase(failNext ? "error" : "ready"), 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (!ticket || !triageResult) {
    return (
      <KioskShell step="ticket">
        <EmptyState
          className="mt-6"
          title="No active token"
          description="You have not completed registration in this session yet."
        />
        <div className="mt-6 flex justify-center">
          <Button size="kioskLg" asChild>
            <Link to="/">Start registration</Link>
          </Button>
        </div>
      </KioskShell>
    );
  }

  if (phase === "loading") {
    return (
      <KioskShell step="ticket">
        <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
          <Loader2 className="size-12 animate-spin text-teal" aria-hidden />
          <h1 className="kiosk-heading mt-8">Generating your token…</h1>
          <p className="kiosk-sub mt-4 text-muted-foreground" role="status" aria-live="polite">
            Reserving your place in the OPD queue. Please stay at the kiosk.
          </p>
        </div>
      </KioskShell>
    );
  }

  if (phase === "error") {
    return (
      <KioskShell step="ticket">
        <ErrorState
          className="mt-8"
          title="We couldn't print your token"
          description="Your registration is saved on this kiosk. Try again, or ask the help desk to issue your token manually."
          onRetry={() => {
            setFailNext(false);
            setAttempt((a) => a + 1);
          }}
        />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="kioskLg" asChild>
            <Link to="/queue">Track my queue instead</Link>
          </Button>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell step="ticket">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: session.reducedMotion ? 0 : 0.3, ease: "easeOut" }}
        >
          <Card className="p-10">
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Your OPD token
            </p>
            <p className="mt-3 text-7xl font-bold tracking-tight tabular-nums sm:text-8xl">
              {ticket.token}
            </p>
            <div className="mt-6 flex justify-center">
              <PriorityBadge priority={triageResult.priority} size="lg" />
            </div>
          </Card>
        </motion.div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Info icon={MapPin} label="Department" value={triageResult.department} />
          <Info
            icon={Clock}
            label="Estimated wait"
            value={`${ticket.estimatedWaitMinutes} minutes`}
          />
          <Info icon={Users} label="Patients ahead" value={String(ticket.position)} />
        </div>

        <Card className="mt-6 p-6 text-left">
          <h2 className="text-lg font-semibold">Please keep this token</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {triageResult.advice.map((a) => (
              <li key={a} className="flex gap-2">
                <span aria-hidden>•</span>
                {a}
              </li>
            ))}
            <li className="flex gap-2">
              <span aria-hidden>•</span>
              Watch the display screen for your token number.
            </li>
          </ul>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="kioskLg" asChild>
            <Link to="/queue">
              <ListOrdered aria-hidden />
              Track My Queue
            </Link>
          </Button>
          <Button variant="outline" size="kioskLg" onClick={() => window.print()}>
            <Printer aria-hidden />
            Print / Save Ticket
          </Button>
          <Button
            variant="ghost"
            size="kioskLg"
            onClick={() => {
              setFailNext(true);
              setAttempt((a) => a + 1);
            }}
          >
            Simulate token failure
          </Button>
        </div>
      </div>
    </KioskShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
