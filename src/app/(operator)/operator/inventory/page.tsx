import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Operator Inventory — boardscape" };

export default async function OperatorInventoryPage() {
  const session = await getServerSession();

  if (!session) {
    return (
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-5">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            Operator Workspace
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Sign in with your media-owner organization account to view
            authorized inventory and respond to boardscape quote requests.
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
              href="/operator/requests"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
            >
              View Quote Requests
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const faces =
    isDatabaseConfigured() && session.activeOrganizationId
      ? await getSql()`
          SELECT
            la.id,
            la.grant_type,
            la.is_active,
            f.id AS face_id,
            f.label,
            f.format,
            f.state
          FROM listing_authorizations la
          LEFT JOIN faces f ON f.id = la.face_id
          WHERE la.operator_org_id = ${session.activeOrganizationId}
        `
      : [];

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Authorized Inventory
            </h1>
          </div>
          <Link
            href="/operator/requests"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-charcoal px-4 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
          >
            Quote Requests
            <ArrowRight className="h-4 w-4 text-limebrand" />
          </Link>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm">
          {faces.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No authorized faces linked to your organization yet.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {faces.map((row) => (
                <li
                  key={String(row.id)}
                  className="flex items-center justify-between py-3"
                >
                  <span className="font-medium text-charcoal">
                    {String(row.label ?? "Face")}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(row.state ?? "")}
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
