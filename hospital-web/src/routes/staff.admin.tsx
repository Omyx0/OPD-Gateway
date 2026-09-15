import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Building2,
  RefreshCw,
  Search,
  UserCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Stethoscope,
  IdCard,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useStaffAuth } from "@/state/staff-auth";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/admin")({
  head: () => ({
    meta: [
      { title: "Hospital Administration — Smart OPD" },
      { name: "description", content: "Staff & Doctor verification, role management, doctor department specialization assignments, and audit logs." },
    ],
  }),
  component: AdminPage,
});

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  user_roles?: { role: string }[];
  verification_status?: string;
  verification_details?: any;
}

interface VerificationCandidate {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  verification_status?: string;
  verification_details?: any;
  user_roles?: { role: string }[];
}

interface DoctorRecord {
  id: string;
  profile_id: string;
  is_active: boolean;
  profiles?: { full_name: string; email: string };
  doctor_departments?: { department_id: string; is_primary: boolean }[];
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  profiles?: { full_name?: string; email?: string };
  metadata?: any;
}

function AdminPage() {
  const { user } = useStaffAuth();
  const [activeTab, setActiveTab] = useState<"verifications" | "doctors" | "users" | "audit">("verifications");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [verifications, setVerifications] = useState<VerificationCandidate[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Approval overrides per candidate
  const [approvalRoles, setApprovalRoles] = useState<Record<string, string>>({});
  const [approvalDepts, setApprovalDepts] = useState<Record<string, string>>({});

  // Doctor multi-department specialization editor modal state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(null);
  const [assignedDeptIds, setAssignedDeptIds] = useState<string[]>([]);
  const [primaryDeptId, setPrimaryDeptId] = useState<string>("");
  const [savingDept, setSavingDept] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const [usersRes, deptsRes, auditRes, docsRes, verifRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/admin/audit-logs`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/admin/doctors`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/admin/verifications?status=PENDING`, { headers: { Authorization: `Bearer ${user.token}` } }),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        setUsers(json.data?.items ?? json.data ?? []);
      }

      if (deptsRes.ok) {
        const json = await deptsRes.json();
        setDepartments(json.data ?? []);
      }

      if (auditRes.ok) {
        const json = await auditRes.json();
        setAuditLogs(json.data ?? []);
      }

      if (docsRes.ok) {
        const json = await docsRes.json();
        setDoctors(json.data ?? []);
      }

      if (verifRes.ok) {
        const json = await verifRes.json();
        setVerifications(json.data ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, [user?.token]);

  // Handle approving a candidate
  const handleApprove = async (candidateId: string) => {
    if (!user?.token) return;
    setActionLoading(candidateId);
    try {
      const candidate = verifications.find((v) => v.id === candidateId);
      const assignedRole = approvalRoles[candidateId] || candidate?.verification_details?.requestedRole || candidate?.user_roles?.[0]?.role || "STAFF";
      const departmentId = approvalDepts[candidateId] || candidate?.verification_details?.departmentId || (departments[0]?.id ?? undefined);

      const res = await fetch(`${API_URL}/admin/verifications/${candidateId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ assignedRole, departmentId }),
      });

      if (res.ok) {
        toast.success("Verification approved!", {
          description: `${candidate?.full_name || candidate?.email} is now activated as ${assignedRole}.`,
        });
        await loadAdminData();
      } else {
        toast.error("Failed to approve verification");
      }
    } catch {
      toast.error("Network error during approval");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle rejecting a candidate
  const handleReject = async (candidateId: string) => {
    if (!user?.token) return;
    const reason = window.prompt("Enter rejection reason (optional):", "Credentials could not be validated with Medical Council roster.");
    if (reason === null) return; // User cancelled

    setActionLoading(candidateId);
    try {
      const res = await fetch(`${API_URL}/admin/verifications/${candidateId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        toast.info("Application rejected");
        await loadAdminData();
      } else {
        toast.error("Failed to reject application");
      }
    } catch {
      toast.error("Network error during rejection");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle dynamic queue seeding
  const handleSeedRealtime = async () => {
    if (!user?.token) return;
    setSeeding(true);
    try {
      const res = await fetch(`${API_URL}/admin/seed-realtime-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        toast.success("Dynamic queue & test accounts seeded!", {
          description: "Active patients, pending doctors, and pending staff are now ready for testing.",
        });
        await loadAdminData();
      } else {
        toast.error("Failed to seed real-time queue");
      }
    } catch {
      toast.error("Network error during seeding");
    } finally {
      setSeeding(false);
    }
  };

  // Handle changing user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        void loadAdminData();
      } else {
        toast.error("Failed to update user role");
      }
    } catch (err) {
      toast.error("Network error while updating role");
    }
  };

  // Open doctor specialization modal
  const handleOpenDoctorModal = (doc: DoctorRecord) => {
    setSelectedDoctor(doc);
    const existingDepts = doc.doctor_departments?.map((d) => d.department_id) || [];
    setAssignedDeptIds(existingDepts);
    const primary = doc.doctor_departments?.find((d) => d.is_primary)?.department_id || existingDepts[0] || "";
    setPrimaryDeptId(primary);
  };

  // Save doctor department specializations
  const handleSaveDoctorDepts = async () => {
    if (!selectedDoctor || !user?.token) return;
    if (assignedDeptIds.length === 0) {
      toast.error("Please select at least one department");
      return;
    }
    setSavingDept(true);
    try {
      const res = await fetch(`${API_URL}/admin/doctors/${selectedDoctor.id}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          departmentIds: assignedDeptIds,
          primaryDepartmentId: primaryDeptId || assignedDeptIds[0],
        }),
      });

      if (res.ok) {
        toast.success("Doctor department specializations assigned!");
        setSelectedDoctor(null);
        void loadAdminData();
      } else {
        toast.error("Failed to assign doctor departments");
      }
    } catch (err) {
      toast.error("Network error while assigning departments");
    } finally {
      setSavingDept(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Hospital Administration & Governance</h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              ADMIN PORTAL
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verify doctor credentials, manage clinical staff roles, assign multi-department units, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Seed Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSeedRealtime}
            disabled={seeding}
            className="rounded-xl gap-1.5 font-bold border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Sparkles className={`size-3.5 text-amber-500 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding..." : "Seed Realtime Queue"}
          </Button>

          <Button size="sm" variant="outline" onClick={loadAdminData} className="rounded-xl gap-1.5 font-bold">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        <Button
          size="sm"
          variant={activeTab === "verifications" ? "default" : "ghost"}
          onClick={() => setActiveTab("verifications")}
          className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
        >
          <ShieldCheck className="size-4" /> Pending Verifications
          {verifications.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
              {verifications.length}
            </span>
          )}
        </Button>

        <Button
          size="sm"
          variant={activeTab === "doctors" ? "default" : "ghost"}
          onClick={() => setActiveTab("doctors")}
          className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
        >
          <Building2 className="size-4" /> Doctor Specializations & Units
        </Button>

        <Button
          size="sm"
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
        >
          <Users className="size-4" /> User Accounts & Roles
        </Button>

        <Button
          size="sm"
          variant={activeTab === "audit" ? "default" : "ghost"}
          onClick={() => setActiveTab("audit")}
          className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
        >
          <Search className="size-4" /> Security Audit Trail
        </Button>
      </div>

      {/* ================= TAB 1: Pending Verifications ================= */}
      {activeTab === "verifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Staff & Doctor Verification Queue ({verifications.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Review submitted professional licenses, clinical degrees, and hospital employee records before granting system access.
              </p>
            </div>
          </div>

          {verifications.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border-dashed">
              <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
              <p className="font-semibold text-foreground">All applications verified</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                There are no pending doctor or staff registrations. New signups from the login screen will automatically appear here.
              </p>
              <Button size="sm" variant="outline" onClick={handleSeedRealtime} disabled={seeding} className="mt-4">
                <Sparkles className="mr-1.5 size-3.5 text-amber-500" /> Seed Sample Candidates
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifications.map((cand) => {
                const details = cand.verification_details || {};
                const isDoctor = details.requestedRole === "DOCTOR" || cand.user_roles?.[0]?.role === "DOCTOR";
                const selectedRole = approvalRoles[cand.id] || (isDoctor ? "DOCTOR" : "STAFF");
                const selectedDept = approvalDepts[cand.id] || details.departmentId || (departments[0]?.id ?? "");

                return (
                  <Card key={cand.id} className="p-5 rounded-2xl border border-border/80 shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            isDoctor
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-green-500/10 text-green-600 dark:text-green-400"
                          }`}
                        >
                          {isDoctor ? <Stethoscope className="size-5" /> : <IdCard className="size-5" />}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{cand.full_name || cand.email}</h3>
                          <p className="text-xs text-muted-foreground">{cand.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="size-3" /> Awaiting Review
                      </span>
                    </div>

                    {/* Professional Credentials Box */}
                    <div className="rounded-xl border border-border/60 bg-surface/40 p-3 text-xs space-y-2">
                      {isDoctor ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Award className="size-3 text-primary" /> Medical License #
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {details.licenseNumber || "MCI-Pending"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <GraduationCap className="size-3 text-primary" /> Qualifications
                            </span>
                            <span className="font-medium text-foreground">{details.qualification || "MBBS"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Specialization</span>
                            <span className="font-medium text-foreground">
                              {details.specialization || "General Practice"}
                            </span>
                          </div>
                          {details.experienceYears && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Experience</span>
                              <span className="font-medium text-foreground">{details.experienceYears} Years</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <IdCard className="size-3 text-primary" /> Staff / Employee ID
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {details.employeeId || "STF-Pending"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Assigned Department</span>
                            <span className="font-medium text-foreground">
                              {details.departmentName || "OPD Services"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Designation</span>
                            <span className="font-medium text-foreground">
                              {details.designation || "Clinical Staff"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Role & Department Confirmation Controls */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Confirm Role</label>
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setApprovalRoles((prev) => ({ ...prev, [cand.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium"
                        >
                          <option value="DOCTOR">DOCTOR (Clinician)</option>
                          <option value="STAFF">STAFF (Support/Triage)</option>
                          <option value="ADMIN">ADMIN (Full Control)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Assign Unit/Dept</label>
                        <select
                          value={selectedDept}
                          onChange={(e) =>
                            setApprovalDepts((prev) => ({ ...prev, [cand.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(cand.id)}
                        disabled={actionLoading === cand.id}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="mr-1.5 size-3.5" /> Reject
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleApprove(cand.id)}
                        disabled={actionLoading === cand.id}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {actionLoading === cand.id ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                        )}
                        Verify & Approve Access
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: Doctor Department Specializations ================= */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Registered Hospital Doctors ({doctors.length})</h2>
            <p className="text-xs text-muted-foreground">
              Doctors can be assigned to multiple clinical departments with a designated primary unit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const profileName = doc.profiles?.full_name || "Doctor";
              const profileEmail = doc.profiles?.email || "";
              const depts = doc.doctor_departments || [];

              return (
                <Card key={doc.id} className="p-4 rounded-2xl flex flex-col justify-between border-border/80">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        <Stethoscope className="size-4" />
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{profileName}</h3>
                        <p className="text-xs text-muted-foreground">{profileEmail}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Assigned Specialization Units:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {depts.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No departments linked</span>
                        ) : (
                          depts.map((d) => {
                            const deptObj = departments.find((item) => item.id === d.department_id);
                            return (
                              <span
                                key={d.department_id}
                                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                  d.is_primary
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {deptObj?.name || "Unit"} {d.is_primary ? "(Primary)" : ""}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDoctorModal(doc)} className="text-xs">
                      Manage Units
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Doctor Specialization Editor Modal */}
          {selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <Card className="w-full max-w-md p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    Assign Units: {selectedDoctor.profiles?.full_name}
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedDoctor(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Select OPD Departments:</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {departments.map((d) => {
                      const isChecked = assignedDeptIds.includes(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked ? "bg-primary/10 border-primary text-primary" : "border-border"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedDeptIds((prev) => [...prev, d.id]);
                              } else {
                                setAssignedDeptIds((prev) => prev.filter((id) => id !== d.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{d.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {assignedDeptIds.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Primary Department:</label>
                    <select
                      value={primaryDeptId}
                      onChange={(e) => setPrimaryDeptId(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
                    >
                      {assignedDeptIds.map((id) => {
                        const d = departments.find((item) => item.id === id);
                        return (
                          <option key={id} value={id}>
                            {d?.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => setSelectedDoctor(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveDoctorDepts} disabled={savingDept}>
                    {savingDept ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
                    Save Assignments
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: User Role Management ================= */}
      {activeTab === "users" && (
        <Card className="rounded-2xl overflow-hidden border border-border/80">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Hospital Staff & User Accounts ({users.length})
            </h2>
          </div>

          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {users.map((u) => {
              const currentRole = u.user_roles?.[0]?.role || "STAFF";
              return (
                <div key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">{u.full_name || u.email}</p>
                      {u.verification_status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.verification_status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : u.verification_status === "PENDING"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-red-500/10 text-red-600 border border-red-500/20"
                          }`}
                        >
                          {u.verification_status}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Assign Role:</span>
                    <select
                      value={currentRole}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold focus:border-primary focus:outline-none"
                    >
                      <option value="STAFF">STAFF (Reception / Intake)</option>
                      <option value="DOCTOR">DOCTOR (Clinician)</option>
                      <option value="ADMIN">ADMIN (Full Control)</option>
                      <option value="PATIENT">PATIENT (Kiosk / PWA)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ================= TAB 4: Live Audit Trail ================= */}
      {activeTab === "audit" && (
        <Card className="rounded-2xl overflow-hidden border border-border/80">
          <div className="p-4 border-b border-border/80">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Clinical & System Event Audit Logs
            </h2>
          </div>

          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-foreground">{log.action}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Actor: {log.profiles?.full_name || log.profiles?.email || "System"} · Entity: {log.entity_id}
                  </p>
                </div>
                <span className="text-muted-foreground text-[11px] shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
