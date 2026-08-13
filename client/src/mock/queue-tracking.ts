/**
 * Frontend-only mock queue tracking data. No real queue logic, no backend —
 * static tokens and canned status copy so the tracking screen can be shown.
 */
import type { Priority } from "@/types/opd";

export type TrackingStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "COMPLETED";

export const TRACKING_STATUS_ORDER: TrackingStatus[] = [
  "WAITING",
  "CALLED",
  "IN_PROGRESS",
  "COMPLETED",
];

export interface TrackingSnapshot {
  status: TrackingStatus;
  headline: string;
  detail: string;
  nowServing: string;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  room: string;
}

export const MOCK_TRACKING: Record<TrackingStatus, TrackingSnapshot> = {
  WAITING: {
    status: "WAITING",
    headline: "You are in the queue",
    detail: "Please stay in the seating area. Your token will appear on the display screen.",
    nowServing: "A-100",
    patientsAhead: 4,
    estimatedWaitMinutes: 18,
    room: "Zone B seating",
  },
  CALLED: {
    status: "CALLED",
    headline: "Your token has been called",
    detail: "Please go to Room 12 now. If you miss the call, report to the help desk.",
    nowServing: "A-104",
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    room: "Room 12",
  },
  IN_PROGRESS: {
    status: "IN_PROGRESS",
    headline: "Consultation in progress",
    detail: "You are with the doctor. This screen will update when the visit is finished.",
    nowServing: "A-104",
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    room: "Room 12",
  },
  COMPLETED: {
    status: "COMPLETED",
    headline: "Consultation complete",
    detail: "Your OPD visit has been marked complete.",
    nowServing: "A-105",
    patientsAhead: 0,
    estimatedWaitMinutes: 0,
    room: "Room 12",
  },
};

/** Operational label only — never a diagnosis. */
export const PRIORITY_LABEL: Record<Priority, string> = {
  RED: "High",
  YELLOW: "Medium",
  GREEN: "Routine",
};

export const PRIORITY_STATUS_LINE: Record<Priority, string> = {
  RED: "Hospital staff have been alerted.",
  YELLOW: "You will be seen sooner than routine patients.",
  GREEN: "You will be seen in normal order.",
};

export const TRIAGE_PROCESSING_STEPS = [
  "Reviewing your information…",
  "Checking department availability…",
  "Preparing your queue token…",
];
