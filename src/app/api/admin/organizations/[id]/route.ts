import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { recordAuditEvent } from "@/modules/audit/service";

const PatchOrgSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requirePermission(session, "organizations:manage");
    const { id: orgId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = PatchOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const sql = getSql();
    const existing = await sql`
      SELECT id, type, status FROM organizations WHERE id = ${orgId} LIMIT 1
    `;
    if (!existing[0]) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (
      String(existing[0].type) === "agency" &&
      parsed.data.status === "suspended"
    ) {
      return NextResponse.json(
        { error: "Cannot suspend the primary agency organization." },
        { status: 409 }
      );
    }

    await sql`
      UPDATE organizations
      SET status = ${parsed.data.status}, updated_at = NOW()
      WHERE id = ${orgId}
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: orgId,
      entityType: "organization",
      entityId: orgId,
      action: `admin.organization_${parsed.data.status}`,
      beforeState: { status: String(existing[0].status) },
      afterState: { status: parsed.data.status },
      source: "admin",
    });

    return NextResponse.json({ ok: true, id: orgId, status: parsed.data.status });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
