import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PublicBriefSubmissionSchema } from "@/modules/crm/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`brief:${ip}`, 8, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait before trying again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = PublicBriefSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (!isDatabaseConfigured()) {
    logger.warn("Brief submitted while Neon DATABASE_URL is unconfigured", {
      companyName: data.companyName,
      source: data.source,
    });
    return NextResponse.json(
      {
        status: "received_unpersisted",
        message:
          "Neon database is not configured in this environment. Request validated locally; set DATABASE_URL in .env.local to persist to CRM.",
      },
      { status: 202 }
    );
  }

  try {
    const sql = getSql();
    const notes = data.budgetRange ? `Budget range: ${data.budgetRange}` : null;

    const leadRows = await sql`
      INSERT INTO leads (
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        source,
        status,
        notes
      )
      VALUES (
        ${data.companyName},
        ${data.contactName},
        ${data.contactEmail},
        ${data.contactPhone || null},
        ${data.source},
        'new',
        ${notes}
      )
      RETURNING id
    `;

    const leadId = leadRows[0]?.id ? String(leadRows[0].id) : null;
    if (!leadId) {
      return NextResponse.json({ error: "Failed to record brief" }, { status: 500 });
    }

    const briefRows = await sql`
      INSERT INTO campaign_briefs (
        lead_id,
        objective,
        target_districts,
        preferred_formats,
        start_date,
        end_date,
        creative_needed,
        consent_to_contact,
        source_face_ids
      )
      VALUES (
        ${leadId},
        ${data.objective},
        ${data.targetDistricts},
        ${data.preferredFormats},
        ${data.startDate || null},
        ${data.endDate || null},
        ${data.creativeNeeded},
        ${data.consentToContact},
        ${data.sourceFaceIds}
      )
      RETURNING id
    `;

    const briefId = briefRows[0]?.id ? String(briefRows[0].id) : null;
    if (!briefId) {
      return NextResponse.json({ error: "Failed to record campaign brief" }, { status: 500 });
    }

    await recordAuditEvent({
      actorId: null,
      organizationId: null,
      entityType: "lead",
      entityId: leadId,
      action: "lead.brief_created",
      afterState: { briefId, source: data.source },
      source: "public_api",
    });

    return NextResponse.json(
      {
        status: "created",
        leadId,
        briefId,
        message: "Campaign brief received. Note: This is an enquiry, not a confirmed booking.",
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("Failed to record campaign brief", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to record brief" }, { status: 500 });
  }
}
