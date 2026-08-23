import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Home } from "lucide-react";
import { motion } from "motion/react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useKioskSession } from "@/state/kiosk-session";

export const Route = createFileRoute("/complete")({
  head: () => ({
    meta: [
      { title: "Visit Complete — Smart OPD Kiosk" },
      {
        name: "description",
        content: "Your OPD process is complete. Return to the kiosk home screen.",
      },
      { property: "og:title", content: "Visit Complete — Smart OPD Kiosk" },
      { property: "og:description", content: "Your OPD process is complete." },
    ],
  }),
  component: CompletePage,
});

function CompletePage() {
  const { session, reset } = useKioskSession();
  const navigate = useNavigate();

  return (
    <KioskShell step="ticket">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: session.reducedMotion ? 0 : 0.3 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-routine-soft text-routine">
          <CheckCircle2 className="size-12" aria-hidden />
        </span>
        <h1 className="kiosk-heading mt-8">Your OPD process is complete.</h1>
        <p className="kiosk-sub mt-4 text-muted-foreground">
          Thank you for using the kiosk. Please collect any documents from the counter before you
          leave.
        </p>

        {session.ticket ? (
          <Card className="mt-8 p-6">
            <p className="text-sm text-muted-foreground">Token</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">{session.ticket.token}</p>
            {session.triageResult ? (
              <p className="mt-3 text-muted-foreground">{session.triageResult.department}</p>
            ) : null}
          </Card>
        ) : null}

        <Button
          size="kioskLg"
          className="mt-8"
          onClick={() => {
            reset();
            navigate({ to: "/" });
          }}
        >
          <Home aria-hidden />
          Return to Home
        </Button>
      </motion.div>
    </KioskShell>
  );
}
