/**
 * staffService — staff sessions, departments and operational analytics.
 *
 * MOCK IMPLEMENTATION. `signIn` verifies nothing and stores nothing: it
 * shapes a local session object so the demo can show a gate in front of
 * /staff. A future backend maps to `POST /auth/session`,
 * `GET /departments`, `GET /analytics/throughput`.
 */
import { MOCK_HOURLY_FLOW } from "@/mock/opd";
import { DEPARTMENT_DIRECTORY, buildDepartmentSnapshots } from "@/mock/departments";
import type { DepartmentConfig, DepartmentSnapshot, QueueEntry, StaffUser } from "@/services/types";

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "staff";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (!parts.length) return "Dr. A. Menon";
  return `Dr. ${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")}`;
}

export interface StaffService {
  /** POST /auth/session — mock only, no credentials are checked or sent. */
  signIn(email: string): StaffUser;
  /** DELETE /auth/session */
  signOut(): void;
  /** GET /departments */
  listDepartments(): DepartmentConfig[];
  /** GET /departments/metrics — derived from the current queue. */
  getDepartmentSnapshots(queue: QueueEntry[]): DepartmentSnapshot[];
  /** GET /analytics/throughput */
  getHourlyThroughput(): { hour: string; patients: number }[];
}

export const staffService: StaffService = {
  signIn(email) {
    return { name: nameFromEmail(email), role: "OPD Duty Clinician", email };
  },

  signOut() {
    // No session to revoke in the mock implementation.
  },

  listDepartments() {
    return DEPARTMENT_DIRECTORY;
  },

  getDepartmentSnapshots(queue) {
    return buildDepartmentSnapshots(queue);
  },

  getHourlyThroughput() {
    return MOCK_HOURLY_FLOW;
  },
};
