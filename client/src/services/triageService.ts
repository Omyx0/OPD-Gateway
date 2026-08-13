/**
 * triageService — symptom questions and priority assessment.
 *
 * MOCK IMPLEMENTATION. No AI, no speech recognition, no external API:
 * a scripted question list plus keyword matching. A future backend would
 * expose `GET /triage/questions` and `POST /triage/assess`.
 */
import { mockTriage } from "@/mock/opd";
import {
  SYMPTOM_DISCLAIMER,
  SYMPTOM_QUESTIONS,
  detectRedFlag,
  mockPriorityFromAnswers,
} from "@/mock/symptom-flow";
import {
  PRIORITY_LABEL,
  PRIORITY_STATUS_LINE,
  TRIAGE_PROCESSING_STEPS,
} from "@/mock/queue-tracking";
import type { Priority, SymptomQuestion, TriageResult } from "@/services/types";

export interface TriageService {
  /** GET /triage/questions */
  getQuestions(): SymptomQuestion[];
  /** Static consent/disclaimer copy shown before the conversation. */
  getDisclaimer(): string;
  /** Client-side red-flag hint used to offer the emergency escape. */
  detectRedFlag(text: string): boolean;
  /** POST /triage/assess — derives a priority from the collected answers. */
  assessAnswers(answers: string[]): Priority;
  /** GET /triage/result — operational outcome for a priority. */
  getResult(priority: Priority): TriageResult;
  /** Progress copy shown while the assessment "runs". */
  getProcessingSteps(): string[];
  /** Patient-facing priority wording (never a diagnosis). */
  getPriorityLabel(priority: Priority): string;
  getPriorityStatusLine(priority: Priority): string;
}

export const triageService: TriageService = {
  getQuestions() {
    return SYMPTOM_QUESTIONS;
  },

  getDisclaimer() {
    return SYMPTOM_DISCLAIMER;
  },

  detectRedFlag(text) {
    return detectRedFlag(text);
  },

  assessAnswers(answers) {
    return mockPriorityFromAnswers(answers);
  },

  getResult(priority) {
    return mockTriage(priority);
  },

  getProcessingSteps() {
    return TRIAGE_PROCESSING_STEPS;
  },

  getPriorityLabel(priority) {
    return PRIORITY_LABEL[priority];
  },

  getPriorityStatusLine(priority) {
    return PRIORITY_STATUS_LINE[priority];
  },
};
