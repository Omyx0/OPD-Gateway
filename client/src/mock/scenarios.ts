import { mockTriage } from "@/mock/opd";

/**
 * Frontend-only demo scenarios. These build complete mock journeys
 * (patient + symptoms + triage + queue entry) so the whole product can be
 * demonstrated without any backend, API or database.
 */
import type { ChatMessage, Patient, Priority, TriageResult } from "@/types/opd";
import type { QueueIntake } from "@/services/types";

export interface DemoScenario {
  id: "routine" | "priority" | "emergency" | "rush";
  label: string;
  description: string;
  priority: Priority;
  patient: Patient;
  symptoms: { question: string; answer: string }[];
  symptomsSummary: string;
  triageSummary: string;
  flags: string[];
  department: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "routine",
    label: "Routine patient",
    description: "Mild, long-standing complaint — seen in normal order.",
    priority: "GREEN",
    department: "Dermatology",
    patient: {
      id: "demo-green",
      name: "Kavya Menon",
      age: 27,
      gender: "Female",
      phone: "+91 98860 21140",
      idNumber: "XXXX-XXXX-2114",
    },
    symptoms: [
      { question: "What brings you to the hospital today?", answer: "An itchy patch on my arm." },
      { question: "How long have you had this problem?", answer: "About two weeks." },
      { question: "How bad is it right now?", answer: "Mild, it only itches sometimes." },
      { question: "Do you have any other symptoms?", answer: "No, nothing else." },
    ],
    symptomsSummary: "Itchy patch on forearm for two weeks, mild and intermittent.",
    triageSummary: "Stable skin complaint. Routine outpatient review.",
    flags: [],
  },
  {
    id: "priority",
    label: "High-priority patient",
    description: "Symptoms that should be seen sooner than routine cases.",
    priority: "YELLOW",
    department: "General Medicine",
    patient: {
      id: "demo-yellow",
      name: "Arjun Deshpande",
      age: 51,
      gender: "Male",
      phone: "+91 99870 33218",
      idNumber: "XXXX-XXXX-3321",
    },
    symptoms: [
      { question: "What brings you to the hospital today?", answer: "Fever and body ache." },
      { question: "How long have you had this problem?", answer: "Three days now." },
      { question: "How bad is it right now?", answer: "It is getting worse today." },
      { question: "Do you have any other symptoms?", answer: "I feel dizzy when I stand up." },
    ],
    symptomsSummary: "Fever with body ache for three days, worsening, dizziness on standing.",
    triageSummary: "Persistent fever with postural dizziness. Early review advised.",
    flags: ["Fever > 48h", "Dizziness"],
  },
  {
    id: "emergency",
    label: "Emergency patient",
    description: "Red-flag symptoms — staff are alerted immediately.",
    priority: "RED",
    department: "Emergency",
    patient: {
      id: "demo-red",
      name: "Farah Sheikh",
      age: 63,
      gender: "Female",
      phone: "+91 90210 66478",
      idNumber: "XXXX-XXXX-6647",
    },
    symptoms: [
      { question: "What brings you to the hospital today?", answer: "Severe chest pain." },
      { question: "How long have you had this problem?", answer: "It started 20 minutes ago." },
      { question: "How bad is it right now?", answer: "Very bad, I cannot breathe properly." },
      { question: "Do you have any other symptoms?", answer: "Sweating and pain in my left arm." },
    ],
    symptomsSummary: "Sudden severe chest pain with breathlessness, sweating and left arm pain.",
    triageSummary: "Red-flag cardiac pattern. Immediate clinical assessment required.",
    flags: ["Chest pain", "Breathlessness", "Radiating pain"],
  },
];

/** Extra patients used by the "multiple patients in queue" scenario. */
export const DEMO_RUSH: QueueIntake[] = [
  {
    patient: {
      id: "demo-rush-1",
      name: "Vikram Rao",
      age: 44,
      gender: "Male",
      phone: "+91 98111 20034",
      idNumber: "XXXX-XXXX-2003",
    },
    department: "Orthopedics",
    priority: "GREEN",
    symptomsSummary: "Lower back pain after lifting furniture, no numbness.",
    triageSummary: "Mechanical back pain. Routine review.",
    flags: [],
  },
  {
    patient: {
      id: "demo-rush-2",
      name: "Leela Krishnan",
      age: 72,
      gender: "Female",
      phone: "+91 98410 55219",
      idNumber: "XXXX-XXXX-5521",
    },
    department: "Cardiology",
    priority: "YELLOW",
    symptomsSummary: "Palpitations and tiredness for two days.",
    triageSummary: "Palpitations in an older patient. Early review advised.",
    flags: ["Age > 65", "Palpitations"],
  },
  {
    patient: {
      id: "demo-rush-3",
      name: "Sameer Joshi",
      age: 6,
      gender: "Male",
      phone: "+91 90999 41127",
      idNumber: "XXXX-XXXX-4112",
    },
    department: "Pediatrics",
    priority: "YELLOW",
    symptomsSummary: "High fever with poor feeding since last night.",
    triageSummary: "Paediatric fever with reduced intake. Priority review.",
    flags: ["Paediatric", "Reduced feeding"],
  },
  {
    patient: {
      id: "demo-rush-4",
      name: "Nusrat Ali",
      age: 38,
      gender: "Female",
      phone: "+91 98330 71156",
      idNumber: "XXXX-XXXX-7115",
    },
    department: "ENT",
    priority: "GREEN",
    symptomsSummary: "Blocked nose and sore throat for four days.",
    triageSummary: "Upper respiratory complaint. Routine review.",
    flags: [],
  },
];

export function scenarioMessages(scenario: DemoScenario): ChatMessage[] {
  return scenario.symptoms.flatMap((turn, i) => [
    { id: `demo-${scenario.id}-${i}-ai`, role: "ai" as const, text: turn.question },
    { id: `demo-${scenario.id}-${i}-p`, role: "patient" as const, text: turn.answer },
  ]);
}

export function scenarioTriage(scenario: DemoScenario): TriageResult {
  return { ...mockTriage(scenario.priority), department: scenario.department };
}

export function scenarioIntake(scenario: DemoScenario): QueueIntake {
  return {
    patient: scenario.patient,
    department: scenario.department,
    priority: scenario.priority,
    symptomsSummary: scenario.symptomsSummary,
    triageSummary: scenario.triageSummary,
    flags: scenario.flags,
  };
}
