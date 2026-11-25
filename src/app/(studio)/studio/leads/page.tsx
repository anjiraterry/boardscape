import { Badge } from "@/components/ui/badge";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "CRM & Leads — boardscape Studio" };

export default async function StudioLeadsPage() {
  const leads = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, company_name, contact_name, contact_email, source, status, created_at
        FROM leads
        ORDER BY created_at DESC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Client &amp; Lead CRM
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Incoming campaign briefs from the corporate website and boardscape
          Atlas shortlists (FR-015).
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Source</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No leads in pipeline yet. Submissions from /brief appear here.
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={String(l.id)}>
                  <td className="p-4 font-medium">{String(l.company_name)}</td>
                  <td className="p-4">
                    {String(l.contact_name)} ({String(l.contact_email)})
                  </td>
                  <td className="p-4 font-mono text-xs">{String(l.source)}</td>
                  <td className="p-4">
                    <Badge variant="outline">{String(l.status)}</Badge>
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
