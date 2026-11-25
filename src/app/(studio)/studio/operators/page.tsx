import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Operators — boardscape Studio" };

export default async function StudioOperatorsPage() {
  const operators = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, legal_name, primary_contact_name, primary_contact_phone, primary_contact_email
        FROM operators
        ORDER BY legal_name ASC
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Media Owners &amp; Operators
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private operator contacts and listing authorizations. Never exposed on
          public Atlas listings.
        </p>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        {operators.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No operator organizations registered yet.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {operators.map((op) => (
              <li
                key={String(op.id)}
                className="flex items-center justify-between py-3"
              >
                <span className="font-medium text-charcoal">
                  {String(op.legal_name)}
                </span>
                <span className="text-muted-foreground">
                  {String(op.primary_contact_name ?? "")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
