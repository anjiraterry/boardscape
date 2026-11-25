import { getServerSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Operator Quote Requests — boardscape" };

export default async function OperatorRequestsPage() {
  const session = await getServerSession();
  const requests =
    session && isDatabaseConfigured() && session.activeOrganizationId
      ? await getSql()`
          SELECT
            qr.id,
            qr.flight_start,
            qr.flight_end,
            qr.status,
            f.label AS face_label
          FROM quote_requests qr
          LEFT JOIN faces f ON f.id = qr.face_id
          WHERE qr.operator_org_id = ${session.activeOrganizationId}
          ORDER BY qr.created_at DESC
        `
      : [];

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-8">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Availability &amp; Rate Requests
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Confirm rates and flight dates for boardscape client enquiries.
          </p>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending quote requests for your organization.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {requests.map((r) => (
                <li
                  key={String(r.id)}
                  className="flex items-center justify-between py-3"
                >
                  <span className="font-medium text-charcoal">
                    {String(r.face_label ?? "Face")} ({String(r.flight_start)} →{" "}
                    {String(r.flight_end)})
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(r.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
