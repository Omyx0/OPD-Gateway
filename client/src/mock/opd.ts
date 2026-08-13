import type {
  ChatMessage,
  DepartmentLoad,
  EmergencyAlert,
  Priority,
  QueueEntry,
  TriageResult,
} from "@/types/opd";

export const DEPARTMENTS = [
  "General Medicine",
  "Pediatrics",
  "Orthopedics",
  "Emergency",
  "Dermatology",
  "Cardiology",
  "ENT",
];

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
];

/**
 * Mock data only. Shaped like future API responses so it can be replaced
 * by real fetches without touching component code.
 */
export const MOCK_QUEUE: QueueEntry[] = [
  {
    id: "q1",
    token: "A-104",
    patient: {
      id: "p1",
      name: "Rahul Sharma",
      age: 42,
      gender: "Male",
      phone: "+91 98200 41102",
      idNumber: "XXXX-XXXX-4410",
    },
    department: "General Medicine",
    priority: "YELLOW",
    status: "WAITING",
    arrivalTime: "09:12",
    waitMinutes: 18,
    symptomsSummary: "Chest tightness after climbing stairs, mild breathlessness.",
    triageSummary: "Cardio-respiratory symptoms with exertion. Recommend early review.",
    flags: ["Exertional symptoms", "History of hypertension"],
  },
  {
    id: "q2",
    token: "A-105",
    patient: {
      id: "p2",
      name: "Aisha Khan",
      age: 29,
      gender: "Female",
      phone: "+91 98450 77321",
      idNumber: "XXXX-XXXX-7732",
    },
    department: "Emergency",
    priority: "RED",
    status: "CALLED",
    arrivalTime: "09:26",
    waitMinutes: 4,
    symptomsSummary: "Severe abdominal pain, vomiting, unable to stand.",
    triageSummary: "Acute abdomen pattern. Immediate clinical assessment required.",
    flags: ["Severe pain", "Vomiting"],
  },
  {
    id: "q3",
    token: "A-106",
    patient: {
      id: "p3",
      name: "Mohan Iyer",
      age: 67,
      gender: "Male",
      phone: "+91 90030 22119",
      idNumber: "XXXX-XXXX-2211",
    },
    department: "Orthopedics",
    priority: "GREEN",
    status: "WAITING",
    arrivalTime: "08:54",
    waitMinutes: 36,
    symptomsSummary: "Knee stiffness in the morning for three weeks.",
    triageSummary: "Chronic joint complaint. Routine outpatient review.",
    flags: [],
  },
  {
    id: "q4",
    token: "A-107",
    patient: {
      id: "p4",
      name: "Priya Nair",
      age: 8,
      gender: "Female",
      phone: "+91 99400 55127",
      idNumber: "XXXX-XXXX-5512",
    },
    department: "Pediatrics",
    priority: "YELLOW",
    status: "IN_PROGRESS",
    arrivalTime: "09:02",
    waitMinutes: 12,
    symptomsSummary: "Fever 102°F for two days, reduced appetite.",
    triageSummary: "Persistent paediatric fever. Priority review advised.",
    flags: ["Paediatric", "Fever > 48h"],
  },
  {
    id: "q5",
    token: "A-108",
    patient: {
      id: "p5",
      name: "Daniel George",
      age: 35,
      gender: "Male",
      phone: "+91 88760 10093",
      idNumber: "XXXX-XXXX-1009",
    },
    department: "Dermatology",
    priority: "GREEN",
    status: "WAITING",
    arrivalTime: "09:31",
    waitMinutes: 9,
    symptomsSummary: "Itchy rash on forearms after new detergent.",
    triageSummary: "Likely contact dermatitis. Routine review.",
    flags: [],
  },
  {
    id: "q6",
    token: "A-109",
    patient: {
      id: "p6",
      name: "Sunita Devi",
      age: 54,
      gender: "Female",
      phone: "+91 97110 44287",
      idNumber: "XXXX-XXXX-4428",
    },
    department: "General Medicine",
    priority: "GREEN",
    status: "COMPLETED",
    arrivalTime: "08:20",
    waitMinutes: 0,
    symptomsSummary: "Follow-up for diabetes medication review.",
    triageSummary: "Routine follow-up consultation.",
    flags: ["Follow-up"],
  },
  {
    id: "q7",
    token: "A-110",
    patient: {
      id: "p7",
      name: "Meera Iyer",
      age: 31,
      gender: "Female",
      phone: "+91 90040 55219",
      idNumber: "XXXX-XXXX-5521",
    },
    department: "ENT",
    priority: "GREEN",
    status: "WAITING",
    arrivalTime: "09:38",
    waitMinutes: 7,
    symptomsSummary: "Sore throat and blocked ear for three days.",
    triageSummary: "Upper respiratory complaint. Routine review.",
    flags: [],
  },
  {
    id: "q8",
    token: "A-111",
    patient: {
      id: "p8",
      name: "Imran Qureshi",
      age: 67,
      gender: "Male",
      phone: "+91 99870 21145",
      idNumber: "XXXX-XXXX-2114",
    },
    department: "Cardiology",
    priority: "RED",
    status: "WAITING",
    arrivalTime: "09:41",
    waitMinutes: 4,
    symptomsSummary: "Sudden severe chest pain radiating to left arm.",
    triageSummary: "Red-flag cardiac presentation. Immediate attention required.",
    flags: ["Red flag", "Age 65+"],
  },
  {
    id: "q9",
    token: "A-112",
    patient: {
      id: "p9",
      name: "Nikhil Verma",
      age: 12,
      gender: "Male",
      phone: "+91 98330 76610",
      idNumber: "XXXX-XXXX-7661",
    },
    department: "Pediatrics",
    priority: "YELLOW",
    status: "IN_PROGRESS",
    arrivalTime: "09:05",
    waitMinutes: 26,
    symptomsSummary: "Fever 39°C for two days with reduced fluid intake.",
    triageSummary: "Persistent paediatric fever. Review sooner.",
    flags: ["Paediatric", "Persistent fever"],
  },
  {
    id: "q10",
    token: "A-113",
    patient: {
      id: "p10",
      name: "Fatima Sheikh",
      age: 45,
      gender: "Female",
      phone: "+91 93210 88034",
      idNumber: "XXXX-XXXX-8803",
    },
    department: "Orthopedics",
    priority: "YELLOW",
    status: "WAITING",
    arrivalTime: "08:52",
    waitMinutes: 44,
    symptomsSummary: "Ankle swelling and inability to bear weight after a fall.",
    triageSummary: "Possible fracture. Imaging review suggested.",
    flags: ["Injury", "Long wait"],
  },
];

export const MOCK_ALERTS: EmergencyAlert[] = [
  {
    id: "al1",
    token: "A-105",
    department: "Emergency",
    message: "Potential urgent case detected during triage.",
    raisedAt: "09:26",
    acknowledged: false,
  },
  {
    id: "al2",
    token: "A-104",
    department: "General Medicine",
    message: "Exertional chest symptoms reported — review ordering.",
    raisedAt: "09:14",
    acknowledged: false,
  },
];

export const MOCK_DEPARTMENT_LOAD: DepartmentLoad[] = [
  { name: "General Medicine", waiting: 12, averageWaitMinutes: 22 },
  { name: "Pediatrics", waiting: 6, averageWaitMinutes: 15 },
  { name: "Orthopedics", waiting: 8, averageWaitMinutes: 31 },
  { name: "Emergency", waiting: 3, averageWaitMinutes: 4 },
  { name: "Dermatology", waiting: 5, averageWaitMinutes: 18 },
];

export const MOCK_HOURLY_FLOW = [
  { hour: "08:00", patients: 9 },
  { hour: "09:00", patients: 18 },
  { hour: "10:00", patients: 24 },
  { hour: "11:00", patients: 21 },
  { hour: "12:00", patients: 14 },
  { hour: "13:00", patients: 8 },
  { hour: "14:00", patients: 16 },
];

export const MOCK_AI_SCRIPT: ChatMessage[] = [
  { id: "m1", role: "ai", text: "Hello. Can you tell me what is troubling you today?" },
  {
    id: "m2",
    role: "ai",
    text: "Thank you. How long have you had this problem?",
  },
  {
    id: "m3",
    role: "ai",
    text: "Understood. Is the discomfort mild, moderate or severe right now?",
  },
  {
    id: "m4",
    role: "ai",
    text: "Thank you. I have enough information to prepare your queue priority.",
  },
];

export function mockTriage(priority: Priority = "YELLOW"): TriageResult {
  const results: Record<Priority, TriageResult> = {
    RED: {
      priority: "RED",
      department: "Emergency",
      reason: "Your answers suggest symptoms that need immediate attention.",
      advice: ["Please stay near the emergency desk", "A staff member will reach you shortly"],
    },
    YELLOW: {
      priority: "YELLOW",
      department: "General Medicine",
      reason: "Your symptoms should be reviewed sooner than routine cases.",
      advice: ["Please remain seated in Zone B", "Keep your token visible"],
    },
    GREEN: {
      priority: "GREEN",
      department: "General Medicine",
      reason: "Your symptoms appear routine and can be seen in normal order.",
      advice: ["Please wait in the seating area", "Water is available near the entrance"],
    },
  };
  return results[priority];
}

export const MOCK_OCR_RESULT = {
  name: "Rahul Sharma",
  age: 42,
  gender: "Male" as const,
  phone: "+91 98200 41102",
  idNumber: "XXXX-XXXX-4410",
  dateOfBirth: "1984-03-17",
  address: "14 Ashok Nagar, Andheri East, Mumbai 400069",
  insuranceProvider: "StarHealth Family Plan",
  insuranceNumber: "SH-8842-1174",
};

/** Mock walk-in placeholder record (no ID presented). */
export const MOCK_WALK_IN = {
  name: "",
  age: undefined as number | undefined,
  gender: undefined,
  phone: "",
  idNumber: "",
};

export const INSURANCE_PROVIDERS = [
  "No insurance / self pay",
  "StarHealth Family Plan",
  "Ayushman Bharat",
  "New India Assurance",
  "Corporate group cover",
];
