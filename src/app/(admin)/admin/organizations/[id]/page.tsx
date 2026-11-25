import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { ROLE_METADATA, type AppRole } from "@/modules/identity/schemas";
import { AdminOrgStatusToggle } from "@/components/admin/admin-org-status-toggle";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  requirePermission(session, "organizations:manage");
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const [orgRows, memberRows, inventoryRows, campaignRows] = await Promise.all([
    sql`
      SELECT id, name, type, slug, status, contact_email, contact_phone, created_at
      FROM organizations
      WHERE id = ${id}
      LIMIT 1
    `,
    sql`
      SELECT p.id, p.full_name, p.email, p.status, m.role, m.is_active
      FROM memberships m
      INNER JOIN profiles p ON p.id = m.user_id
      WHERE m.organization_id = ${id}
      ORDER BY m.is_active DESC, p.full_name ASC
    `,
    sql`
      SELECT DISTINCT f.id, f.label, f.state, s.corridor, s.title AS site_title
      FROM listing_authorizations la
      INNER JOIN faces f ON f.id = la.face_id
      INNER JOIN sites s ON s.id = f.site_id
      WHERE la.operator_org_id = ${id}
      ORDER BY f.label ASC
      LIMIT 25
    `,
    sql`
      SELECT id, title, status, start_date, end_date
      FROM campaigns
      WHERE client_org_id = ${id}
      ORDER BY created_at DESC
      LIMIT 25
    `,
  ]);

  const org = orgRows[0];
  if (!org) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/organizations"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Organizations
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {String(org.type)} · {String(org.slug)}
            </p>
            <h1 className="mt-1 text-xl font-bold text-charcoal">
              {String(org.name)}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {org.contact_email ? String(org.contact_email) : "No contact email"}{" "}
              {org.contact_phone ? `· ${String(org.contact_phone)}` : ""}
            </p>
          </div>
          <AdminOrgStatusToggle
            orgId={String(org.id)}
            orgType={String(org.type)}
            currentStatus={String(org.status ?? "active")}
          />
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-3">
          Memberships ({memberRows.length})
        </h2>
        {memberRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members assigned to this organization.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Account Status</th>
                  <th className="py-2 font-medium text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {memberRows.map((m) => {
                  const roleKey = String(m.role) as AppRole;
                  return (
                    <tr key={String(m.id)}>
                      <td className="py-2 pr-4">
                        <p className="font-medium text-charcoal">
                          {String(m.full_name)}
                        </p>
                        <p className="text-muted-foreground">{String(m.email)}</p>
                      </td>
                      <td className="py-2 pr-4">
                        {ROLE_METADATA[roleKey]?.label ?? roleKey}
                      </td>
                      <td className="py-2 pr-4">{String(m.status)}</td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/users/${String(m.id)}`}
                          className="font-semibold text-charcoal hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-charcoal mb-3">
            Authorized Inventory ({inventoryRows.length})
          </h2>
          {inventoryRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No authorized faces linked to this organization.
            </p>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {inventoryRows.map((face) => (
                <li
                  key={String(face.id)}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium text-charcoal">
                      {String(face.site_title)} — {String(face.label)}
                    </p>
                    <p className="text-muted-foreground">{String(face.corridor)}</p>
                  </div>
                  <span className="rounded bg-secondary px-2 py-0.5 font-medium text-charcoal">
                    {String(face.state)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-charcoal mb-3">
            Associated Campaigns ({campaignRows.length})
          </h2>
          {campaignRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No campaigns for this organization.
            </p>
          ) : (
            <ul className="divide-y divide-border text-xs">
              {campaignRows.map((c) => (
                <li
                  key={String(c.id)}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium text-charcoal">{String(c.title)}</p>
                    <p className="text-muted-foreground">
                      {String(c.start_date)} to {String(c.end_date)}
                    </p>
                  </div>
                  <span className="rounded bg-secondary px-2 py-0.5 font-medium text-charcoal">
                    {String(c.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
