import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { formatNgnFromKobo } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Client Portal — boardscape" };

export default async function ClientPortalPage() {
  const session = await getServerSession();

  if (!session) {
    return (
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-5">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Client Portal
          </h1>
          <p className="max-w-xl font-sans text-base leading-relaxed text-muted-foreground">
            Sign in with your client organization account to review proposals,
            approve versions, and inspect campaign proof-of-posting reports.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/brief"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
            >
              Submit a Campaign Brief
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!isDatabaseConfigured() || !session.activeOrganizationId) {
    return (
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="font-display text-3xl font-black text-charcoal">
            Client Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No active organization membership found for {session.email}.
          </p>
        </div>
      </section>
    );
  }

  const sql = getSql();
  const [proposals, campaigns] = await Promise.all([
    sql`
      SELECT id, title, version, status, total_minor, valid_until
      FROM proposals
      WHERE client_org_id = ${session.activeOrganizationId}
      ORDER BY created_at DESC
    `,
    sql`
      SELECT id, name, status, start_date, end_date
      FROM campaigns
      WHERE client_org_id = ${session.activeOrganizationId}
      ORDER BY created_at DESC
    `,
  ]);

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-10">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Proposals &amp; Campaigns
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="font-sans text-xl font-semibold text-charcoal">
            Proposals
          </h2>
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No proposals issued yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {proposals.map((p) => (
                <div
                  key={String(p.id)}
                  className="space-y-2 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      v{String(p.version)}
                    </span>
                    <Badge variant="outline">{String(p.status)}</Badge>
                  </div>
                  <p className="font-sans text-base font-semibold text-charcoal">
                    {String(p.title)}
                  </p>
                  <p className="font-mono text-sm">
                    {formatNgnFromKobo(Number(p.total_minor))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-sans text-xl font-semibold text-charcoal">
            Campaigns
          </h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active campaigns yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {campaigns.map((c) => (
                <div
                  key={String(c.id)}
                  className="space-y-2 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-base font-semibold text-charcoal">
                      {String(c.name)}
                    </p>
                    <Badge variant="secondary">{String(c.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {String(c.start_date)} → {String(c.end_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
