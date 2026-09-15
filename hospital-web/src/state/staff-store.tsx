import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { alertService, queueService } from "@/services";
import type { EmergencyAlert, Priority, QueueEntry, QueueIntake, QueueStatus } from "@/services";
import { useStaffAuth } from "./staff-auth";
import { API_URL } from "@/lib/api";
import {
  connectSocket,
  onQueueNewTicket,
  onQueueStatusUpdated,
  onQueuePatientCalled,
  onAlertNew,
} from "@/lib/socket";

export type { QueueIntake };

interface StaffStore {
  queue: QueueEntry[];
  alerts: EmergencyAlert[];
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  hideSeed: boolean;
  setHideSeed: (hide: boolean) => void;
  setStatus: (id: string, status: QueueStatus) => void;
  reassign: (id: string, department: string) => void;
  acknowledgeAlert: (id: string) => void;
  callNext: () => QueueEntry | null;
  /** Frontend-only intake: pushes a kiosk/demo patient into the shared queue. */
  addPatient: (intake: QueueIntake) => QueueEntry;
  /** Number of waiting patients ahead of a token, by priority then arrival. */
  positionOf: (token: string) => number;
  /** Waiting patients that would be seen before a newly arrived priority. */
  positionForPriority: (priority: Priority) => number;
  resetQueue: () => void;
  seedRealtime: () => Promise<void>;
  recentlyUpdated: Record<string, number>;
  refreshQueue: () => Promise<void>;
  isLoading: boolean;
}

const StaffContext = createContext<StaffStore | null>(null);

function mapBackendTicket(q: any): QueueEntry {
  const patient = q.visits?.patients;
  const birthYear = patient?.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : null;
  const age = birthYear ? new Date().getFullYear() - birthYear : 38;
  const arrival = q.arrival_time
    ? new Date(q.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "10:00";
  const waitMinutes = q.arrival_time
    ? Math.max(0, Math.floor((Date.now() - new Date(q.arrival_time).getTime()) / 60000))
    : 0;

  const isSeed = Boolean(
    q.is_seed ||
    q.visits?.is_seed ||
    q.token?.startsWith("S-") ||
    q.token?.startsWith("SEED-") ||
    patient?.patient_code?.startsWith("SEED-")
  );

  return {
    id: q.id,
    token: q.token,
    patient: {
      id: q.visits?.patient_id || q.id,
      name: patient?.full_name || `Patient ${q.token || ""}`,
      age,
      gender: patient?.gender === "FEMALE" ? "Female" : patient?.gender === "OTHER" ? "Other" : "Male",
      phone: patient?.mobile || "9876543210",
      idNumber: patient?.patient_code || "PT-001",
      dateOfBirth: patient?.date_of_birth,
    },
    department: q.departments?.name || "General Medicine",
    priority: (q.priority || "GREEN") as Priority,
    status: (q.status || "WAITING") as QueueStatus,
    arrivalTime: arrival,
    waitMinutes,
    symptomsSummary: q.visits?.raw_symptoms_text || "OPD intake examination",
    triageSummary: `${q.priority || "GREEN"} priority clinical triage`,
    flags: q.priority === "RED" ? ["Critical", "Immediate Attention"] : [],
    isSeed,
  };
}

export function StaffStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useStaffAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [hideSeed, setHideSeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const flash = useCallback((id: string) => {
    setRecentlyUpdated((r) => ({ ...r, [id]: Date.now() }));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      setRecentlyUpdated((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
    }, 1800);
  }, []);

  // Fetch live queue from backend API
  const refreshQueue = useCallback(async () => {
    if (!user?.token) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/queue`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendTicket);
        setQueue(mapped);
      }
    } catch (err) {
      console.warn("Error fetching live queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  // Fetch live alerts from backend API
  const refreshAlerts = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/alerts`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) {
        const mapped: EmergencyAlert[] = json.data.map((a: any) => ({
          id: a.id,
          token: a.queue_tickets?.token || "ALERT",
          department: a.visits?.patients?.full_name ? `Patient ${a.visits.patients.full_name}` : "Emergency",
          message: a.message,
          raisedAt: new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          acknowledged: a.status === "ACKNOWLEDGED" || a.status === "RESOLVED",
        }));
        setAlerts(mapped);
      }
    } catch (err) {
      console.warn("Using offline alerts data", err);
    }
  }, [user?.token]);

  // Connect Socket.io and establish real-time listeners
  useEffect(() => {
    if (!user?.token) return;

    void refreshQueue();
    void refreshAlerts();

    connectSocket(user.token);

    const unsubNew = onQueueNewTicket((ticket) => {
      void refreshQueue();
      flash(ticket.id);
    });

    const unsubStatus = onQueueStatusUpdated((ticket) => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === ticket.id ? { ...item, status: ticket.status as QueueStatus } : item
        )
      );
      flash(ticket.id);
    });

    const unsubCalled = onQueuePatientCalled((ticket) => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === ticket.id ? { ...item, status: "CALLED" } : item
        )
      );
      flash(ticket.id);
    });

    const unsubAlert = onAlertNew((_alert) => {
      void refreshAlerts();
    });

    return () => {
      unsubNew();
      unsubStatus();
      unsubCalled();
      unsubAlert();
    };
  }, [user?.token, refreshQueue, refreshAlerts, flash]);

  const setStatus = useCallback(
    async (id: string, status: QueueStatus) => {
      setQueue((q) => queueService.applyStatus(q, id, status));
      flash(id);

      if (user?.token) {
        try {
          await fetch(`${API_URL}/queue/${id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ status }),
          });
        } catch (err) {
          console.error("Failed to update status on server", err);
        }
      }
    },
    [user?.token, flash]
  );

  const reassign = useCallback(
    (id: string, department: string) => {
      setQueue((q) => queueService.applyDepartment(q, id, department));
      flash(id);
    },
    [flash]
  );

  const acknowledgeAlert = useCallback(
    async (id: string) => {
      setAlerts((a) => alertService.applyAcknowledged(a, id));

      if (user?.token) {
        try {
          await fetch(`${API_URL}/alerts/${id}/acknowledge`, {
            method: "POST",
            headers: { Authorization: `Bearer ${user.token}` },
          });
        } catch (err) {
          console.error("Failed to acknowledge alert on server", err);
        }
      }
    },
    [user?.token]
  );

  const callNext = useCallback(() => {
    const next = queueService.selectNext(queue, departmentFilter);
    if (!next) return null;
    setQueue((q) => queueService.applyStatus(q, next.id, "CALLED"));
    flash(next.id);

    if (user?.token) {
      void fetch(`${API_URL}/queue/${next.id}/call`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
    }

    return { ...next, status: "CALLED" as QueueStatus };
  }, [queue, departmentFilter, user?.token, flash]);

  const addPatient = useCallback(
    (intake: QueueIntake) => {
      const entry = queueService.createEntry(intake, queue);
      setQueue((q) => (q.some((e) => e.id === entry.id) ? q : [...q, entry]));
      if (intake.priority === "RED") {
        setAlerts((a) => [alertService.createAlertForEntry(entry, intake.triageSummary), ...a]);
      }
      flash(entry.id);
      return entry;
    },
    [queue, flash]
  );

  const seedRealtime = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/admin/seed-realtime-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        await refreshQueue();
        await refreshAlerts();
      }
    } catch (e) {
      console.error("Failed to seed realtime queue", e);
    }
  }, [user?.token, refreshQueue, refreshAlerts]);

  const positionOf = useCallback((token: string) => queueService.positionOf(queue, token), [queue]);

  const positionForPriority = useCallback(
    (priority: Priority) => queueService.positionForPriority(queue, priority),
    [queue]
  );

  const resetQueue = useCallback(() => {
    void refreshQueue();
    void refreshAlerts();
  }, [refreshQueue, refreshAlerts]);

  const value = useMemo<StaffStore>(
    () => ({
      queue,
      alerts,
      departmentFilter,
      setDepartmentFilter,
      hideSeed,
      setHideSeed,
      setStatus,
      reassign,
      acknowledgeAlert,
      callNext,
      recentlyUpdated,
      addPatient,
      positionOf,
      positionForPriority,
      resetQueue,
      seedRealtime,
      refreshQueue,
      isLoading,
    }),
    [
      queue,
      alerts,
      departmentFilter,
      hideSeed,
      setStatus,
      reassign,
      acknowledgeAlert,
      callNext,
      recentlyUpdated,
      addPatient,
      positionOf,
      positionForPriority,
      resetQueue,
      seedRealtime,
      refreshQueue,
      isLoading,
    ]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaffStore() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaffStore must be used inside StaffStoreProvider");
  return ctx;
}
