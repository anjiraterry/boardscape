import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { canAssignRole, hasPermission } from "@/modules/identity/policies";
import { ROLE_METADATA, type AppRole } from "@/modules/identity/schemas";
import { AdminUserDetailClient } from "@/components/admin/admin-user-detail-client";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  const actor = requirePermission(session, "users:manage");
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const [userRows, membershipRows, orgRows, activityRows] = await Promise.all([
    sql`
      SELECT id, email, full_name, status, suspended_at, suspended_reason, last_login_at, created_at
      FROM profiles
      WHERE id = ${id}
      LIMIT 1
    `,
    sql`
      SELECT m.id, m.role, m.is_active, m.organization_id, o.name AS organization_name, o.type AS organization_type
      FROM memberships m
      INNER JOIN organizations o ON o.id = m.organization_id
      WHERE m.user_id = ${id}
      ORDER BY m.is_active DESC, m.created_at DESC
    `,
    sql`
      SELECT id, name, type FROM organizations WHERE status = 'active' ORDER BY name ASC
    `,
    sql`
      SELECT id, action, entity_type, entity_id, created_at
      FROM audit_events
      WHERE actor_id = ${id} OR entity_id = ${id}
      ORDER BY created_at DESC
      LIMIT 15
    `,
  ]);

  const user = userRows[0];
  if (!user) {
    notFound();
  }

  const activeMembership = membershipRows.find((m) => Boolean(m.is_active));
  const allRoles = Object.keys(ROLE_METADATA) as AppRole[];
  const assignableRoles = allRoles.filter((r) => canAssignRole(actor, r).allowed);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-charcoal"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Users
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-charcoal">
              {String(user.full_name)}
            </h1>
            <p className="text-sm text-muted-foreground">{String(user.email)}</p>
          </div>
          <span
            className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${
              String(user.status) === "active"
                ? "bg-limebrand/25 text-charcoal"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {String(user.status)}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="mt-0.5 font-medium text-charcoal">
              {new Date(String(user.created_at)).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last Login</dt>
            <dd className="mt-0.5 font-medium text-charcoal">
              {user.last_login_at
                ? new Date(String(user.last_login_at)).toLocaleString()
                : "Never"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Suspension Reason</dt>
            <dd className="mt-0.5 font-medium text-charcoal">
              {user.suspended_reason ? String(user.suspended_reason) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <AdminUserDetailClient
        userId={String(user.id)}
        currentStatus={String(user.status)}
        currentRole={
          activeMembership ? (String(activeMembership.role) as AppRole) : null
        }
        currentOrgId={
          activeMembership ? String(activeMembership.organization_id) : null
        }
        organizations={orgRows.map((o) => ({
          id: String(o.id),
          name: String(o.name),
          type: String(o.type),
        }))}
        assignableRoles={assignableRoles}
        canAssignRoles={hasPermission(actor, "roles:assign")}
        canSuspend={hasPermission(actor, "accounts:suspend")}
      />

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-3">
          Recent User Activity
        </h2>
        {activityRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recorded activity for this user.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Resource</th>
                  <th className="py-2 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activityRows.map((ev) => (
                  <tr key={String(ev.id)}>
                    <td className="py-2 pr-4 font-mono text-charcoal">
                      {String(ev.action)}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {String(ev.entity_type)} · {String(ev.entity_id).slice(0, 8)}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(String(ev.created_at)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
