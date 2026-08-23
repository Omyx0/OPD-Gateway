/**
 * queueService — the OPD queue, tokens and patient-facing tracking.
 *
 * MOCK IMPLEMENTATION. The queue lives in React state (`useStaffStore`);
 * this module owns the *data rules* around it — the seed list, token
 * generation, ordering and tracking copy — so components and the store never
 * reach into `@/mock/*`. A future backend maps to `GET /queue`,
 * `PATCH /queue/:id`, `POST /queue`, `GET /queue/track/:token`.
 */
import { DEPARTMENTS, MOCK_QUEUE } from "@/mock/opd";
import { MOCK_TRACKING, TRACKING_STATUS_ORDER } from "@/mock/queue-tracking";
import type {
  Priority,
  QueueEntry,
  QueueIntake,
  QueueStatus,
  TrackingSnapshot,
  TrackingStatus,
} from "@/services/types";

const PRIORITY_RANK: Record<Priority, number> = { RED: 0, YELLOW: 1, GREEN: 2 };

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export interface QueueService {
  /** GET /queue — initial snapshot used to seed local state. */
  getQueue(): QueueEntry[];
  /** GET /departments/names */
  listDepartmentNames(): string[];
  /** Next sequential token for the current queue. */
  nextToken(queue: QueueEntry[]): string;
  /** POST /queue — builds the entry a kiosk journey would create. */
  createEntry(intake: QueueIntake, queue: QueueEntry[]): QueueEntry;
  /** PATCH /queue/:id — pure helpers applied to a local queue copy. */
  applyStatus(queue: QueueEntry[], id: string, status: QueueStatus): QueueEntry[];
  applyDepartment(queue: QueueEntry[], id: string, department: string): QueueEntry[];
  /** The entry that should be called next for a department filter. */
  selectNext(queue: QueueEntry[], departmentFilter: string): QueueEntry | null;
  /** Waiting patients ahead of a token. */
  positionOf(queue: QueueEntry[], token: string): number;
  /** Waiting patients ahead of a newly arrived patient of this priority. */
  positionForPriority(queue: QueueEntry[], priority: Priority): number;
  /** GET /queue/track/:token — patient-facing status copy. */
  getTracking(status: TrackingStatus): TrackingSnapshot;
  getTrackingOrder(): TrackingStatus[];
}

export const queueService: QueueService = {
  getQueue() {
    return MOCK_QUEUE;
  },

  listDepartmentNames() {
    return DEPARTMENTS;
  },

  nextToken(queue) {
    const numbers = queue
      .map((e) => Number.parseInt(e.token.replace(/^\D+/, ""), 10))
      .filter((n) => Number.isFinite(n));
    const next = (numbers.length ? Math.max(...numbers) : 100) + 1;
    return `A-${next}`;
  },

  createEntry(intake, queue) {
    return {
      id: `q-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      token: queueService.nextToken(queue),
      patient: intake.patient,
      department: intake.department,
      priority: intake.priority,
      status: "WAITING",
      arrivalTime: clockNow(),
      waitMinutes: 0,
      symptomsSummary: intake.symptomsSummary,
      triageSummary: intake.triageSummary,
      flags: intake.flags,
    };
  },

  applyStatus(queue, id, status) {
    return queue.map((e) => (e.id === id ? { ...e, status } : e));
  },

  applyDepartment(queue, id, department) {
    return queue.map((e) => (e.id === id ? { ...e, department } : e));
  },

  selectNext(queue, departmentFilter) {
    const pool = queue.filter(
      (e) =>
        e.status === "WAITING" && (departmentFilter === "all" || e.department === departmentFilter),
    );
    return (
      [...pool].sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.waitMinutes - a.waitMinutes,
      )[0] ?? null
    );
  },

  positionOf(queue, token) {
    const self = queue.find((e) => e.token === token);
    if (!self) return 0;
    return queue.filter(
      (e) =>
        e.status === "WAITING" &&
        e.token !== token &&
        (PRIORITY_RANK[e.priority] < PRIORITY_RANK[self.priority] ||
          (PRIORITY_RANK[e.priority] === PRIORITY_RANK[self.priority] &&
            e.arrivalTime <= self.arrivalTime)),
    ).length;
  },

  positionForPriority(queue, priority) {
    return queue.filter(
      (e) => e.status === "WAITING" && PRIORITY_RANK[e.priority] <= PRIORITY_RANK[priority],
    ).length;
  },

  getTracking(status) {
    return MOCK_TRACKING[status];
  },

  getTrackingOrder() {
    return TRACKING_STATUS_ORDER;
  },
};
