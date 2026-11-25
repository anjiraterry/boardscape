import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { ProofUploadSchema } from "@/modules/campaigns/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, [
      "campaign_manager",
      "verifier_ops",
      "surveyor",
      "admin_finance",
    ]);
    const { id: campaignId } = await context.params;

    const body = await request.json();
    const parsed = ProofUploadSchema.safeParse({ ...body, campaignId });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid proof payload", details: parsed.error.flatten() },
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
      INSERT INTO posting_proofs (
        campaign_id,
        face_id,
        storage_path,
        captured_at,
        latitude,
        longitude,
        submitted_by,
        issue_flag,
        review_status
      )
      VALUES (
        ${campaignId},
        ${parsed.data.faceId},
        ${parsed.data.storagePath},
        ${parsed.data.capturedAt},
        ${parsed.data.latitude ?? null},
        ${parsed.data.longitude ?? null},
        ${actor.userId},
        ${parsed.data.issueFlag ?? null},
        'pending'
      )
      RETURNING id
    `;

    const proofId = rows[0]?.id ? String(rows[0].id) : null;
    if (!proofId) {
      return NextResponse.json(
        { error: "Failed to submit posting proof" },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "posting_proof",
      entityId: proofId,
      action: "campaign.proof_submitted",
      afterState: { campaignId, faceId: parsed.data.faceId },
      source: "studio",
    });

    return NextResponse.json(
      { status: "pending_review", proofId },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
