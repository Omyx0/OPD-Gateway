import { AlertTriangle, CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types/opd";

const config = {
  RED: {
    label: "EMERGENCY",
    icon: AlertTriangle,
    className: "bg-emergency text-emergency-foreground",
    soft: "bg-emergency-soft text-emergency-soft-foreground border-emergency/40",
  },
  YELLOW: {
    label: "PRIORITY",
    icon: CircleAlert,
    className: "bg-priority text-priority-foreground",
    soft: "bg-priority-soft text-priority-soft-foreground border-priority/50",
  },
  GREEN: {
    label: "ROUTINE",
    icon: CircleCheck,
    className: "bg-routine text-routine-foreground",
    soft: "bg-routine-soft text-routine-soft-foreground border-routine/40",
  },
} as const;

/** Color is always paired with an icon and text label for accessibility. */
export function PriorityBadge({
  priority,
  variant = "solid",
  size = "sm",
  className,
}: {
  priority: Priority;
  variant?: "solid" | "soft";
  size?: "sm" | "lg";
  className?: string;
}) {
  const item = config[priority];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-transparent font-semibold tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-4 py-2 text-base",
        variant === "solid" ? item.className : item.soft,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-5"} aria-hidden />
      {item.label}
    </span>
  );
}
