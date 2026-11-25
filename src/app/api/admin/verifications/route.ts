import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { recordAuditEvent } from "@/modules/audit/service";

const VerificationActionSchema = z
  .object({
    entityType: z.enum(["survey", "listing_authorization", "permit_record"]),
    id: z.string().uuid(),
    decision: z.enum(["approve", "reject"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => data.decision === "approve" || (data.reason && data.reason.length >= 3),
    { message: "A rejection reason (at least 3 characters) is required." }
  );

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requirePermission(session, "listings:approve");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = VerificationActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid verification payload" },
        { status: 400 }
      );
    }

    const { entityType, id, decision, reason } = parsed.data;
    const sql = getSql();

    if (entityType === "survey") {
      const nextStatus = decision === "approve" ? "approved" : "rejected";
      const rows = await sql`
        SELECT id, duplicate_review_status FROM surveys WHERE id = ${id} LIMIT 1
      `;
      if (!rows[0]) {
        return NextResponse.json({ error: "Survey not found" }, { status: 404 });
      }
      await sql`
        UPDATE surveys
        SET duplicate_review_status = ${nextStatus},
            review_reason = ${reason ?? null},
            reviewed_by = ${actor.userId},
            reviewed_at = NOW()
        WHERE id = ${id}
      `;
      await recordAuditEvent({
        actorId: actor.userId,
        organizationId: actor.activeOrganizationId,
        entityType: "survey",
        entityId: id,
        action: `admin.survey_${nextStatus}`,
        beforeState: { duplicate_review_status: String(rows[0].duplicate_review_status) },
        afterState: { duplicate_review_status: nextStatus, reason: reason ?? null },
        source: "admin",
      });
      return NextResponse.json({ ok: true, id, status: nextStatus });
    }

    if (entityType === "listing_authorization") {
      const nextStatus = decision === "approve" ? "approved" : "rejected";
      const nextActive = decision === "approve";
      const rows = await sql`
        SELECT id, review_status, is_active FROM listing_authorizations WHERE id = ${id} LIMIT 1
      `;
      if (!rows[0]) {
        return NextResponse.json({ error: "Authorization not found" }, { status: 404 });
      }
      await sql`
        UPDATE listing_authorizations
        SET review_status = ${nextStatus},
            rejection_reason = ${decision === "reject" ? (reason ?? null) : null},
            verified_by = ${actor.userId},
            reviewed_at = NOW(),
            is_active = ${nextActive}
        WHERE id = ${id}
      `;
      await recordAuditEvent({
        actorId: actor.userId,
        organizationId: actor.activeOrganizationId,
        entityType: "listing_authorization",
        entityId: id,
        action: `admin.authorization_${nextStatus}`,
        beforeState: {
          review_status: String(rows[0].review_status),
          is_active: Boolean(rows[0].is_active),
        },
        afterState: {
          review_status: nextStatus,
          is_active: nextActive,
          reason: reason ?? null,
        },
        source: "admin",
      });
      return NextResponse.json({ ok: true, id, status: nextStatus });
    }

    const nextPermitStatus = decision === "approve" ? "verified" : "rejected";
    const rows = await sql`
      SELECT id, review_status FROM permit_records WHERE id = ${id} LIMIT 1
    `;
    if (!rows[0]) {
      return NextResponse.json({ error: "Compliance record not found" }, { status: 404 });
    }
    await sql`
      UPDATE permit_records
      SET review_status = ${nextPermitStatus},
          rejection_reason = ${decision === "reject" ? (reason ?? null) : null},
          reviewed_by = ${actor.userId},
          reviewed_at = NOW()
      WHERE id = ${id}
    `;
    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "permit_record",
      entityId: id,
      action: `admin.permit_${nextPermitStatus}`,
      beforeState: { review_status: String(rows[0].review_status) },
      afterState: { review_status: nextPermitStatus, reason: reason ?? null },
      source: "admin",
    });

    return NextResponse.json({ ok: true, id, status: nextPermitStatus });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
