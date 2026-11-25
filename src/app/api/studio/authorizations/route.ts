import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { ListingAuthorizationSchema } from "@/modules/operators/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, ["verifier_ops", "admin_finance"]);

    const body = await request.json();
    const parsed = ListingAuthorizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid authorization payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const sql = getSql();
    const rows = await sql`
      INSERT INTO listing_authorizations (
        face_id,
        operator_org_id,
        grant_type,
        marketing_scope,
        evidence_path,
        expires_at,
        verified_by,
        is_active
      )
      VALUES (
        ${parsed.data.faceId},
        ${parsed.data.operatorOrgId},
        ${parsed.data.grantType},
        ${parsed.data.marketingScope},
        ${parsed.data.evidencePath},
        ${parsed.data.expiresAt ?? null},
        ${actor.userId},
        true
      )
      RETURNING id
    `;

    const authorizationId = rows[0]?.id ? String(rows[0].id) : null;
    if (!authorizationId) {
      return NextResponse.json(
        { error: "Failed to record authorization" },
        { status: 500 }
      );
    }

    await sql`
      UPDATE faces
      SET
        state = 'verified_private',
        last_confirmed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${parsed.data.faceId}
        AND state IN ('surveyed', 'awaiting_operator')
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "listing_authorization",
      entityId: authorizationId,
      action: "inventory.operator_authorized",
      afterState: {
        faceId: parsed.data.faceId,
        operatorOrgId: parsed.data.operatorOrgId,
        grantType: parsed.data.grantType,
      },
      source: "studio",
    });

    return NextResponse.json(
      { status: "authorized", authorizationId },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
