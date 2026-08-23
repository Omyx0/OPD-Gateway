/**
 * Frontend-only mock symptom conversation.
 * No speech recognition, no AI API — a scripted question list with
 * canned "transcripts" and acknowledgements so the UI can be demonstrated.
 */

export interface SymptomQuestion {
  id: string;
  /** Question the assistant asks (one at a time). */
  prompt: string;
  /** Short helper line under the question. */
  hint: string;
  /** Tap-friendly canned answers. */
  quickReplies: string[];
  /** Canned "heard" transcript used by the simulated voice input. */
  mockTranscript: string;
  /** Assistant acknowledgement shown in the AI Speaking state. */
  acknowledgement: string;
}

export const SYMPTOM_QUESTIONS: SymptomQuestion[] = [
  {
    id: "q1",
    prompt: "What is troubling you today?",
    hint: "Describe your main problem in your own words.",
    quickReplies: ["Fever and body ache", "Chest pain", "Cough and cold", "Stomach pain"],
    mockTranscript: "I have had a fever and body ache since yesterday.",
    acknowledgement: "Thank you. I have noted your main complaint.",
  },
  {
    id: "q2",
    prompt: "How long have you had this problem?",
    hint: "An approximate answer is fine.",
    quickReplies: ["Today", "2–3 days", "About a week", "More than a month"],
    mockTranscript: "It started about two days ago.",
    acknowledgement: "Understood, thank you.",
  },
  {
    id: "q3",
    prompt: "How severe does it feel right now?",
    hint: "Choose the option closest to how you feel.",
    quickReplies: ["Mild", "Moderate", "Severe", "Unbearable"],
    mockTranscript: "It feels moderate right now.",
    acknowledgement: "Thank you for telling me.",
  },
  {
    id: "q4",
    prompt: "Do you have any other symptoms we should know about?",
    hint: "For example breathlessness, vomiting, dizziness, or bleeding.",
    quickReplies: ["No other symptoms", "Vomiting", "Dizziness", "Breathlessness"],
    mockTranscript: "No other symptoms.",
    acknowledgement: "That is everything I need for now.",
  },
];

export const SYMPTOM_DISCLAIMER =
  "This assistant provides preliminary triage support and does not replace a medical professional.";

/** Mock red-flag detection — plain keyword match, no AI. */
const RED_FLAGS =
  /chest pain|breathless|can't breathe|cannot breathe|unconscious|fainted|severe bleeding|bleeding heavily|stroke|unbearable/i;

export function detectRedFlag(text: string): boolean {
  return RED_FLAGS.test(text);
}

const URGENT = /fever|vomit|dizzy|pain|severe|injury/i;

export function mockPriorityFromAnswers(answers: string[]): "RED" | "YELLOW" | "GREEN" {
  const joined = answers.join(" ");
  if (detectRedFlag(joined)) return "RED";
  if (URGENT.test(joined)) return "YELLOW";
  return "GREEN";
}
