import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Pool } from "@neondatabase/serverless";
import {
  hashPassword,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from "@/lib/auth/crypto";
import { getSql } from "@/lib/db/neon";
import { getDatabaseUrl, isDatabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/utils";

const BootstrapSchema = z.object({
  organizationName: z.string().min(2).max(120),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(10, "Password must be at least 10 characters."),
});

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ configured: false, bootstrapped: false });
  }
  try {
    const sql = getSql();
    const rows = await sql`SELECT COUNT(*)::int AS count FROM profiles`;
    return NextResponse.json({
      configured: true,
      bootstrapped: Number(rows[0]?.count ?? 0) > 0,
      environment: process.env.NEON_BRANCH ?? "local",
    });
  } catch {
    return NextResponse.json({
      configured: true,
      bootstrapped: false,
      environment: process.env.NEON_BRANCH ?? "local",
    });
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Neon DATABASE_URL is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = BootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Invalid bootstrap credentials.",
      },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = hashPassword(parsed.data.password);
  const orgSlug = `${slugify(parsed.data.organizationName) || "boardscape"}-${Date.now().toString(36).slice(-4)}`;

  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE profiles IN SHARE ROW EXCLUSIVE MODE");

    const existing = await client.query(
      "SELECT COUNT(*)::int AS count FROM profiles"
    );
    if (Number(existing.rows[0]?.count ?? 0) > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Bootstrap already completed. Sign in as an administrator to manage accounts.",
        },
        { status: 409 }
      );
    }

    const orgRes = await client.query(
      `INSERT INTO organizations (name, type, slug, contact_email)
       VALUES ($1, 'agency', $2, $3)
       RETURNING id`,
      [parsed.data.organizationName.trim(), orgSlug, email]
    );
    const orgId = String(orgRes.rows[0].id);

    const profileRes = await client.query(
      `INSERT INTO profiles (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [email, passwordHash, parsed.data.fullName.trim()]
    );
    const userId = String(profileRes.rows[0].id);

    await client.query(
      `INSERT INTO memberships (organization_id, user_id, role, is_active)
       VALUES ($1, $2, 'super_admin', true)`,
      [orgId, userId]
    );

    await client.query(
      `INSERT INTO audit_events (actor_id, organization_id, entity_type, entity_id, action, after_state, source)
       VALUES ($1, $2, 'profile', $1, 'identity.super_admin_bootstrapped', $3::jsonb, 'bootstrap')`,
      [
        userId,
        orgId,
        JSON.stringify({
          organizationName: parsed.data.organizationName,
          role: "super_admin",
          environment: process.env.NEON_BRANCH ?? "local",
        }),
      ]
    );

    await client.query("COMMIT");

    const token = signSessionToken(userId, email);
    const response = NextResponse.json(
      { ok: true, userId, organizationId: orgId, email },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return NextResponse.json(
      { error: "Failed to complete initial bootstrap." },
      { status: 500 }
    );
  } finally {
    client.release();
    await pool.end();
  }
}
