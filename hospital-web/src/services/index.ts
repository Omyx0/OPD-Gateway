/**
 * Frontend service layer.
 *
 * UI components and state providers talk ONLY to these services — never to
 * `@/mock/*` directly. Each service is a mock implementation today (local
 * data, no network, no persistence) behind an explicit interface, so the
 * bodies can be swapped for REST/API clients without touching the UI.
 */
export { patientService, type PatientService } from "./patientService";
export { visitService, type VisitService } from "./visitService";
export { triageService, type TriageService } from "./triageService";
export { queueService, type QueueService } from "./queueService";
export { staffService, type StaffService } from "./staffService";
export { alertService, type AlertService } from "./alertService";
export { demoService, type DemoService, type DemoScenario } from "./demoService";
export * from "./types";
