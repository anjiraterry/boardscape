import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/crypto";
import { getSql } from "@/lib/db/neon";
import { getDatabaseUrl, isDatabaseConfigured } from "@/lib/env";
import { canAssignRole } from "@/modules/identity/policies";
import { AppRoleSchema } from "@/modules/identity/schemas";

const CreateAdminUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  password: z.string().min(10, "Password must be at least 10 characters."),
  role: AppRoleSchema,
  organizationId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    requirePermission(session, "users:manage");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
    const sql = getSql();

    const users = await sql`
      SELECT
        p.id,
        p.email,
        p.full_name,
        p.status,
        p.last_login_at,
        p.created_at,
        m.role,
        m.organization_id,
        o.name AS organization_name,
        o.type AS organization_type
      FROM profiles p
      LEFT JOIN memberships m ON m.user_id = p.id AND m.is_active = true
      LEFT JOIN organizations o ON o.id = m.organization_id
      WHERE (${q || null}::text IS NULL OR p.email ILIKE ${`%${q}%`} OR p.full_name ILIKE ${`%${q}%`})
        AND (${status || null}::text IS NULL OR p.status = ${status || null})
      ORDER BY p.created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requirePermission(session, "users:manage");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = CreateAdminUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid user payload" },
        { status: 400 }
      );
    }

    const roleCheck = canAssignRole(actor, parsed.data.role);
    if (!roleCheck.allowed) {
      return NextResponse.json({ error: roleCheck.reason }, { status: 403 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = hashPassword(parsed.data.password);

    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const profileRes = await client.query(
        `INSERT INTO profiles (email, password_hash, full_name, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id`,
        [email, passwordHash, parsed.data.fullName.trim()]
      );
      const userId = String(profileRes.rows[0].id);

      await client.query(
        `INSERT INTO memberships (organization_id, user_id, role, is_active)
         VALUES ($1, $2, $3, true)`,
        [parsed.data.organizationId, userId, parsed.data.role]
      );

      await client.query(
        `INSERT INTO audit_events (actor_id, organization_id, entity_type, entity_id, action, after_state, source)
         VALUES ($1, $2, 'profile', $3, 'admin.user_invited', $4::jsonb, 'admin')`,
        [
          actor.userId,
          parsed.data.organizationId,
          userId,
          JSON.stringify({ email, role: parsed.data.role }),
        ]
      );

      await client.query("COMMIT");
      return NextResponse.json(
        { ok: true, userId, email, role: parsed.data.role },
        { status: 201 }
      );
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      return NextResponse.json(
        { error: "Unable to create user (email may already exist)." },
        { status: 409 }
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
