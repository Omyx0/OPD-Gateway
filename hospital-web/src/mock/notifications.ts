export type NotificationKind = "EMERGENCY" | "QUEUE" | "STAFF_ACTION";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/** Frontend-only seed data — no notification service involved. */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "EMERGENCY",
    title: "Emergency alert · A-105",
    body: "Potential urgent case detected during triage. Department: Emergency.",
    time: "09:26",
    read: false,
  },
  {
    id: "n2",
    kind: "EMERGENCY",
    title: "Emergency alert · A-104",
    body: "Exertional chest symptoms reported — review ordering.",
    time: "09:14",
    read: false,
  },
  {
    id: "n3",
    kind: "QUEUE",
    title: "Queue update · Orthopedics",
    body: "Average wait crossed the 25 minute target (now 40m).",
    time: "09:31",
    read: false,
  },
  {
    id: "n4",
    kind: "STAFF_ACTION",
    title: "Dr. S. Kulkarni completed A-109",
    body: "General Medicine · consultation closed after 12 minutes.",
    time: "09:05",
    read: true,
  },
  {
    id: "n5",
    kind: "QUEUE",
    title: "Queue update · Pediatrics",
    body: "2 patients moved into consultation rooms.",
    time: "08:58",
    read: true,
  },
];

export function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
