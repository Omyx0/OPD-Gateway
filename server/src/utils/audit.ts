/**
 * Audit logging utility.
 *
 * Inserts a row into the `audit_logs` table for traceability.
 * Fire-and-forget — failures are logged but never block the caller.
 */
import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "./logger.js";

export interface AuditEntry {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: entry.actorUserId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    logger.error("Failed to write audit log", { error: err, entry });
  }
}
