export type Priority = "RED" | "YELLOW" | "GREEN";

export type QueueStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export type RegistrationMethod = "ID_SCAN" | "MANUAL" | "WALK_IN";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  idNumber: string;
  dateOfBirth?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface QueueEntry {
  id: string;
  token: string;
  patient: Patient;
  department: string;
  priority: Priority;
  status: QueueStatus;
  arrivalTime: string;
  waitMinutes: number;
  symptomsSummary: string;
  triageSummary: string;
  flags: string[];
}

export interface EmergencyAlert {
  id: string;
  token: string;
  department: string;
  message: string;
  raisedAt: string;
  acknowledged: boolean;
}

export interface DepartmentLoad {
  name: string;
  waiting: number;
  averageWaitMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  text: string;
}

export interface TriageResult {
  priority: Priority;
  department: string;
  reason: string;
  advice: string[];
}

export interface KioskSession {
  language: string;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  clearLabels: boolean;
  voicePreference: "off" | "spoken" | "slow";
  registrationMethod: RegistrationMethod | null;
  patient: Partial<Patient>;
  symptoms: ChatMessage[];
  triageResult: TriageResult | null;
  ticket: { token: string; position: number; estimatedWaitMinutes: number } | null;
}
