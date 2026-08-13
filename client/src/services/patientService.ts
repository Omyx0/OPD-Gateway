/**
 * patientService — patient records and registration input.
 *
 * MOCK IMPLEMENTATION. Every function returns local mock data and mutates
 * nothing outside memory. To integrate a backend later, replace the bodies
 * with REST calls; keep the exported signatures identical.
 */
import { MOCK_OCR_RESULT, MOCK_QUEUE, MOCK_WALK_IN, INSURANCE_PROVIDERS } from "@/mock/opd";
import type { Patient } from "@/services/types";

export interface PatientService {
  /** GET /patients */
  listPatients(): Promise<Patient[]>;
  /** GET /patients/:id */
  getPatient(id: string): Promise<Patient | null>;
  /** POST /patients/id-scan — simulated document read, no real OCR. */
  scanIdDocument(): Promise<Partial<Patient>>;
  /** Blank record used by the walk-in registration path. */
  emptyRecord(): Partial<Patient>;
  /** GET /reference/insurance-providers */
  listInsuranceProviders(): string[];
}

export const patientService: PatientService = {
  async listPatients() {
    return MOCK_QUEUE.map((entry) => entry.patient);
  },

  async getPatient(id) {
    return MOCK_QUEUE.find((entry) => entry.patient.id === id)?.patient ?? null;
  },

  async scanIdDocument() {
    return { ...MOCK_OCR_RESULT };
  },

  emptyRecord() {
    const { name, phone, idNumber } = MOCK_WALK_IN;
    return { name, phone, idNumber };
  },

  listInsuranceProviders() {
    return INSURANCE_PROVIDERS;
  },
};
