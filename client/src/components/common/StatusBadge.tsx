import { Circle, PhoneCall, Play, CheckCircle2, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueStatus } from "@/types/opd";

const config: Record<QueueStatus, { label: string; icon: typeof Circle; className: string }> = {
  WAITING: { label: "Waiting", icon: Circle, className: "text-muted-foreground bg-muted" },
  CALLED: { label: "Called", icon: PhoneCall, className: "text-teal-foreground bg-teal" },
  IN_PROGRESS: { label: "In progress", icon: Play, className: "text-primary bg-primary/10" },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-routine-soft-foreground bg-routine-soft",
  },
  SKIPPED: { label: "Skipped", icon: SkipForward, className: "text-muted-foreground bg-muted" },
};

export function StatusBadge({ status, className }: { status: QueueStatus; className?: string }) {
  const item = config[status];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        item.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {item.label}
    </span>
  );
}
