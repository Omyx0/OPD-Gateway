import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "emergency" | "priority" | "routine" | "brand";
  className?: string;
}) {
  const tones = {
    neutral: "border-border/70",
    brand: "border-primary/30",
    emergency: "border-emergency/40",
    priority: "border-priority/45",
    routine: "border-routine/40",
  } as const;

  const iconTone = {
    neutral: "bg-secondary text-secondary-foreground",
    brand: "bg-primary/12 text-primary",
    emergency: "bg-emergency-soft text-emergency-soft-foreground",
    priority: "bg-priority-soft text-priority-soft-foreground",
    routine: "bg-routine-soft text-routine-soft-foreground",
  } as const;

  const valueTone = {
    neutral: "text-foreground",
    brand: "text-primary",
    emergency: "text-emergency",
    priority: "text-priority-soft-foreground",
    routine: "text-routine-soft-foreground",
  } as const;

  const accent = {
    neutral: "bg-border",
    brand: "bg-primary",
    emergency: "bg-emergency",
    priority: "bg-priority",
    routine: "bg-routine",
  } as const;

  return (
    <Card
      className={cn(
        "card-premium hover-lift relative flex flex-col overflow-hidden p-4",
        tones[tone],
        className,
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-1 rounded-b-full", accent[tone])}
        aria-hidden
      />
      <div className="flex min-h-9 items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl",
              iconTone[tone],
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className={cn("mt-2 text-3xl font-bold tabular-nums", valueTone[tone])}>{value}</p>
      <p className="mt-auto pt-1 text-xs text-muted-foreground" aria-hidden={!hint}>
        {hint ?? "\u00a0"}
      </p>
    </Card>
  );
}
