import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const session = await getServerSession();
  requirePermission(session, "campaigns:view");

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const [campaigns, exceptionalBookings] = await Promise.all([
    sql`
      SELECT
        c.id,
        c.title,
        c.status,
        c.start_date,
        c.end_date,
        c.created_at,
        o.name AS client_org_name,
        (SELECT COUNT(*)::int FROM campaign_items ci WHERE ci.campaign_id = c.id) AS face_count,
        (SELECT COUNT(*)::int FROM bookings b INNER JOIN quotes q ON q.id = b.quote_id WHERE q.lead_id = c.lead_id) AS booking_count
      FROM campaigns c
      INNER JOIN organizations o ON o.id = c.client_org_id
      ORDER BY c.created_at DESC
      LIMIT 50
    `,
    sql`
      SELECT
        b.id,
        b.status,
        b.created_at,
        f.label AS face_label,
        s.title AS site_title,
        op.name AS operator_name
      FROM bookings b
      INNER JOIN faces f ON f.id = b.face_id
      INNER JOIN sites s ON s.id = f.site_id
      INNER JOIN organizations op ON op.id = b.operator_org_id
      WHERE b.status IN ('declined', 'cancelled', 'expired')
      ORDER BY b.created_at DESC
      LIMIT 20
    `,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Campaign Oversight
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
            Campaigns & Booking Exceptions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-organization visibility into campaign execution, booking
            history, and exceptional workflows.
          </p>
        </div>
        <Link
          href="/studio/campaigns"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-charcoal hover:bg-secondary"
        >
          Escalate in Studio Ops
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Client Organization</th>
                <th className="px-4 py-3 font-medium">Flight Dates</th>
                <th className="px-4 py-3 font-medium">Faces / Bookings</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No campaigns recorded yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={String(c.id)} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {String(c.title)}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal">
                      {String(c.client_org_name)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {String(c.start_date)} to {String(c.end_date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal">
                      {Number(c.face_count ?? 0)} faces ·{" "}
                      {Number(c.booking_count ?? 0)} bookings
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded bg-secondary px-2 py-0.5 font-medium text-charcoal">
                        {String(c.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-charcoal">
            Declined, Cancelled, or Expired Bookings
          </h2>
        </div>
        {exceptionalBookings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No declined, cancelled, or expired bookings.
          </p>
        ) : (
          <ul className="divide-y divide-border text-xs">
            {exceptionalBookings.map((b) => (
              <li
                key={String(b.id)}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium text-charcoal">
                    {String(b.site_title)} — {String(b.face_label)}
                  </p>
                  <p className="text-muted-foreground">
                    Operator: {String(b.operator_name)}
                  </p>
                </div>
                <span className="rounded bg-destructive/15 px-2 py-0.5 font-medium text-destructive">
                  {String(b.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
