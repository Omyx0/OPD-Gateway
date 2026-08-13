import { Loader2, WifiOff, RotateCcw } from "lucide-react";
import { useConnection } from "@/state/connection";
import { Button } from "@/components/ui/button";

export function ConnectionBanner() {
  const { status, retry } = useConnection();
  if (status === "online") return null;

  const reconnecting = status === "reconnecting";

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 bg-priority px-4 py-2 text-center text-sm font-medium text-priority-foreground"
    >
      {reconnecting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <WifiOff className="size-4" aria-hidden />
      )}
      <span>
        {reconnecting
          ? "Reconnecting…"
          : "Connection lost. We'll try to reconnect. Your details are safe on this device."}
      </span>
      {!reconnecting ? (
        <Button size="sm" variant="outline" className="h-7 bg-background/80" onClick={retry}>
          <RotateCcw aria-hidden />
          Retry now
        </Button>
      ) : null}
    </div>
  );
}

/** Frontend demo control: drops the mock connection so the banner can be reviewed. */
export function ConnectionDemoButton({ className }: { className?: string }) {
  const { simulateDrop, status } = useConnection();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      disabled={status !== "online"}
      onClick={() => simulateDrop()}
    >
      <WifiOff aria-hidden />
      Simulate offline
    </Button>
  );
}
