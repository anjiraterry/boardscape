import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { canTransitionFaceState } from "@/modules/inventory/state-machine";
import type { FaceState } from "@/modules/inventory/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, ["verifier_ops", "admin_finance"]);
    const { id: faceId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      reviewNotes?: string;
    };
    const sql = getSql();

    const faceRows = await sql`
      SELECT id, state
      FROM faces
      WHERE id = ${faceId}
      LIMIT 1
    `;
    const face = faceRows[0];

    if (!face) {
      return NextResponse.json({ error: "Face not found" }, { status: 404 });
    }

    const authRows = await sql`
      SELECT id, expires_at
      FROM listing_authorizations
      WHERE face_id = ${faceId}
        AND is_active = true
    `;

    const hasActiveAuth = authRows.some(
      (a) => !a.expires_at || Date.parse(String(a.expires_at)) > Date.now()
    );

    const transition = canTransitionFaceState(
      face.state as FaceState,
      "published",
      {
        hasActiveOperatorAuthorization: hasActiveAuth,
        hasReviewerSignOff: Boolean(
          body.reviewNotes && body.reviewNotes.trim().length >= 3
        ),
      }
    );

    if (!transition.allowed) {
      return NextResponse.json({ error: transition.reason }, { status: 409 });
    }

    await sql`
      UPDATE faces
      SET
        state = 'published',
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = ${faceId}
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "face",
      entityId: faceId,
      action: "inventory.face_published",
      beforeState: { state: String(face.state) },
      afterState: { state: "published", reviewNotes: body.reviewNotes },
      source: "studio",
    });

    return NextResponse.json({ status: "published", faceId });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
