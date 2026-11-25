import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getDatabaseUrl, isDatabaseConfigured } from "@/lib/env";
import { ConfirmBookingInputSchema } from "@/modules/bookings/schemas";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, [
      "verifier_ops",
      "campaign_manager",
      "admin_finance",
    ]);

    const body = await request.json();
    const parsed = ConfirmBookingInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const input = parsed.data;
    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      // Serialize concurrent booking checks per faceId using a transaction-scoped advisory lock
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        input.faceId,
      ]);

      if (input.isExclusive) {
        const overlapRes = await client.query(
          `SELECT 1
           FROM bookings
           WHERE face_id = $1
             AND is_exclusive = true
             AND status = 'confirmed'
             AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
           LIMIT 1`,
          [input.faceId, input.startDate, input.endDate]
        );

        if (overlapRes.rows.length > 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Exclusive booking date overlap detected for this face." },
            { status: 409 }
          );
        }
      }

      const insertRes = await client.query(
        `INSERT INTO bookings (
           proposal_id,
           proposal_line_id,
           face_id,
           client_org_id,
           operator_org_id,
           start_date,
           end_date,
           is_exclusive,
           client_accepted_at,
           supplier_confirmed_at,
           supplier_confirmed_by,
           confirmed_by_staff,
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'confirmed')
         RETURNING id`,
        [
          input.proposalId,
          input.proposalLineId,
          input.faceId,
          input.clientOrgId,
          input.operatorOrgId,
          input.startDate,
          input.endDate,
          input.isExclusive,
          input.clientAcceptedAt,
          input.supplierConfirmedAt,
          input.supplierConfirmedBy,
          actor.userId,
        ]
      );

      await client.query("COMMIT");
      const bookingId = String(insertRes.rows[0].id);

      await recordAuditEvent({
        actorId: actor.userId,
        organizationId: actor.activeOrganizationId,
        entityType: "booking",
        entityId: bookingId,
        action: "campaign.booked",
        afterState: {
          faceId: input.faceId,
          startDate: input.startDate,
          endDate: input.endDate,
          supplierConfirmedBy: input.supplierConfirmedBy,
        },
        source: "studio",
      });

      return NextResponse.json(
        { status: "confirmed", bookingId },
        { status: 201 }
      );
    } catch {
      await client.query("ROLLBACK").catch(() => {});
      return NextResponse.json(
        { error: "Failed to record booking" },
        { status: 500 }
      );
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
