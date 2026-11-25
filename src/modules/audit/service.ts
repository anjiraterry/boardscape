import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { AuditEventInput } from "@/modules/audit/schemas";

export async function recordAuditEvent(event: AuditEventInput): Promise<void> {
  if (!isDatabaseConfigured()) {
    logger.info("Audit event (local/unconfigured)", {
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
    });
    return;
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO audit_events (
        actor_id,
        organization_id,
        entity_type,
        entity_id,
        action,
        before_state,
        after_state,
        source
      )
      VALUES (
        ${event.actorId},
        ${event.organizationId},
        ${event.entityType},
        ${event.entityId},
        ${event.action},
        ${event.beforeState ? JSON.stringify(event.beforeState) : null}::jsonb,
        ${event.afterState ? JSON.stringify(event.afterState) : null}::jsonb,
        ${event.source}
      )
    `;
  } catch (err) {
    logger.error("Failed to persist audit event", {
      entityType: event.entityType,
      action: event.action,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
