import { Keyboard, Mic, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { triageService } from "@/services";

const SYMPTOM_DISCLAIMER = triageService.getDisclaimer();

export function SymptomIntro({
  patientName,
  onStartVoice,
  onStartText,
}: {
  patientName?: string;
  onStartVoice: () => void;
  onStartText: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="kiosk-heading">
        {patientName
          ? `${patientName}, tell us how you are feeling`
          : "Tell us how you are feeling"}
      </h1>
      <p className="kiosk-sub mt-4 text-muted-foreground">
        You can speak or type in your preferred language.
      </p>

      <Card className="mt-8 flex flex-col gap-4 p-6 sm:p-8">
        <Button size="kioskLg" onClick={onStartVoice} className="w-full justify-center">
          <Mic aria-hidden />
          Start
        </Button>
        <Button
          size="kioskLg"
          variant="outline"
          onClick={onStartText}
          className="w-full justify-center"
        >
          <Keyboard aria-hidden />
          Type instead
        </Button>
      </Card>

      <p className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground sm:text-base">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
        {SYMPTOM_DISCLAIMER}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        If you feel very unwell, use “I need help now” at the bottom of the screen at any time.
      </p>
    </div>
  );
}
