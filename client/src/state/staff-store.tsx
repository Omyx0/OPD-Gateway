import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { alertService, queueService } from "@/services";
import type { EmergencyAlert, Priority, QueueEntry, QueueIntake, QueueStatus } from "@/services";

export type { QueueIntake };

interface StaffStore {
  queue: QueueEntry[];
  alerts: EmergencyAlert[];
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  setStatus: (id: string, status: QueueStatus) => void;
  reassign: (id: string, department: string) => void;
  acknowledgeAlert: (id: string) => void;
  callNext: () => QueueEntry | null;
  /** Frontend-only intake: pushes a kiosk/demo patient into the shared mock queue. */
  addPatient: (intake: QueueIntake) => QueueEntry;
  /** Number of waiting patients ahead of a token, by priority then arrival. */
  positionOf: (token: string) => number;
  /** Waiting patients that would be seen before a newly arrived priority. */
  positionForPriority: (priority: Priority) => number;
  resetQueue: () => void;
  recentlyUpdated: Record<string, number>;
}

const StaffContext = createContext<StaffStore | null>(null);

export function StaffStoreProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueEntry[]>(queueService.getQueue());
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(alertService.getAlerts());
  const [departmentFilter, setDepartmentFilter] = useState("all");
  // Purely visual: marks a row as "just changed" so the table can flash it.
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

  const setStatus = useCallback(
    (id: string, status: QueueStatus) => {
      setQueue((q) => queueService.applyStatus(q, id, status));
      flash(id);
    },
    [flash],
  );

  const reassign = useCallback(
    (id: string, department: string) => {
      setQueue((q) => queueService.applyDepartment(q, id, department));
      flash(id);
    },
    [flash],
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((a) => alertService.applyAcknowledged(a, id));
  }, []);

  const callNext = useCallback(() => {
    const next = queueService.selectNext(queue, departmentFilter);
    if (!next) return null;
    setQueue((q) => queueService.applyStatus(q, next.id, "CALLED"));
    flash(next.id);
    return { ...next, status: "CALLED" as QueueStatus };
  }, [queue, departmentFilter, flash]);

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
    [queue, flash],
  );

  const positionOf = useCallback((token: string) => queueService.positionOf(queue, token), [queue]);

  const positionForPriority = useCallback(
    (priority: Priority) => queueService.positionForPriority(queue, priority),
    [queue],
  );

  const resetQueue = useCallback(() => {
    setQueue(queueService.getQueue());
    setAlerts(alertService.getAlerts());
  }, []);

  const value = useMemo<StaffStore>(
    () => ({
      queue,
      alerts,
      departmentFilter,
      setDepartmentFilter,
      setStatus,
      reassign,
      acknowledgeAlert,
      callNext,
      recentlyUpdated,
      addPatient,
      positionOf,
      positionForPriority,
      resetQueue,
    }),
    [
      queue,
      alerts,
      departmentFilter,
      setStatus,
      reassign,
      acknowledgeAlert,
      callNext,
      recentlyUpdated,
      addPatient,
      positionOf,
      positionForPriority,
      resetQueue,
    ],
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaffStore() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaffStore must be used inside StaffStoreProvider");
  return ctx;
}
