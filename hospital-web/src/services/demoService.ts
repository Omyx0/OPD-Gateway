/**
 * demoService — scripted end-to-end demonstration journeys.
 *
 * DEMO ONLY. This service exists so the app can be shown without a backend;
 * it has no real-API counterpart and can simply be deleted once live data
 * is wired in. Keeping it here means no UI component imports mock data.
 */
import {
  DEMO_RUSH,
  DEMO_SCENARIOS,
  scenarioIntake,
  scenarioMessages,
  scenarioTriage,
  type DemoScenario,
} from "@/mock/scenarios";
import type { ChatMessage, QueueIntake, TriageResult } from "@/services/types";

export type { DemoScenario };

export interface DemoService {
  listScenarios(): DemoScenario[];
  /** Extra waiting patients used by the "multiple patients" demo. */
  listRushIntakes(): QueueIntake[];
  toIntake(scenario: DemoScenario): QueueIntake;
  toMessages(scenario: DemoScenario): ChatMessage[];
  toTriageResult(scenario: DemoScenario): TriageResult;
}

export const demoService: DemoService = {
  listScenarios() {
    return DEMO_SCENARIOS;
  },
  listRushIntakes() {
    return DEMO_RUSH;
  },
  toIntake(scenario) {
    return scenarioIntake(scenario);
  },
  toMessages(scenario) {
    return scenarioMessages(scenario);
  },
  toTriageResult(scenario) {
    return scenarioTriage(scenario);
  },
};
