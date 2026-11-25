import { Badge } from "@/components/ui/badge";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Campaigns — boardscape Studio" };

export default async function StudioCampaignsPage() {
  const campaigns = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, name, status, start_date, end_date
        FROM campaigns
        ORDER BY created_at DESC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Campaign Operations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage creative approval checklists, production tasks, geotagged
          proof-of-posting, and client reports (FR-020–FR-023).
        </p>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active campaigns yet.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {campaigns.map((c) => (
              <li
                key={String(c.id)}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium text-charcoal">{String(c.name)}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(c.start_date)} → {String(c.end_date)}
                  </p>
                </div>
                <Badge variant="outline">{String(c.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
