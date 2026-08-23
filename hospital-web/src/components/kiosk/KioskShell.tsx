import { useEffect, type ReactNode } from "react";
import { useKioskSession } from "@/state/kiosk-session";
import { KioskHeader } from "./KioskHeader";
import { ProgressIndicator, type KioskStep } from "./KioskProgress";
import { MainContent } from "./MainContent";
import { EmergencyHelpButton } from "./EmergencyHelpButton";
import { cn } from "@/lib/utils";
import { getCopy } from "@/mock/i18n";

export function KioskShell({
  step,
  children,
  showProgress = true,
}: {
  step: KioskStep;
  children: ReactNode;
  showProgress?: boolean;
}) {
  const { session } = useKioskSession();

  // Keep the document language in sync with the kiosk language selection.
  useEffect(() => {
    const map: Record<string, string> = { en: "en", hi: "hi", regional: "mr" };
    document.documentElement.lang = map[session.language] ?? "en";
  }, [session.language]);

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-background",
        session.largeText && "kiosk-large-text",
        session.highContrast && "kiosk-contrast",
        session.reducedMotion && "kiosk-reduce-motion",
      )}
    >
      <a href="#kiosk-main" className="skip-link">
        Skip to main content
      </a>
      <KioskHeader />

      {showProgress ? <ProgressIndicator current={step} /> : null}

      <MainContent animationKey={step} animate={!session.reducedMotion}>
        {children}
      </MainContent>

      <footer className="pb-safe sticky bottom-0 z-20 border-t border-border/70 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:max-w-7xl">
          <p className="min-w-0 text-sm text-muted-foreground sm:text-base">
            {getCopy(session.language).footerHelp}
          </p>
          <EmergencyHelpButton />
        </div>
      </footer>
    </div>
  );
}
