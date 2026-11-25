import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import {
  AuthorizationError,
  requireAuthenticated,
  requireOrgAccess,
} from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthenticated(await getServerSession());
    const { id: campaignId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const sql = getSql();
    const campaignRows = await sql`
      SELECT id, name, client_org_id, status, start_date, end_date
      FROM campaigns
      WHERE id = ${campaignId}
      LIMIT 1
    `;
    const campaign = campaignRows[0];

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    requireOrgAccess(session, String(campaign.client_org_id), true);

    const approvedProofs = await sql`
      SELECT id, face_id, captured_at, latitude, longitude, issue_flag, review_status
      FROM posting_proofs
      WHERE campaign_id = ${campaignId}
        AND review_status = 'approved'
    `;

    return NextResponse.json({
      campaign,
      approvedProofs,
      dataLimitations:
        "Observed installation proofs and operator-confirmed flights only. Audience reach and impressions are not claimed as boardscape-verified.",
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
