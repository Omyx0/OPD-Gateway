import { useState } from "react";
import { HeartPulse, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmergencyEscape({ quote, onContinue }: { quote: string; onContinue: () => void }) {
  const [alerted, setAlerted] = useState(false);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-emergency/10 text-emergency">
        <HeartPulse className="size-10" aria-hidden />
      </span>
      <h1 className="kiosk-heading mt-6 text-emergency">
        {alerted ? "Staff have been alerted" : "This may need urgent care"}
      </h1>
      <p className="kiosk-sub mt-4 text-muted-foreground" role="status" aria-live="assertive">
        {alerted
          ? "Please stay near the kiosk. A staff member is coming to you now."
          : "You mentioned something that we treat as urgent. We can alert hospital staff right away."}
      </p>

      <Card className="mt-8 p-6 text-left">
        <p className="text-sm text-muted-foreground">You said</p>
        <p className="mt-2 text-lg">“{quote}”</p>
      </Card>

      <div className="mt-8 flex flex-col gap-3">
        {!alerted ? (
          <Button size="kioskLg" variant="emergency" onClick={() => setAlerted(true)}>
            <PhoneCall aria-hidden />
            Alert staff now
          </Button>
        ) : null}
        <Button size="kioskLg" variant="outline" onClick={onContinue}>
          Continue with my questions
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Demonstration only — no alert is actually sent.
      </p>
    </div>
  );
}
