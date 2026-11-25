import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { recordAuditEvent } from "@/modules/audit/service";

const UnpublishSchema = z.object({
  reason: z.string().min(3, "A reason is required to unpublish a listing."),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requirePermission(session, "inventory:review");
    const { id: faceId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = UnpublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Reason required" },
        { status: 400 }
      );
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, state, label FROM faces WHERE id = ${faceId} LIMIT 1
    `;
    const face = rows[0];
    if (!face) {
      return NextResponse.json({ error: "Face not found" }, { status: 404 });
    }

    await sql`
      UPDATE faces
      SET state = 'suspended', updated_at = NOW()
      WHERE id = ${faceId}
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "face",
      entityId: faceId,
      action: "admin.inventory_unpublished",
      beforeState: { state: String(face.state) },
      afterState: { state: "suspended", reason: parsed.data.reason },
      source: "admin",
    });

    return NextResponse.json({ ok: true, faceId, state: "suspended" });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
