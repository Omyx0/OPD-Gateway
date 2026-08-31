import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface StaffUser {
  id: string;
  email: string;
  role: string;
  name: string;
  token?: string;
}

interface StaffAuthStore {
  user: StaffUser | null;
  signIn: (email: string, password?: string) => Promise<StaffUser>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthStore | null>(null);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.email?.split('@')[0] || "Staff",
          role: "STAFF", // Hardcoded for demo, normally would fetch from profiles/roles table
          token: session.access_token,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.email?.split('@')[0] || "Staff",
          role: "STAFF",
          token: session.access_token,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<StaffAuthStore>(
    () => ({
      user,
      isLoading,
      signIn: async (email: string, password = "demo123") => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Provision STAFF role in backend so authorize middleware allows staff operations
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/staff/provision`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });
        } catch (e) {
          console.warn("Staff role provisioning failed (non-critical):", e);
        }

        const nextUser: StaffUser = {
          id: data.user.id,
          email: data.user.email || "",
          name: email.split('@')[0],
          role: "STAFF",
          token: data.session.access_token,
        };
        setUser(nextUser);
        return nextUser;
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used inside StaffAuthProvider");
  return ctx;
}
