import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { OrgTypeSchema } from "@/modules/identity/schemas";
import { recordAuditEvent } from "@/modules/audit/service";
import { slugify } from "@/lib/utils";

const CreateOrgSchema = z.object({
  name: z.string().min(2).max(120),
  type: OrgTypeSchema,
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const session = await getServerSession();
    requirePermission(session, "organizations:manage");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const sql = getSql();
    const organizations = await sql`
      SELECT
        o.id,
        o.name,
        o.type,
        o.slug,
        o.status,
        o.contact_email,
        o.created_at,
        COUNT(DISTINCT m.user_id) FILTER (WHERE m.is_active = true)::int AS member_count
      FROM organizations o
      LEFT JOIN memberships m ON m.organization_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ organizations });
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
    const actor = requirePermission(session, "organizations:manage");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = CreateOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid organization payload" },
        { status: 400 }
      );
    }

    const slug = `${slugify(parsed.data.name) || "org"}-${Date.now().toString(36).slice(-4)}`;
    const sql = getSql();
    const rows = await sql`
      INSERT INTO organizations (name, type, slug, contact_email, contact_phone, status)
      VALUES (
        ${parsed.data.name.trim()},
        ${parsed.data.type},
        ${slug},
        ${parsed.data.contactEmail || null},
        ${parsed.data.contactPhone || null},
        'active'
      )
      RETURNING id, name, type, slug, status
    `;

    const org = rows[0];
    if (!org) {
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: String(org.id),
      entityType: "organization",
      entityId: String(org.id),
      action: "admin.organization_created",
      afterState: { name: org.name, type: org.type },
      source: "admin",
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
