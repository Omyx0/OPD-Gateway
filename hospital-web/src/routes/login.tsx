import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Eye, EyeOff, Loader2, Shield, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffAuth } from "@/state/staff-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Smart OPD" },
      {
        name: "description",
        content: "Staff sign-in screen for the Smart OPD operations dashboard.",
      },
      { property: "og:title", content: "Staff Sign In — Smart OPD" },
      {
        property: "og:description",
        content: "Staff sign-in for the Smart OPD operations dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useStaffAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
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

  function useDemoCredentials(roleEmail: string) {
    setEmail(roleEmail);
    setPassword("demo123");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Activity className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to access the Smart OPD operations dashboard.
        </p>

        {/* Demo Credentials Section */}
        <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Use Demo Credentials</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => useDemoCredentials("admin@opd.com")}
              className="w-full justify-start text-xs"
            >
              <Shield className="mr-2 size-3 text-red-500" /> Admin
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => useDemoCredentials("doctor@opd.com")}
              className="w-full justify-start text-xs"
            >
              <Stethoscope className="mr-2 size-3 text-blue-500" /> Doctor
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => useDemoCredentials("staff@opd.com")}
              className="w-full justify-start text-xs"
            >
              <Users className="mr-2 size-3 text-green-500" /> Staff
            </Button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="email">Staff email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hospital.org"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {loading ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
