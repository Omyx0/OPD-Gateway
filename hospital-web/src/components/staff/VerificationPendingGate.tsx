import { useState } from "react";
import { useStaffAuth } from "@/state/staff-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Clock,
  Award,
  Building,
  UserCheck,
  Stethoscope,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";

export function VerificationPendingGate() {
  const { user, refreshUser, signOut } = useStaffAuth();
  const [checking, setChecking] = useState(false);

  const isRejected = user?.verificationStatus === "REJECTED";
  const details = user?.verificationDetails || {};

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      await refreshUser();
      toast.info("Status updated", {
        description: `Current status: ${user?.verificationStatus || "PENDING"}`,
      });
    } catch {
      toast.error("Failed to check status");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-xl overflow-hidden border-border/60 shadow-xl">
        {/* Header Strip */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isRejected
              ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400"
          }`}
        >
          <div className="flex items-center gap-2.5 font-medium text-sm">
            {isRejected ? (
              <ShieldAlert className="size-5 text-red-500" />
            ) : (
              <Clock className="size-5 text-amber-500 animate-pulse" />
            )}
            <span>{isRejected ? "Registration Not Approved" : "Clinical Credentials Verification Pending"}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-background/80 border">
            {user?.verificationStatus || "PENDING"}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isRejected ? "Application Rejected" : "Account Under Administrative Review"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {isRejected
                ? details.rejectionReason ||
                  "Your registration was reviewed by the hospital administration but could not be approved at this time."
                : "In accordance with hospital clinical compliance standards, every Doctor and Staff registration requires administrative validation of professional credentials before accessing live queues and patient records."}
            </p>
          </div>

          {/* Submitted Credentials Summary */}
          <div className="rounded-xl border border-border/70 bg-surface/50 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Candidate Information</span>
              <span className="flex items-center gap-1 text-primary">
                {user?.role === "DOCTOR" ? <Stethoscope className="size-3.5" /> : <IdCard className="size-3.5" />}
                {user?.role === "DOCTOR" ? "Doctor Profile" : "Hospital Staff Profile"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium text-foreground">{user?.name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Registered Email</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>

              {user?.role === "DOCTOR" ? (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground block flex items-center gap-1">
                      <Award className="size-3 text-primary" /> Medical Council License #
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {details.licenseNumber || "Submitted for review"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Qualifications / Degree</span>
                    <span className="font-medium text-foreground">{details.qualification || "MBBS"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block flex items-center gap-1">
                      <Building className="size-3 text-primary" /> Requested Specialization
                    </span>
                    <span className="font-medium text-foreground">{details.specialization || "General Medicine"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Clinical Experience</span>
                    <span className="font-medium text-foreground">
                      {details.experienceYears ? `${details.experienceYears} Years` : "Under assessment"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground block flex items-center gap-1">
                      <IdCard className="size-3 text-primary" /> Hospital Staff / Employee ID
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {details.employeeId || "Pending generation"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Department / Unit</span>
                    <span className="font-medium text-foreground">{details.departmentName || "OPD Services"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground block">Designation</span>
                    <span className="font-medium text-foreground">{details.designation || "Clinical Staff"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Admin Evaluation Notice for Demonstration */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <UserCheck className="size-4" /> Demonstration & Evaluation Shortcut
            </p>
            <p>
              To review and approve this pending application right now, sign out and log in with the administrator account:{" "}
              <strong className="text-foreground">admin@opd.com</strong> (Password: <code className="bg-muted px-1 py-0.5 rounded">demo123</code>), then navigate to{" "}
              <strong>Admin &gt; Pending Verifications</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 size-4 ${checking ? "animate-spin" : ""}`} />
              Check Approval Status
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2 size-4" />
              Sign Out / Switch Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
