import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "password_hash",
  "token",
  "secret",
  "auth_secret",
  "cookie",
  "session",
]);

function sanitizeAuditState(value: unknown): string {
  if (!value || typeof value !== "object") return "—";
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([k]) => !REDACTED_KEYS.has(k.toLowerCase())
  );
  if (entries.length === 0) return "—";
  return JSON.stringify(Object.fromEntries(entries));
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>;
}) {
  const session = await getServerSession();
  requirePermission(session, "audit:view");
  const { q = "", source = "" } = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const rows = await sql`
    SELECT
      a.id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.before_state,
      a.after_state,
      a.source,
      a.created_at,
      p.full_name AS actor_name,
      p.email AS actor_email,
      o.name AS organization_name
    FROM audit_events a
    LEFT JOIN profiles p ON p.id = a.actor_id
    LEFT JOIN organizations o ON o.id = a.organization_id
    WHERE (${q.trim()} = '' OR a.action ILIKE ${"%" + q.trim() + "%"} OR a.entity_type ILIKE ${"%" + q.trim() + "%"} OR COALESCE(p.email, '') ILIKE ${"%" + q.trim() + "%"})
      AND (${source.trim()} = '' OR a.source = ${source.trim()})
    ORDER BY a.created_at DESC
    LIMIT 100
  `;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Immutable Audit Trail
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Administrative & System Audit Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Append-only record of sensitive actions. Secrets, passwords, and
          session tokens are never stored or displayed.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search action, entity, or actor email..."
          className="h-9 w-full sm:w-72 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          name="source"
          defaultValue={source}
          aria-label="Filter by source"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Sources</option>
          <option value="admin">Admin</option>
          <option value="studio">Studio</option>
          <option value="field">Field</option>
          <option value="api">API</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-charcoal px-4 text-xs font-semibold text-white hover:bg-charcoal/90"
        >
          Filter
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Actor & Org</th>
                <th className="px-4 py-3 font-medium">Action & Resource</th>
                <th className="px-4 py-3 font-medium">State Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No audit events match your search.
                  </td>
                </tr>
              ) : (
                rows.map((ev) => (
                  <tr key={String(ev.id)} className="align-top hover:bg-secondary/20">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(String(ev.created_at)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">
                        {ev.actor_name ? String(ev.actor_name) : "System"}
                      </p>
                      <p className="text-muted-foreground">
                        {ev.actor_email ? String(ev.actor_email) : "—"}
                        {ev.organization_name
                          ? ` · ${String(ev.organization_name)}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-charcoal">
                        {String(ev.action)}
                      </p>
                      <p className="text-muted-foreground">
                        {String(ev.entity_type)} · {String(ev.entity_id).slice(0, 12)} ·{" "}
                        {String(ev.source)}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground max-w-md break-all">
                      {sanitizeAuditState(ev.after_state)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
