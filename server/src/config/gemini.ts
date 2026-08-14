import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Primary triage model — used for symptom conversation and assessment.
 */
export const triageModel = genAI.getGenerativeModel({
  model: env.GEMINI_TRIAGE_MODEL,
});

export { genAI };
