import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { KioskSession } from "@/types/opd";

const initialSession: KioskSession = {
  language: "en",
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  clearLabels: false,
  voicePreference: "off",
  registrationMethod: null,
  patient: {},
  symptoms: [],
  triageResult: null,
  ticket: null,
};

interface KioskContextValue {
  session: KioskSession;
  update: (patch: Partial<KioskSession>) => void;
  reset: () => void;
}

const KioskContext = createContext<KioskContextValue | null>(null);

export function KioskSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<KioskSession>(initialSession);

  const value = useMemo<KioskContextValue>(
    () => ({
      session,
      update: (patch) => setSession((prev) => ({ ...prev, ...patch })),
      reset: () => setSession(initialSession),
    }),
    [session],
  );

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
}

export function useKioskSession() {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error("useKioskSession must be used inside KioskSessionProvider");
  return ctx;
}
