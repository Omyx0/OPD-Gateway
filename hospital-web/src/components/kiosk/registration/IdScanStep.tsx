import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ScanLine,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Keyboard,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { patientService } from "@/services";
import { cn } from "@/lib/utils";
import type { Patient } from "@/services";

export type ScanState = "idle" | "scanning" | "processing" | "success" | "failed";

const STATUS_TEXT: Record<ScanState, string> = {
  idle: "Place your ID card inside the frame, then press Scan ID card.",
  scanning: "Hold still — reading your card…",
  processing: "Checking the details we found…",
  success: "We read your card successfully.",
  failed: "We could not read your card.",
};

/**
 * Mock document scanner. No camera stream and no OCR — timers simulate the
 * scanning, processing, success and failure states of a real kiosk scanner.
 */
export function IdScanStep({
  onConfirm,
  onManual,
  onBack,
}: {
  onConfirm: (patient: Partial<Patient>) => void;
  onManual: () => void;
  onBack: () => void;
}) {
  const [state, setState] = useState<ScanState>("idle");
  const [scanned, setScanned] = useState<Partial<Patient>>({});
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(window.clearTimeout);
  }, []);

  function run(shouldFail = false) {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setProgress(10);
    setState("scanning");
    timers.current.push(
      window.setTimeout(() => setProgress(45), 500),
      window.setTimeout(() => {
        setState("processing");
        setProgress(75);
      }, 1200),
      window.setTimeout(() => {
        void (async () => {
          if (!shouldFail) setScanned(await patientService.scanIdDocument());
          setProgress(100);
          setState(shouldFail ? "failed" : "success");
        })();
      }, 2200),
    );
  }

  const busy = state === "scanning" || state === "processing";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="kiosk-heading">Scan your ID card</h1>
      <p className="kiosk-sub mt-3 text-muted-foreground">
        This is a demonstration scanner — no camera or document is actually read.
      </p>

      <Card className="mt-8 overflow-hidden p-0">
        {/* Camera preview placeholder */}
        <div className="relative aspect-[4/3] w-full bg-primary/95 sm:aspect-[16/9]">
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white">
            <Camera className="size-4" aria-hidden />
            Camera preview (simulated)
          </div>

          {/* Document frame */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div
              className={cn(
                "relative aspect-[1.586/1] w-full max-w-md rounded-xl border-2 border-dashed transition-colors",
                state === "success"
                  ? "border-routine"
                  : state === "failed"
                    ? "border-emergency"
                    : "border-white/70",
              )}
            >
              {[
                "left-0 top-0 border-l-4 border-t-4 rounded-tl-xl",
                "right-0 top-0 border-r-4 border-t-4 rounded-tr-xl",
                "left-0 bottom-0 border-b-4 border-l-4 rounded-bl-xl",
                "right-0 bottom-0 border-b-4 border-r-4 rounded-br-xl",
              ].map((c) => (
                <span key={c} className={cn("absolute size-10 border-white", c)} aria-hidden />
              ))}

              {state === "scanning" ? (
                <span
                  aria-hidden
                  className="absolute inset-x-3 top-3 h-0.5 animate-pulse rounded-full bg-teal"
                />
              ) : null}

              <span className="absolute inset-0 flex items-center justify-center text-center text-sm text-white/85">
                {state === "idle" ? "Align the front of your ID inside this frame" : null}
                {state === "processing" ? (
                  <Loader2 className="size-10 animate-spin" aria-hidden />
                ) : null}
                {state === "success" ? (
                  <CheckCircle2 className="size-12 text-routine" aria-hidden />
                ) : null}
                {state === "failed" ? (
                  <AlertTriangle className="size-12 text-emergency" aria-hidden />
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <p className="kiosk-sub" role="status" aria-live="polite">
            {STATUS_TEXT[state]}
          </p>
          {busy ? <Progress value={progress} aria-label="Scan progress" /> : null}

          {state === "success" ? (
            <div className="rounded-xl border border-routine/40 bg-routine/5 p-5">
              <p className="flex items-center gap-2 text-lg font-semibold text-routine">
                <CheckCircle2 className="size-5" aria-hidden />
                Details found on your card
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Full name", scanned.name],
                  ["Date of birth", scanned.dateOfBirth],
                  ["Gender", scanned.gender],
                  ["ID number", scanned.idNumber],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-lg font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {state === "failed" ? (
            <div className="rounded-xl border border-emergency/40 bg-emergency/5 p-5">
              <p className="flex items-center gap-2 text-lg font-semibold text-emergency">
                <AlertTriangle className="size-5" aria-hidden />
                We couldn&apos;t read your ID
              </p>
              <p className="mt-1 text-muted-foreground">
                The card may be blurred, reflective or upside down. Try again, or enter your details
                by hand.
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {state === "idle" ? (
          <Button size="kioskLg" onClick={() => run()}>
            <ScanLine aria-hidden />
            Scan ID card
          </Button>
        ) : null}

        {busy ? (
          <Button size="kioskLg" disabled>
            <Loader2 className="animate-spin" aria-hidden />
            {state === "scanning" ? "Scanning…" : "Processing…"}
          </Button>
        ) : null}

        {state === "success" ? (
          <Button size="kioskLg" onClick={() => onConfirm(scanned)}>
            Use these details
            <ArrowRight aria-hidden />
          </Button>
        ) : null}

        {state === "failed" ? (
          <Button size="kioskLg" onClick={() => run()}>
            <RotateCcw aria-hidden />
            Try Again
          </Button>
        ) : null}

        <Button variant="outline" size="kioskLg" onClick={onManual}>
          <Keyboard aria-hidden />
          Enter Details Manually
        </Button>

        {state === "idle" ? (
          <Button variant="ghost" size="kioskLg" onClick={() => run(true)}>
            Simulate a failed scan
          </Button>
        ) : null}

        {!busy ? (
          <Button variant="ghost" size="kioskLg" onClick={onBack}>
            Back
          </Button>
        ) : null}
      </div>
    </div>
  );
}
