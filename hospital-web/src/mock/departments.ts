import type { QueueEntry } from "@/types/opd";

/**
 * Department directory — mock configuration only.
 * Live counts are derived from the queue at render time so departments
 * can be added or renamed here without touching any component.
 */
export interface DepartmentConfig {
  id: string;
  name: string;
  code: string;
  location: string;
  consultingRooms: number;
  cliniciansOnDuty: number;
  hours: string;
  acceptingWalkIns: boolean;
  targetWaitMinutes: number;
}

export const DEPARTMENT_DIRECTORY: DepartmentConfig[] = [
  {
    id: "gen-med",
    name: "General Medicine",
    code: "GM",
    location: "Block A · Level 1",
    consultingRooms: 6,
    cliniciansOnDuty: 4,
    hours: "08:00 – 18:00",
    acceptingWalkIns: true,
    targetWaitMinutes: 20,
  },
  {
    id: "peds",
    name: "Pediatrics",
    code: "PD",
    location: "Block B · Level 2",
    consultingRooms: 4,
    cliniciansOnDuty: 3,
    hours: "08:00 – 16:00",
    acceptingWalkIns: true,
    targetWaitMinutes: 15,
  },
  {
    id: "ortho",
    name: "Orthopedics",
    code: "OR",
    location: "Block C · Level 1",
    consultingRooms: 3,
    cliniciansOnDuty: 2,
    hours: "09:00 – 17:00",
    acceptingWalkIns: false,
    targetWaitMinutes: 25,
  },
  {
    id: "emergency",
    name: "Emergency",
    code: "ER",
    location: "Ground floor · Ambulance bay",
    consultingRooms: 8,
    cliniciansOnDuty: 6,
    hours: "24 hours",
    acceptingWalkIns: true,
    targetWaitMinutes: 5,
  },
  {
    id: "derm",
    name: "Dermatology",
    code: "DR",
    location: "Block B · Level 3",
    consultingRooms: 2,
    cliniciansOnDuty: 2,
    hours: "10:00 – 16:00",
    acceptingWalkIns: false,
    targetWaitMinutes: 30,
  },
  {
    id: "cardio",
    name: "Cardiology",
    code: "CD",
    location: "Block C · Level 3",
    consultingRooms: 3,
    cliniciansOnDuty: 2,
    hours: "09:00 – 15:00",
    acceptingWalkIns: false,
    targetWaitMinutes: 20,
  },
  {
    id: "ent",
    name: "ENT",
    code: "EN",
    location: "Block A · Level 2",
    consultingRooms: 2,
    cliniciansOnDuty: 1,
    hours: "09:00 – 14:00",
    acceptingWalkIns: true,
    targetWaitMinutes: 25,
  },
];

export interface DepartmentSnapshot extends DepartmentConfig {
  waiting: number;
  inProgress: number;
  completed: number;
  emergency: number;
  priority: number;
  routine: number;
  averageWaitMinutes: number;
  longestWaitMinutes: number;
}

/** Derive live-looking department metrics from whatever queue is in local state. */
export function buildDepartmentSnapshots(
  queue: QueueEntry[],
  directory: DepartmentConfig[] = DEPARTMENT_DIRECTORY,
): DepartmentSnapshot[] {
  return directory.map((config) => {
    const rows = queue.filter((e) => e.department === config.name);
    const active = rows.filter((e) => e.status === "WAITING" || e.status === "CALLED");
    const waits = active.map((e) => e.waitMinutes);

    return {
      ...config,
      waiting: active.length,
      inProgress: rows.filter((e) => e.status === "IN_PROGRESS").length,
      completed: rows.filter((e) => e.status === "COMPLETED").length,
      emergency: rows.filter((e) => e.priority === "RED" && e.status !== "COMPLETED").length,
      priority: rows.filter((e) => e.priority === "YELLOW" && e.status !== "COMPLETED").length,
      routine: rows.filter((e) => e.priority === "GREEN" && e.status !== "COMPLETED").length,
      averageWaitMinutes: waits.length
        ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
        : 0,
      longestWaitMinutes: waits.length ? Math.max(...waits) : 0,
    };
  });
}
