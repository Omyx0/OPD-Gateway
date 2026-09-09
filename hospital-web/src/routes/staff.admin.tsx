import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Building2,
  ListOrdered,
  Settings,
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  UserCheck,
  AlertCircle,
  Loader2,
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
      { name: "description", content: "Role management, doctor department specialization assignments, and audit logs." },
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
  const [activeTab, setActiveTab] = useState<"doctors" | "users" | "audit">("doctors");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [usersRes, deptsRes, auditRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API_URL}/admin/audit-logs`, { headers: { Authorization: `Bearer ${user.token}` } }),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        setUsers(json.data ?? []);
      }

      if (deptsRes.ok) {
        const json = await deptsRes.json();
        setDepartments(json.data ?? []);
      }

      if (auditRes.ok) {
        const json = await auditRes.json();
        setAuditLogs(json.data ?? []);
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
        toast.success(`User role updated to ${newRole}`);
        void loadAdminData();
      } else {
        toast.error("Failed to update role");
      }
    } catch (err) {
      toast.error("Network error updating role");
    }
  };

  // Open doctor specialization modal
  const handleEditDoctorDepts = (doc: DoctorRecord) => {
    setSelectedDoctor(doc);
    const assigned = doc.doctor_departments?.map((d) => d.department_id) ?? [];
    setAssignedDeptIds(assigned);
    const primary = doc.doctor_departments?.find((d) => d.is_primary)?.department_id ?? (assigned[0] || "");
    setPrimaryDeptId(primary);
  };

  const toggleDeptAssignment = (deptId: string) => {
    setAssignedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  // Save doctor multi-department specializations
  const handleSaveDoctorDepts = async () => {
    if (!selectedDoctor || !user?.token) return;
    if (assignedDeptIds.length === 0) {
      toast.error("Please assign at least one department.");
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
            <h1 className="text-2xl font-bold tracking-tight">Hospital Administration & RBAC</h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure multi-department doctor specializations, user roles, and security audit trails
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={loadAdminData} className="rounded-xl gap-1.5 font-bold">
          <RefreshCw className="size-3.5" /> Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Button
          size="sm"
          variant={activeTab === "doctors" ? "default" : "ghost"}
          onClick={() => setActiveTab("doctors")}
          className="rounded-xl font-bold text-xs gap-1.5"
        >
          <Building2 className="size-4" /> Doctor Specializations & Units
        </Button>
        <Button
          size="sm"
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className="rounded-xl font-bold text-xs gap-1.5"
        >
          <Users className="size-4" /> Role Management ({users.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "audit" ? "default" : "ghost"}
          onClick={() => setActiveTab("audit")}
          className="rounded-xl font-bold text-xs gap-1.5"
        >
          <Activity className="size-4" /> Live Audit Trail ({auditLogs.length})
        </Button>
      </div>

      {/* TAB 1: Doctor Department Specializations (User specific requirement) */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/60 p-4 border border-border/70 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Multi-Department Clinician Configuration:</span> Doctors
            specializing in 2 or 3 departments (e.g. Cardiology + Internal Medicine) will receive queues for all
            assigned departments in their consultation dashboard.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users
              .filter((u) => u.user_roles?.some((r) => r.role === "DOCTOR") || u.email.includes("doctor"))
              .map((docUser) => {
                return (
                  <Card key={docUser.id} className="p-5 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{docUser.full_name || docUser.email}</h3>
                        <p className="text-xs text-muted-foreground">{docUser.email}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        DOCTOR
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Specializations
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {departments.slice(0, 2).map((dept) => (
                          <span
                            key={dept.id}
                            className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-0.5 rounded-lg border border-border/50"
                          >
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-xl text-xs font-bold"
                      onClick={() =>
                        handleEditDoctorDepts({
                          id: docUser.id,
                          profile_id: docUser.id,
                          is_active: docUser.is_active,
                          profiles: { full_name: docUser.full_name || docUser.email, email: docUser.email },
                        })
                      }
                    >
                      Configure Units & Specializations
                    </Button>
                  </Card>
                );
              })}
          </div>

          {/* Specialization Editor Modal/Drawer */}
          {selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <Card className="w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 bg-card">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Assign Departments — {selectedDoctor.profiles?.full_name || "Doctor"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select 1, 2, or more clinical departments this clinician is licensed to handle.
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {departments.map((dept) => {
                    const isChecked = assignedDeptIds.includes(dept.id);
                    return (
                      <div
                        key={dept.id}
                        onClick={() => toggleDeptAssignment(dept.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/10 border-primary text-foreground font-semibold"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        <span className="text-xs">{dept.name} ({dept.code})</span>
                        {isChecked && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDoctor(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveDoctorDepts}
                    disabled={savingDept}
                    className="rounded-xl text-xs font-bold"
                  >
                    {savingDept ? "Saving..." : "Save Specializations"}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: User Role Management */}
      {activeTab === "users" && (
        <Card className="rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/80">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Hospital Staff & User Accounts ({users.length})
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            {users.map((u) => {
              const currentRole = u.user_roles?.[0]?.role || "STAFF";
              return (
                <div key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-foreground text-sm">{u.full_name || u.email}</p>
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

      {/* TAB 3: Live Audit Trail */}
      {activeTab === "audit" && (
        <Card className="rounded-2xl overflow-hidden">
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
