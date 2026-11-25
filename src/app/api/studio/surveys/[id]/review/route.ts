import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { recordAuditEvent } from "@/modules/audit/service";

const ReviewSurveySchema = z.object({
  decision: z.enum(["marked_distinct", "merged_duplicate", "rejected"]),
  reviewReason: z.string().min(3),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, ["verifier_ops", "admin_finance"]);
    const { id: surveyId } = await context.params;

    const body = await request.json();
    const parsed = ReviewSurveySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review payload", details: parsed.error.flatten() },
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
      SELECT id, site_id, duplicate_review_status
      FROM surveys
      WHERE id = ${surveyId}
      LIMIT 1
    `;
    const survey = rows[0];

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    await sql`
      UPDATE surveys
      SET
        duplicate_review_status = ${parsed.data.decision},
        review_reason = ${parsed.data.reviewReason},
        reviewed_by = ${actor.userId},
        reviewed_at = NOW()
      WHERE id = ${surveyId}
    `;

    if (parsed.data.decision === "marked_distinct" && survey.site_id) {
      await sql`
        UPDATE faces
        SET state = 'awaiting_operator', updated_at = NOW()
        WHERE site_id = ${String(survey.site_id)}
          AND state = 'surveyed'
      `;
    }

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "survey",
      entityId: surveyId,
      action: `survey.${parsed.data.decision}`,
      beforeState: {
        duplicate_review_status: String(survey.duplicate_review_status),
      },
      afterState: {
        duplicate_review_status: parsed.data.decision,
        reviewReason: parsed.data.reviewReason,
      },
      source: "studio",
    });

    return NextResponse.json({ status: parsed.data.decision, surveyId });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
