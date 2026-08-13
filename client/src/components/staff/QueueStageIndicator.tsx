import { cn } from "@/lib/utils";
import type { QueueStatus } from "@/types/opd";

const STAGES: { key: QueueStatus; short: string }[] = [
  { key: "WAITING", short: "W" },
  { key: "CALLED", short: "C" },
  { key: "IN_PROGRESS", short: "P" },
  { key: "COMPLETED", short: "D" },
];

const LABELS: Record<QueueStatus, string> = {
  WAITING: "Waiting",
  CALLED: "Called",
  IN_PROGRESS: "In progress",
  COMPLETED: "Done",
  SKIPPED: "Skipped",
};

/** Purely visual progress rail: WAITING → CALLED → IN_PROGRESS → DONE. */
export function QueueStageIndicator({
  status,
  className,
}: {
  status: QueueStatus;
  className?: string;
}) {
  const index = STAGES.findIndex((s) => s.key === status);
  const skipped = status === "SKIPPED";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`Stage: ${LABELS[status]}`}
    >
      {STAGES.map((stage, i) => {
        const reached = !skipped && i <= index;
        const current = !skipped && i === index;
        return (
          <span key={stage.key} className="flex items-center gap-1">
            <span
              className={cn(
                "h-1.5 w-5 rounded-full transition-all duration-500",
                reached ? "bg-primary" : "bg-muted",
                current && "w-7 bg-teal",
                skipped && "bg-muted",
              )}
            />
          </span>
        );
      })}
    </div>
  );
}
