import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getDatabaseUrl, isDatabaseConfigured } from "@/lib/env";
import { canAssignRole } from "@/modules/identity/policies";
import { AppRoleSchema } from "@/modules/identity/schemas";

const PatchUserSchema = z.object({
  action: z.enum(["suspend", "reactivate", "assign_role"]),
  reason: z.string().min(3).max(300).optional(),
  role: AppRoleSchema.optional(),
  organizationId: z.string().uuid().optional(),
});

async function countOtherActiveSuperAdmins(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> },
  excludeUserId: string
): Promise<number> {
  const res = await client.query(
    `SELECT COUNT(DISTINCT p.id)::int AS count
     FROM profiles p
     INNER JOIN memberships m ON m.user_id = p.id
     WHERE p.status = 'active'
       AND m.is_active = true
       AND m.role = 'super_admin'
       AND p.id <> $1`,
    [excludeUserId]
  );
  return Number(res.rows[0]?.count ?? 0);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const { id: targetUserId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = PatchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid user update payload" },
        { status: 400 }
      );
    }

    const actor =
      parsed.data.action === "assign_role"
        ? requirePermission(session, "roles:assign")
        : requirePermission(session, "accounts:suspend");

    if (parsed.data.action === "assign_role") {
      if (!parsed.data.role || !parsed.data.organizationId) {
        return NextResponse.json(
          { error: "role and organizationId are required." },
          { status: 400 }
        );
      }
      const roleCheck = canAssignRole(actor, parsed.data.role);
      if (!roleCheck.allowed) {
        return NextResponse.json({ error: roleCheck.reason }, { status: 403 });
      }
    }

    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const targetRes = await client.query(
        `SELECT p.id, p.status, m.role
         FROM profiles p
         LEFT JOIN memberships m ON m.user_id = p.id AND m.is_active = true
         WHERE p.id = $1
         LIMIT 1`,
        [targetUserId]
      );
      const target = targetRes.rows[0];
      if (!target) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const targetIsSuperAdmin = String(target.role ?? "") === "super_admin";

      if (
        (parsed.data.action === "suspend" && targetIsSuperAdmin) ||
        (parsed.data.action === "assign_role" &&
          targetIsSuperAdmin &&
          parsed.data.role !== "super_admin")
      ) {
        const others = await countOtherActiveSuperAdmins(client, targetUserId);
        if (others === 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            {
              error:
                "Cannot suspend or demote the last active Platform Super Admin.",
            },
            { status: 409 }
          );
        }
      }

      if (parsed.data.action === "suspend") {
        await client.query(
          `UPDATE profiles
           SET status = 'suspended', suspended_at = NOW(), suspended_reason = $2
           WHERE id = $1`,
          [targetUserId, parsed.data.reason ?? "Suspended by platform admin"]
        );
      } else if (parsed.data.action === "reactivate") {
        await client.query(
          `UPDATE profiles
           SET status = 'active', suspended_at = NULL, suspended_reason = NULL
           WHERE id = $1`,
          [targetUserId]
        );
      } else if (parsed.data.action === "assign_role") {
        await client.query(
          `UPDATE memberships SET is_active = false WHERE user_id = $1`,
          [targetUserId]
        );
        await client.query(
          `INSERT INTO memberships (organization_id, user_id, role, is_active)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (organization_id, user_id, role)
           DO UPDATE SET is_active = true`,
          [parsed.data.organizationId, targetUserId, parsed.data.role]
        );
      }

      await client.query(
        `INSERT INTO audit_events (actor_id, organization_id, entity_type, entity_id, action, before_state, after_state, source)
         VALUES ($1, $2, 'profile', $3, $4, $5::jsonb, $6::jsonb, 'admin')`,
        [
          actor.userId,
          actor.activeOrganizationId,
          targetUserId,
          `admin.user_${parsed.data.action}`,
          JSON.stringify({ status: target.status, role: target.role }),
          JSON.stringify({
            action: parsed.data.action,
            role: parsed.data.role ?? target.role,
            reason: parsed.data.reason ?? null,
          }),
        ]
      );

      await client.query("COMMIT");
      return NextResponse.json({ ok: true, userId: targetUserId });
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
