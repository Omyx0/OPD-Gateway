/**
 * visitService — visit records and the structured triage record shown to staff.
 *
 * MOCK IMPLEMENTATION. Records are derived deterministically from a queue
 * entry so the demo is stable. Replace with `GET /visits/:id` etc. later.
 */
import { buildTriageRecord, buildVisitRecord } from "@/mock/patient-detail";
import type { QueueEntry, TriageRecord, VisitRecord } from "@/services/types";

export interface VisitService {
  /** GET /visits/:queueEntryId */
  getVisitRecord(entry: QueueEntry): VisitRecord;
  /** GET /visits/:queueEntryId/triage */
  getTriageRecord(entry: QueueEntry): TriageRecord;
}

export const visitService: VisitService = {
  getVisitRecord(entry) {
    return buildVisitRecord(entry);
  },

  getTriageRecord(entry) {
    return buildTriageRecord(entry);
  },
};
