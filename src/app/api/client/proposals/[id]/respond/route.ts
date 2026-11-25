import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import {
  AuthorizationError,
  requireAuthenticated,
  requireOrgAccess,
} from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { canTransitionQuoteStatus } from "@/modules/quotes/state-machine";
import type { QuoteStatus } from "@/modules/quotes/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

const RespondProposalSchema = z.object({
  decision: z.enum(["client_accepted", "revision_requested"]),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthenticated(await getServerSession());
    const { id: proposalId } = await context.params;

    const body = await request.json();
    const parsed = RespondProposalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid response payload" },
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
      SELECT id, client_org_id, status, version
      FROM proposals
      WHERE id = ${proposalId}
      LIMIT 1
    `;
    const proposal = rows[0];

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const clientOrgId = String(proposal.client_org_id);
    requireOrgAccess(session, clientOrgId, false);

    const transition = canTransitionQuoteStatus(
      proposal.status as QuoteStatus,
      parsed.data.decision
    );
    if (!transition.allowed) {
      return NextResponse.json({ error: transition.reason }, { status: 409 });
    }

    if (parsed.data.decision === "client_accepted") {
      await sql`
        UPDATE proposals
        SET
          status = 'client_accepted',
          accepted_at = NOW(),
          accepted_by = ${session.userId}
        WHERE id = ${proposalId}
      `;
    } else {
      await sql`
        UPDATE proposals
        SET status = 'revision_requested'
        WHERE id = ${proposalId}
      `;
    }

    await recordAuditEvent({
      actorId: session.userId,
      organizationId: clientOrgId,
      entityType: "proposal",
      entityId: proposalId,
      action:
        parsed.data.decision === "client_accepted"
          ? "proposal.accepted"
          : "proposal.revision_requested",
      beforeState: { status: String(proposal.status) },
      afterState: { status: parsed.data.decision, version: proposal.version },
      source: "client_portal",
    });

    return NextResponse.json({
      status: parsed.data.decision,
      proposalId,
      note: "Client acceptance does not reserve inventory until supplier confirmation is recorded.",
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
