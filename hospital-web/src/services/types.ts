/**
 * Service-layer contracts.
 *
 * Every type a UI component needs is re-exported here so components never
 * import from `@/mock/*`. Replacing the mock implementations with REST
 * clients later only means rewriting the files in `src/services/` — the
 * component tree keeps compiling against these shapes.
 */
export type {
  ChatMessage,
  DepartmentLoad,
  EmergencyAlert,
  KioskSession,
  Patient,
  Priority,
  QueueEntry,
  QueueStatus,
  RegistrationMethod,
  TriageResult,
} from "@/types/opd";

export type { DepartmentConfig, DepartmentSnapshot } from "@/mock/departments";
export type { TriageRecord, VisitRecord } from "@/mock/patient-detail";
export type { SymptomQuestion } from "@/mock/symptom-flow";
export type { TrackingSnapshot, TrackingStatus } from "@/mock/queue-tracking";
export type { AppNotification, NotificationKind } from "@/mock/notifications";

/** Mock staff account returned by `staffService.signIn`. */
export interface StaffUser {
  name: string;
  role: string;
  email: string;
}

/** Payload used when a kiosk journey ends and a queue entry is created. */
export interface QueueIntake {
  patient: import("@/types/opd").Patient;
  department: string;
  priority: import("@/types/opd").Priority;
  symptomsSummary: string;
  triageSummary: string;
  flags: string[];
}
