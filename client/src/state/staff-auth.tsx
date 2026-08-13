import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { staffService } from "@/services";
import type { StaffUser } from "@/services";

/**
 * Frontend-only mock staff session. Nothing is verified, requested or stored —
 * this exists purely so the demo can show a sign-in gate in front of /staff.
 */
interface StaffAuthStore {
  user: StaffUser | null;
  signIn: (email: string) => StaffUser;
  signOut: () => void;
}

const StaffAuthContext = createContext<StaffAuthStore | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);

  const value = useMemo<StaffAuthStore>(
    () => ({
      user,
      signIn: (email: string) => {
        const next = staffService.signIn(email);
        setUser(next);
        return next;
      },
      signOut: () => {
        staffService.signOut();
        setUser(null);
      },
    }),
    [user],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used inside StaffAuthProvider");
  return ctx;
}
