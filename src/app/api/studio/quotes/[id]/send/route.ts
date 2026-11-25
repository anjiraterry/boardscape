import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { canTransitionQuoteStatus } from "@/modules/quotes/state-machine";
import type { QuoteStatus } from "@/modules/quotes/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, [
      "sales_account_manager",
      "media_planner",
      "admin_finance",
    ]);
    const { id: proposalId } = await context.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, status, version, valid_until
      FROM proposals
      WHERE id = ${proposalId}
      LIMIT 1
    `;
    const proposal = rows[0];

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const check = canTransitionQuoteStatus(
      proposal.status as QuoteStatus,
      "sent_to_client"
    );
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 409 });
    }

    const sentAt = new Date().toISOString();
    await sql`
      UPDATE proposals
      SET status = 'sent_to_client', sent_at = ${sentAt}
      WHERE id = ${proposalId}
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "proposal",
      entityId: proposalId,
      action: "proposal.sent",
      beforeState: { status: String(proposal.status) },
      afterState: {
        status: "sent_to_client",
        version: proposal.version,
        sentAt,
      },
      source: "studio",
    });

    return NextResponse.json({ status: "sent_to_client", proposalId, sentAt });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
