import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

export interface StaffUser {
  id: string;
  email: string;
  role: string;
  name: string;
  token?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  verificationDetails?: any;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: "DOCTOR" | "STAFF";
  licenseNumber?: string;
  qualification?: string;
  specialization?: string;
  experienceYears?: number;
  employeeId?: string;
  departmentName?: string;
  designation?: string;
  departmentId?: string;
}

interface StaffAuthStore {
  user: StaffUser | null;
  signIn: (email: string, password?: string) => Promise<StaffUser>;
  register: (payload: RegisterPayload) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthStore | null>(null);

/** Fetch the user's real profile, role, and verification status from backend. */
async function fetchUserRole(token: string): Promise<{
  role: string;
  name: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verificationDetails?: any;
}> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const body = await res.json();
      const data = body.data;
      return {
        role: data?.role ?? "STAFF",
        name: data?.name ?? "Staff",
        verificationStatus: data?.verificationStatus ?? (data?.isActive === false ? "PENDING" : "APPROVED"),
        verificationDetails: data?.verificationDetails ?? null,
      };
    }
  } catch (e) {
    console.warn("Failed to fetch user profile/role", e);
  }
  return { role: "STAFF", name: "Staff", verificationStatus: "APPROVED" };
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { role, name, verificationStatus, verificationDetails } = await fetchUserRole(session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email || "",
        name,
        role,
        token: session.access_token,
        verificationStatus,
        verificationDetails,
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { role, name, verificationStatus, verificationDetails } = await fetchUserRole(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name,
          role,
          token: session.access_token,
          verificationStatus,
          verificationDetails,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { role, name, verificationStatus, verificationDetails } = await fetchUserRole(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name,
          role,
          token: session.access_token,
          verificationStatus,
          verificationDetails,
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
      refreshUser,
      register: async (payload: RegisterPayload) => {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || json.message || "Registration failed");
        }
        return json.data;
      },
      signIn: async (email: string, password = "demo123") => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Auto-provision demo accounts if needed, but not custom dynamic accounts
        const isDemoAccount = ["admin@opd.com", "doctor@opd.com", "staff@opd.com", "patient@opd.com"].includes(
          email.toLowerCase()
        );
        if (isDemoAccount) {
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
        }

        // Fetch actual profile and verification status from backend
        const { role, name, verificationStatus, verificationDetails } = await fetchUserRole(
          data.session.access_token
        );

        const nextUser: StaffUser = {
          id: data.user.id,
          email: data.user.email || "",
          name,
          role,
          token: data.session.access_token,
          verificationStatus,
          verificationDetails,
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
