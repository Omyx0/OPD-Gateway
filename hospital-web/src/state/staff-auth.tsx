import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

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

/** Fetch the user's real role from the backend. */
async function fetchUserRole(token: string): Promise<{ role: string; name: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const body = await res.json();
      return {
        role: body.data?.role ?? "STAFF",
        name: body.data?.name ?? "Staff",
      };
    }
  } catch (e) {
    console.warn("Failed to fetch user role", e);
  }
  return { role: "STAFF", name: "Staff" };
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { role, name } = await fetchUserRole(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name,
          role,
          token: session.access_token,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { role, name } = await fetchUserRole(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name,
          role,
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
        
        // Provision role in backend based on email pattern
        const roleToProvision = email.includes("doctor") ? "DOCTOR" : email.includes("admin") ? "ADMIN" : "STAFF";
        try {
          await fetch(`${API_URL}/staff/provision`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });
        } catch (e) {
          console.warn("Staff role provisioning failed (non-critical):", e);
        }

        // Fetch actual role from backend
        const { role, name } = await fetchUserRole(data.session.access_token);

        const nextUser: StaffUser = {
          id: data.user.id,
          email: data.user.email || "",
          name,
          role,
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

