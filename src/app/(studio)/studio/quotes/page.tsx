import { Badge } from "@/components/ui/badge";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { formatNgnFromKobo } from "@/lib/money";

export const metadata = { title: "Quotes & Bookings — boardscape Studio" };

export default async function StudioQuotesPage() {
  const proposals = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, title, version, status, total_minor, valid_until
        FROM proposals
        ORDER BY created_at DESC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Quotations, Proposals &amp; Bookings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Client acceptance never implies supplier confirmation. Bookings require
          both approvals and exclusive date-overlap checks (FR-016–FR-018).
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Proposal</th>
              <th className="p-4 font-medium">Version</th>
              <th className="p-4 font-medium">Total (NGN)</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No proposals created yet.
                </td>
              </tr>
            ) : (
              proposals.map((p) => (
                <tr key={String(p.id)}>
                  <td className="p-4 font-medium">{String(p.title)}</td>
                  <td className="p-4 font-mono">v{String(p.version)}</td>
                  <td className="p-4 font-mono">
                    {formatNgnFromKobo(Number(p.total_minor))}
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{String(p.status)}</Badge>
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
