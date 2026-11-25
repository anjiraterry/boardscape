import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/crypto";
import { getSql } from "@/lib/db/neon";
import { getDatabaseUrl, isDatabaseConfigured } from "@/lib/env";
import { AppRoleSchema } from "@/modules/identity/schemas";

const CreateUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  password: z.string().min(10),
  role: AppRoleSchema,
  organizationId: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession();
    requireRole(session, ["admin_finance"]);

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const sql = getSql();
    const users = await sql`
      SELECT
        p.id,
        p.email,
        p.full_name,
        m.role,
        m.organization_id,
        o.name AS organization_name,
        m.is_active
      FROM profiles p
      INNER JOIN memberships m ON m.user_id = p.id
      INNER JOIN organizations o ON o.id = m.organization_id
      ORDER BY p.created_at DESC
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
    const actor = requireRole(session, ["admin_finance"]);

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid user payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const targetOrgId =
      parsed.data.organizationId ?? actor.activeOrganizationId;
    if (!targetOrgId) {
      return NextResponse.json(
        { error: "Target organizationId is required." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = hashPassword(parsed.data.password);

    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const profileRes = await client.query(
        `INSERT INTO profiles (email, password_hash, full_name)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [email, passwordHash, parsed.data.fullName.trim()]
      );
      const userId = String(profileRes.rows[0].id);

      await client.query(
        `INSERT INTO memberships (organization_id, user_id, role, is_active)
         VALUES ($1, $2, $3, true)`,
        [targetOrgId, userId, parsed.data.role]
      );

      await client.query(
        `INSERT INTO audit_events (actor_id, organization_id, entity_type, entity_id, action, after_state, source)
         VALUES ($1, $2, 'profile', $3, 'identity.user_created', $4::jsonb, 'studio')`,
        [
          actor.userId,
          targetOrgId,
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
        { error: "Failed to create user (email may already exist)." },
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
