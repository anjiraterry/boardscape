import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { canAssignRole, hasPermission } from "@/modules/identity/policies";
import { ROLE_METADATA, type AppRole } from "@/modules/identity/schemas";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession();
  const actor = requirePermission(session, "users:manage");

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database is not configured.
      </div>
    );
  }

  const sql = getSql();
  const [userRows, orgRows] = await Promise.all([
    sql`
      SELECT
        p.id,
        p.email,
        p.full_name,
        p.status,
        p.last_login_at,
        p.created_at,
        m.role,
        m.organization_id,
        o.name AS organization_name
      FROM profiles p
      LEFT JOIN memberships m ON m.user_id = p.id AND m.is_active = true
      LEFT JOIN organizations o ON o.id = m.organization_id
      ORDER BY p.created_at DESC
    `,
    sql`
      SELECT id, name, type
      FROM organizations
      WHERE status = 'active'
      ORDER BY name ASC
    `,
  ]);

  const allRoles = Object.keys(ROLE_METADATA) as AppRole[];
  const assignableRoles = allRoles.filter((r) => canAssignRole(actor, r).allowed);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Users & Access
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          User Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform accounts, organization memberships, and access status.
        </p>
      </div>

      <AdminUsersClient
        initialUsers={userRows.map((u) => ({
          id: String(u.id),
          email: String(u.email),
          fullName: String(u.full_name),
          status: String(u.status ?? "active"),
          lastLoginAt: u.last_login_at ? String(u.last_login_at) : null,
          createdAt: String(u.created_at),
          role: u.role ? (String(u.role) as AppRole) : null,
          organizationId: u.organization_id ? String(u.organization_id) : null,
          organizationName: u.organization_name ? String(u.organization_name) : null,
        }))}
        organizations={orgRows.map((o) => ({
          id: String(o.id),
          name: String(o.name),
          type: String(o.type),
        }))}
        assignableRoles={assignableRoles}
        canManageUsers={hasPermission(actor, "users:manage")}
      />
    </div>
  );
}
