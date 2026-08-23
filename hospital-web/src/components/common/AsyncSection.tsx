import { useEffect, useState, type ReactNode } from "react";
import { LoadingState, TableLoadingRows } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

export type AsyncPhase = "loading" | "success" | "error" | "empty";

/**
 * Frontend-only async simulation. No network, no backend — it just moves through
 * loading -> success (or a forced error/empty state) so every screen can be reviewed
 * in each UI state.
 */
export function useMockLoad(delay = 700) {
  const [phase, setPhase] = useState<AsyncPhase>("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setPhase("loading");
    const t = window.setTimeout(() => setPhase("success"), delay);
    return () => window.clearTimeout(t);
  }, [delay, nonce]);

  return {
    phase,
    setPhase,
    reload: () => setNonce((n) => n + 1),
  };
}

export function StateDemoBar({
  phase,
  onChange,
  className,
}: {
  phase: AsyncPhase;
  onChange: (p: AsyncPhase) => void;
  className?: string;
}) {
  const options: AsyncPhase[] = ["loading", "success", "error", "empty"];
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1",
        className,
      )}
      role="group"
      aria-label="Demonstration UI state"
    >
      <span className="px-2 text-xs font-medium text-muted-foreground">Demo state</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={phase === o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
            phase === o
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function AsyncSection({
  phase,
  loadingLabel = "Loading",
  skeleton = "spinner",
  errorTitle = "This section didn't load",
  errorDescription = "The information could not be loaded. You can try again — nothing has been lost.",
  onRetry,
  emptyTitle = "Nothing to show",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  isEmpty,
  children,
}: {
  phase: AsyncPhase;
  loadingLabel?: string;
  skeleton?: "spinner" | "table";
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  isEmpty?: boolean;
  children: ReactNode;
}) {
  if (phase === "loading") {
    return skeleton === "table" ? (
      <div className="rounded-xl border border-border bg-card">
        <LoadingState label={loadingLabel} className="py-6" />
        <TableLoadingRows />
      </div>
    ) : (
      <LoadingState label={loadingLabel} />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  if (phase === "empty" || isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        {...(emptyDescription ? { description: emptyDescription } : {})}
        {...(emptyActionLabel && onEmptyAction
          ? { actionLabel: emptyActionLabel, onAction: onEmptyAction }
          : {})}
      />
    );
  }

  return <>{children}</>;
}
