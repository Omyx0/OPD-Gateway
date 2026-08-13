import type { Priority, QueueEntry } from "@/types/opd";

/**
 * Structured, human-readable triage record — mock only.
 * Deliberately operational: no diagnosis, no raw model output, no free-form
 * assistant transcript is surfaced to staff.
 */
export interface TriageRecord {
  priority: Priority;
  priorityLabel: string;
  recommendedAction: string;
  assessedAt: string;
  source: "Kiosk self check-in" | "Front desk" | "Walk-in";
  redFlags: string[];
  observations: { label: string; value: string }[];
  reviewNote: string;
}

export interface VisitRecord {
  visitId: string;
  visitType: "New visit" | "Follow-up" | "Referral";
  registrationMethod: "ID scan" | "Manual entry" | "Walk-in";
  arrivalTime: string;
  department: string;
  assignedRoom: string;
  clinician: string;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  RED: "Emergency — see immediately",
  YELLOW: "Priority — review sooner",
  GREEN: "Routine — normal order",
};

const ACTION: Record<Priority, string> = {
  RED: "Escalate to the emergency team and alert the duty clinician now.",
  YELLOW: "Move ahead of routine patients and review within the next few slots.",
  GREEN: "Continue in normal queue order.",
};

function pick<T>(list: T[], seed: string): T {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[n % list.length]!;
}

export function buildVisitRecord(entry: QueueEntry): VisitRecord {
  return {
    visitId: `V-${entry.token.replace("-", "")}-2481`,
    visitType: pick(["New visit", "Follow-up", "Referral"] as const, entry.id),
    registrationMethod: pick(["ID scan", "Manual entry", "Walk-in"] as const, entry.token),
    arrivalTime: entry.arrivalTime,
    department: entry.department,
    assignedRoom: `Room ${1 + (entry.token.charCodeAt(entry.token.length - 1) % 6)}`,
    clinician: pick(
      ["Dr. A. Menon", "Dr. S. Kulkarni", "Dr. R. Banerjee", "Dr. P. Nadar"],
      entry.id + entry.token,
    ),
  };
}

export function buildTriageRecord(entry: QueueEntry): TriageRecord {
  return {
    priority: entry.priority,
    priorityLabel: PRIORITY_LABEL[entry.priority],
    recommendedAction: ACTION[entry.priority],
    assessedAt: entry.arrivalTime,
    source: pick(["Kiosk self check-in", "Front desk", "Walk-in"] as const, entry.id),
    redFlags: entry.flags,
    observations: [
      { label: "Reported duration", value: pick(["Today", "2 days", "1 week"], entry.token) },
      {
        label: "Pain level (self-reported)",
        value: pick(["Mild", "Moderate", "Severe"], entry.id),
      },
      { label: "Mobility", value: pick(["Independent", "Needs assistance"], entry.token + "m") },
      { label: "Accompanied by", value: pick(["Alone", "Family member"], entry.id + "a") },
    ],
    reviewNote: entry.triageSummary,
  };
}
