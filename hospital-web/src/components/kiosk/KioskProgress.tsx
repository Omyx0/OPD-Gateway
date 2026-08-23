import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type KioskStep = "welcome" | "registration" | "symptoms" | "ticket";

const steps: { key: KioskStep; label: string }[] = [
  { key: "welcome", label: "Welcome" },
  { key: "registration", label: "Registration" },
  { key: "symptoms", label: "Symptoms" },
  { key: "ticket", label: "Ticket" },
];

export function ProgressIndicator({ current }: { current: KioskStep }) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  const currentStep = steps[currentIndex];

  return (
    <nav aria-label="Registration progress" className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:max-w-7xl">
        <p className="mb-2 text-sm font-medium text-muted-foreground sm:hidden">
          Step {currentIndex + 1} of {steps.length} · {currentStep?.label}
        </p>
        <ol className="flex items-center gap-2 sm:gap-3">
          {steps.map((step, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold sm:size-10 sm:text-base",
                    done && "border-teal bg-teal text-teal-foreground",
                    active && "border-primary bg-primary text-primary-foreground",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden truncate text-sm font-medium sm:block sm:text-base",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {done ? " (completed)" : active ? " (current step)" : " (upcoming)"}
                  </span>
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={cn("h-1 flex-1 rounded-full", done ? "bg-teal" : "bg-border")}
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export { ProgressIndicator as KioskProgress };
