import { useState } from "react";
import { LifeBuoy, PhoneCall, Loader2, CheckCircle2, TriangleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKioskSession } from "@/state/kiosk-session";
import { getCopy } from "@/mock/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AlertState = "idle" | "sending" | "sent" | "failed";

export function EmergencyHelpButton() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AlertState>("idle");
  const { session } = useKioskSession();
  const t = getCopy(session.language);

  function alertStaff(forceFailure = false) {
    setState("sending");
    window.setTimeout(() => setState(forceFailure ? "failed" : "sent"), 1600);
  }

  const title =
    state === "sent"
      ? "Help is on the way"
      : state === "failed"
        ? "We could not reach the staff desk"
        : state === "sending"
          ? "Notifying hospital staff…"
          : "Do you need urgent help?";

  const description =
    state === "sent"
      ? "A staff member has been notified and will come to the kiosk. Please stay here."
      : state === "failed"
        ? "Unable to notify staff. Please seek immediate assistance — walk to the Emergency counter or call out to any hospital staff member nearby."
        : state === "sending"
          ? "Sending your request to the emergency desk. Please stay at the kiosk."
          : "If you feel very unwell, we will alert hospital staff immediately. You do not need to finish registration first.";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setState("idle");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="emergencyOutline" size="kiosk" className="shrink-0 px-4 sm:px-6">
          <LifeBuoy aria-hidden />
          <span className="hidden sm:inline">{t.emergency}</span>
          <span className="sm:hidden">{t.emergencyShort}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {state === "sending" ? <Loader2 className="size-6 animate-spin" aria-hidden /> : null}
            {state === "sent" ? <CheckCircle2 className="size-6 text-routine" aria-hidden /> : null}
            {state === "failed" ? (
              <TriangleAlert className="size-6 text-emergency" aria-hidden />
            ) : null}
            {title}
          </DialogTitle>
          <DialogDescription className="text-base" role="status" aria-live="assertive">
            {description}
          </DialogDescription>
        </DialogHeader>

        {state === "failed" ? (
          <div className="rounded-xl border border-emergency/40 bg-emergency/5 p-4 text-base font-medium text-emergency">
            Emergency counter: Ground floor, Gate 2 · Internal help line 1099
          </div>
        ) : null}

        {state === "idle" ? (
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="emergency" size="kiosk" onClick={() => alertStaff()}>
              <PhoneCall aria-hidden />
              Alert staff now
            </Button>
            <Button variant="outline" size="kiosk" onClick={() => setOpen(false)}>
              Go back
            </Button>
            <Button variant="ghost" size="kiosk" onClick={() => alertStaff(true)}>
              Simulate failed alert
            </Button>
          </DialogFooter>
        ) : null}

        {state === "sending" ? (
          <DialogFooter className="sm:justify-start">
            <Button variant="emergency" size="kiosk" disabled>
              <Loader2 className="animate-spin" aria-hidden />
              Notifying staff…
            </Button>
          </DialogFooter>
        ) : null}

        {state === "failed" ? (
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="emergency" size="kiosk" onClick={() => alertStaff()}>
              <RotateCcw aria-hidden />
              Try again
            </Button>
            <Button variant="outline" size="kiosk" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        ) : null}

        {state === "sent" ? (
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" size="kiosk" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
