import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Stethoscope,
  Users,
  IdCard,
  Building,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffAuth } from "@/state/staff-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff & Doctor Portal — Smart OPD" },
      {
        name: "description",
        content: "Sign in or register for Smart OPD hospital operations dashboard.",
      },
      { property: "og:title", content: "Staff & Doctor Portal — Smart OPD" },
      {
        property: "og:description",
        content: "Smart OPD clinical staff and doctor authentication and registration.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, register } = useStaffAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Register state
  const [regRole, setRegRole] = useState<"DOCTOR" | "STAFF">("DOCTOR");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  // Doctor specific
  const [regLicense, setRegLicense] = useState("");
  const [regDegree, setRegDegree] = useState("MBBS, MD");
  const [regSpecialty, setRegSpecialty] = useState("Cardiology");
  const [regExp, setRegExp] = useState(5);
  // Staff specific
  const [regStaffId, setRegStaffId] = useState("");
  const [regDept, setRegDept] = useState("OPD Reception Desk");
  const [regDesignation, setRegDesignation] = useState("OPD Desk Executive");

  const [regSuccess, setRegSuccess] = useState(false);

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Enter both your staff email and password.");
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password.trim());
      navigate({ to: "/staff" });
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        fullName: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
      };

      if (regRole === "DOCTOR") {
        payload.licenseNumber = regLicense.trim() || `MCI-2024-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.qualification = regDegree;
        payload.specialization = regSpecialty;
        payload.experienceYears = Number(regExp) || 1;
      } else {
        payload.employeeId = regStaffId.trim() || `STF-2024-${Math.floor(100 + Math.random() * 900)}`;
        payload.departmentName = regDept;
        payload.designation = regDesignation;
      }

      await register(payload);
      setRegSuccess(true);
      toast.success("Registration submitted!", {
        description: "Your application is awaiting administrator approval.",
      });

      // Automatically sign in to show the pending gate
      try {
        await signIn(regEmail.trim(), regPassword.trim());
        navigate({ to: "/staff" });
      } catch {
        // If auto-signin fails, user can manually sign in
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  }

  function useDemoCredentials(roleEmail: string) {
    setEmail(roleEmail);
    setPassword("demo123");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Smart OPD Portal</h1>
              <p className="text-xs text-muted-foreground">Healthcare Practitioner & Staff Access</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setError("");
              }}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                activeTab === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                activeTab === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* ================= SIGN IN TAB ================= */}
        {activeTab === "signin" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold tracking-tight">Staff & Doctor Sign In</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your registered clinical credentials to access your OPD dashboard.
            </p>

            {/* Demo Credentials Section */}
            <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3.5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Quick Demo Credentials
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useDemoCredentials("admin@opd.com")}
                  className="w-full justify-start text-xs h-8"
                >
                  <Shield className="mr-1.5 size-3 text-red-500" /> Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useDemoCredentials("doctor@opd.com")}
                  className="w-full justify-start text-xs h-8"
                >
                  <Stethoscope className="mr-1.5 size-3 text-blue-500" /> Doctor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useDemoCredentials("staff@opd.com")}
                  className="w-full justify-start text-xs h-8"
                >
                  <Users className="mr-1.5 size-3 text-green-500" /> Staff
                </Button>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitSignIn}>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Clinical Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Sign in to Dashboard
              </Button>
            </form>
          </div>
        )}

        {/* ================= REGISTER TAB ================= */}
        {activeTab === "register" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold tracking-tight">Staff & Doctor Registration</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Register for portal access. Applications are reviewed and verified by hospital administration.
            </p>

            {/* Role Selection */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRegRole("DOCTOR")}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  regRole === "DOCTOR"
                    ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Stethoscope className="size-5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Medical Doctor</span>
                  <span className="block text-[10px] opacity-80">Consultations & Prescriptions</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRegRole("STAFF")}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  regRole === "STAFF"
                    ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <IdCard className="size-5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold">Hospital Staff</span>
                  <span className="block text-[10px] opacity-80">Triage, Queue & Support</span>
                </div>
              </button>
            </div>

            <form className="mt-5 space-y-3.5" onSubmit={submitRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="regName" className="text-xs">Full Name</Label>
                  <Input
                    id="regName"
                    placeholder={regRole === "DOCTOR" ? "Dr. Priya Sharma" : "Rajesh Patel"}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="regEmail" className="text-xs">Work Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    placeholder="doctor@hospital.org"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="regPassword" className="text-xs">Password (min 6 characters)</Label>
                <Input
                  id="regPassword"
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              {/* Doctor-Specific Verification Fields */}
              {regRole === "DOCTOR" ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-3">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Award className="size-3.5" /> Medical Credentials for Admin Verification
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="regLicense" className="text-xs">Medical Council License #</Label>
                      <Input
                        id="regLicense"
                        placeholder="MCI-2024-8849"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regDegree" className="text-xs">Qualifications</Label>
                      <Input
                        id="regDegree"
                        placeholder="MBBS, MD, MS"
                        value={regDegree}
                        onChange={(e) => setRegDegree(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regSpecialty" className="text-xs">Primary Specialty</Label>
                      <select
                        id="regSpecialty"
                        value={regSpecialty}
                        onChange={(e) => setRegSpecialty(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="General Practice">General Practice</option>
                        <option value="ENT">ENT</option>
                        <option value="Orthopaedics">Orthopaedics</option>
                        <option value="Paediatrics">Paediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regExp" className="text-xs">Experience (Years)</Label>
                      <Input
                        id="regExp"
                        type="number"
                        min="0"
                        max="50"
                        value={regExp}
                        onChange={(e) => setRegExp(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Staff-Specific Verification Fields */
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-3">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Building className="size-3.5" /> Staff Roster Verification
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="regStaffId" className="text-xs">Hospital Staff / Employee ID</Label>
                      <Input
                        id="regStaffId"
                        placeholder="STF-2024-902"
                        value={regStaffId}
                        onChange={(e) => setRegStaffId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regDept" className="text-xs">Department / Unit</Label>
                      <Input
                        id="regDept"
                        placeholder="OPD Reception Desk"
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor="regDesignation" className="text-xs">Designation / Role Title</Label>
                      <Input
                        id="regDesignation"
                        placeholder="Triage Nurse / OPD Receptionist"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Submit Registration for Verification
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
