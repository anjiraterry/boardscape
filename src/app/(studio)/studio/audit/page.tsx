import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Audit Log — boardscape Studio" };

export default async function StudioAuditPage() {
  const events = isDatabaseConfigured()
    ? await getSql()`
        SELECT id, entity_type, entity_id, action, source, created_at
        FROM audit_events
        ORDER BY created_at DESC
        LIMIT 100
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Audit Log
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Immutable trail of inventory publication, commercial approvals,
          bookings, and proof reviews (FR-026).
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Time</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Entity</th>
              <th className="p-4 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono text-xs">
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center font-sans text-sm text-muted-foreground"
                >
                  No audit events recorded yet.
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={String(ev.id)}>
                  <td className="p-4">
                    {new Date(String(ev.created_at)).toLocaleString("en-NG")}
                  </td>
                  <td className="p-4">{String(ev.action)}</td>
                  <td className="p-4">
                    {String(ev.entity_type)} ({String(ev.entity_id).slice(0, 8)}
                    …)
                  </td>
                  <td className="p-4">{String(ev.source)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
