import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Clock, Loader2, MonitorSpeaker, Users } from "lucide-react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { queueService, type TrackingStatus } from "@/services";

const TRACKING_STATUS_ORDER = queueService.getTrackingOrder();
import { useKioskSession } from "@/state/kiosk-session";
import { useStaffStore } from "@/state/staff-store";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Track My Queue — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Follow your OPD token: current serving token, patients ahead, estimated wait and consultation status.",
      },
      { property: "og:title", content: "Track My Queue — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Live-style OPD queue tracking for your token and department.",
      },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { session } = useKioskSession();
  const { queue, setStatus: setQueueStatus, positionOf } = useStaffStore();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"ready" | "updating" | "error">("ready");
  const { ticket, triageResult } = session;

  // The kiosk reads the same in-memory queue the staff dashboard writes to,
  // so a staff "Call patient" action shows up here (and vice versa).
  const entry = queue.find((e) => e.token === ticket?.token);
  const status: TrackingStatus =
    entry && entry.status !== "SKIPPED" ? (entry.status as TrackingStatus) : "WAITING";
  const serving = [...queue]
    .reverse()
    .find((e) => e.status === "CALLED" || e.status === "IN_PROGRESS");

  function changeStatus(next: TrackingStatus, fail = false) {
    setPhase("updating");
    window.setTimeout(() => {
      if (fail) {
        setPhase("error");
        return;
      }
      if (entry) setQueueStatus(entry.id, next);
      setPhase("ready");
    }, 900);
  }

  useEffect(() => {
    if (status !== "COMPLETED" || phase !== "ready") return;
    const timer = window.setTimeout(() => navigate({ to: "/complete" }), 2500);
    return () => window.clearTimeout(timer);
  }, [status, phase, navigate]);

  if (!ticket || !triageResult) {
    return (
      <KioskShell step="ticket">
        <EmptyState
          className="mt-6"
          title="No token to track"
          description="Register at the kiosk to receive a token you can follow here."
        />
        <div className="mt-6 flex justify-center">
          <Button size="kioskLg" asChild>
            <Link to="/">Start registration</Link>
          </Button>
        </div>
      </KioskShell>
    );
  }

  if (phase === "error") {
    return (
      <KioskShell step="ticket">
        <ErrorState
          className="mt-8"
          title="We couldn't refresh your queue"
          description="Your token is still valid. We'll keep trying — you can also watch the display screen in the waiting area."
          onRetry={() => setPhase("ready")}
        />
      </KioskShell>
    );
  }

  const snapshot = queueService.getTracking(status);
  const called = status === "CALLED";

  return (
    <KioskShell step="ticket">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="kiosk-heading">{snapshot.headline}</h1>
          <p className="kiosk-sub mt-3 text-muted-foreground" role="status" aria-live="polite">
            {phase === "updating" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Updating queue…
              </span>
            ) : (
              snapshot.detail
            )}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className={called ? "border-teal p-8 text-center" : "p-8 text-center"}>
            <p className="text-sm tracking-widest text-muted-foreground uppercase">Your token</p>
            <p className="mt-2 text-6xl font-bold tabular-nums">{ticket.token}</p>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={status} />
            </div>
          </Card>
          <Card className="p-8 text-center">
            <p className="flex items-center justify-center gap-2 text-sm tracking-widest text-muted-foreground uppercase">
              <MonitorSpeaker className="size-4" aria-hidden />
              Now serving
            </p>
            <p className="mt-2 text-6xl font-bold tabular-nums text-teal">
              {serving?.token ?? snapshot.nowServing}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{snapshot.room}</p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Info
            icon={Users}
            label="Patients ahead"
            value={String(
              status === "WAITING" ? (entry ? positionOf(entry.token) : snapshot.patientsAhead) : 0,
            )}
          />
          <Info
            icon={Clock}
            label="Estimated wait"
            value={
              snapshot.estimatedWaitMinutes > 0 ? `${snapshot.estimatedWaitMinutes} minutes` : "Now"
            }
          />
          <Info icon={Building2} label="Department" value={triageResult.department} />
        </div>

        <Card className="mt-6 p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Demonstration controls — these update the same mock queue the staff dashboard uses. No
            live queue data.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {TRACKING_STATUS_ORDER.map((s) => (
              <Button
                key={s}
                size="kiosk"
                variant={s === status ? "default" : "outline"}
                className="px-5"
                disabled={phase === "updating"}
                onClick={() => changeStatus(s)}
                aria-pressed={s === status}
              >
                {s.replace("_", " ")}
              </Button>
            ))}
            <Button
              size="kiosk"
              variant="ghost"
              className="px-5"
              disabled={phase === "updating"}
              onClick={() => changeStatus(status, true)}
            >
              Simulate update failure
            </Button>
          </div>
        </Card>

        {status === "COMPLETED" ? (
          <div className="mt-8 flex justify-center">
            <Button size="kioskLg" asChild>
              <Link to="/complete">
                Finish
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </KioskShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <Card className="p-5 text-center">
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
