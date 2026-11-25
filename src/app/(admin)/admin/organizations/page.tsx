import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { AdminOrgsClient } from "@/components/admin/admin-orgs-client";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  const session = await getServerSession();
  requirePermission(session, "organizations:manage");

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
      o.id,
      o.name,
      o.type,
      o.slug,
      o.status,
      o.contact_email,
      o.created_at,
      COUNT(DISTINCT m.user_id) FILTER (WHERE m.is_active = true)::int AS member_count
    FROM organizations o
    LEFT JOIN memberships m ON m.organization_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Organizations
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Organizations & Classification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage agency, operator, and advertiser organizations across the
          platform.
        </p>
      </div>

      <AdminOrgsClient
        initialOrgs={rows.map((o) => ({
          id: String(o.id),
          name: String(o.name),
          type: String(o.type) as "agency" | "operator" | "advertiser",
          slug: String(o.slug),
          status: String(o.status ?? "active"),
          contactEmail: o.contact_email ? String(o.contact_email) : null,
          memberCount: Number(o.member_count ?? 0),
          createdAt: String(o.created_at),
        }))}
      />
    </div>
  );
}
