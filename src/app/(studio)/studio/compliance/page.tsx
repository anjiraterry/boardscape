import { Badge } from "@/components/ui/badge";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { COMPLIANCE_DISCLAIMER } from "@/modules/compliance/schemas";

export const metadata = { title: "Compliance Register — boardscape Studio" };

export default async function StudioCompliancePage() {
  const permits = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, claimed_authority, issuer, reference_number, expires_at, review_status
        FROM permit_records
        ORDER BY expires_at ASC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Compliance Evidence Register
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {COMPLIANCE_DISCLAIMER}
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Claimed Authority</th>
              <th className="p-4 font-medium">Issuer</th>
              <th className="p-4 font-medium">Reference</th>
              <th className="p-4 font-medium">Expiry</th>
              <th className="p-4 font-medium">Internal Review Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {permits.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No operator permit or vetting records uploaded yet.
                </td>
              </tr>
            ) : (
              permits.map((r) => (
                <tr key={String(r.id)}>
                  <td className="p-4 font-medium">
                    {String(r.claimed_authority)}
                  </td>
                  <td className="p-4">{String(r.issuer)}</td>
                  <td className="p-4 font-mono text-xs">
                    {String(r.reference_number ?? "—")}
                  </td>
                  <td className="p-4">{String(r.expires_at ?? "—")}</td>
                  <td className="p-4">
                    <Badge variant="warning">{String(r.review_status)}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
