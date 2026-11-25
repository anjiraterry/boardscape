import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Layers,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-charcoal">
          Platform Administration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Database is not configured. Set DATABASE_URL to enable admin metrics.
        </p>
      </div>
    );
  }

  const sql = getSql();

  const [
    userStats,
    orgStats,
    faceStats,
    surveyStats,
    authStats,
    campaignStats,
    complianceAlerts,
    recentAudit,
  ] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE status = 'suspended')::int AS suspended_users
      FROM profiles
    `,
    sql`
      SELECT COUNT(*)::int AS active_orgs
      FROM organizations
      WHERE status = 'active'
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE state = 'published')::int AS published_faces,
        COUNT(*) FILTER (WHERE state IN ('unverified', 'surveyed', 'draft'))::int AS unverified_faces
      FROM faces
    `,
    sql`
      SELECT COUNT(*)::int AS pending_surveys
      FROM surveys
      WHERE duplicate_review_status = 'pending'
    `,
    sql`
      SELECT COUNT(*)::int AS pending_authorizations
      FROM listing_authorizations
      WHERE review_status = 'pending'
    `,
    sql`
      SELECT COUNT(*)::int AS active_campaigns
      FROM campaigns
      WHERE status NOT IN ('completed', 'cancelled')
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE review_status IN ('evidence_missing', 'rejected'))::int AS missing_or_rejected,
        COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < CURRENT_DATE)::int AS expired_permits
      FROM permit_records
    `,
    sql`
      SELECT
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.source,
        a.created_at,
        p.full_name,
        p.email
      FROM audit_events a
      LEFT JOIN profiles p ON p.id = a.actor_id
      ORDER BY a.created_at DESC
      LIMIT 8
    `,
  ]);

  const metrics = [
    {
      label: "Total Users",
      value: Number(userStats[0]?.total_users ?? 0),
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Active Organizations",
      value: Number(orgStats[0]?.active_orgs ?? 0),
      href: "/admin/organizations",
      icon: Building2,
    },
    {
      label: "Published Faces",
      value: Number(faceStats[0]?.published_faces ?? 0),
      href: "/admin/inventory",
      icon: MapPin,
    },
    {
      label: "Unverified Faces",
      value: Number(faceStats[0]?.unverified_faces ?? 0),
      href: "/admin/inventory?status=unverified",
      icon: ShieldAlert,
    },
    {
      label: "Pending Surveys",
      value: Number(surveyStats[0]?.pending_surveys ?? 0),
      href: "/admin/verifications",
      icon: ClipboardCheck,
    },
    {
      label: "Pending Operator Auth",
      value: Number(authStats[0]?.pending_authorizations ?? 0),
      href: "/admin/verifications",
      icon: CheckCircle2,
    },
    {
      label: "Active Campaigns",
      value: Number(campaignStats[0]?.active_campaigns ?? 0),
      href: "/admin/campaigns",
      icon: Layers,
    },
  ];

  const missingOrRejected = Number(complianceAlerts[0]?.missing_or_rejected ?? 0);
  const expiredPermits = Number(complianceAlerts[0]?.expired_permits ?? 0);
  const suspendedUsers = Number(userStats[0]?.suspended_users ?? 0);
  const pendingSurveys = Number(surveyStats[0]?.pending_surveys ?? 0);
  const pendingAuth = Number(authStats[0]?.pending_authorizations ?? 0);

  const alerts: { title: string; detail: string; href: string }[] = [];
  if (pendingSurveys > 0) {
    alerts.push({
      title: `${pendingSurveys} pending field survey(s)`,
      detail: "Awaiting duplicate check and administrative verification.",
      href: "/admin/verifications",
    });
  }
  if (pendingAuth > 0) {
    alerts.push({
      title: `${pendingAuth} pending operator authorization(s)`,
      detail: "Requires review before listing activation.",
      href: "/admin/verifications",
    });
  }
  if (missingOrRejected > 0 || expiredPermits > 0) {
    alerts.push({
      title: "Compliance evidence flags",
      detail: `${missingOrRejected} missing/rejected and ${expiredPermits} expired permit record(s).`,
      href: "/admin/verifications",
    });
  }
  if (suspendedUsers > 0) {
    alerts.push({
      title: `${suspendedUsers} suspended user account(s)`,
      detail: "Review account access status in User Management.",
      href: "/admin/users",
    });
  }

  const integrations = [
    {
      name: "Neon PostgreSQL",
      healthy: isDatabaseConfigured(),
      detail: `Branch: ${process.env.NEON_BRANCH ?? "local"}`,
    },
    {
      name: "Session Signing (AUTH_SECRET)",
      healthy: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
      detail: "HMAC-SHA256 cookie verification",
    },
    {
      name: "Media Storage",
      healthy: true,
      detail: process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "Local uploads directory",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Governance & Security
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
            Platform Administration
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-4 w-4 text-limebrand-600" />
          <span>
            Environment:{" "}
            <strong className="font-mono text-charcoal">
              {process.env.NEON_BRANCH ?? "local"}
            </strong>
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-charcoal/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {m.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-charcoal" />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-charcoal">
                {m.value}
              </p>
            </Link>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-charcoal">System Alerts</h2>
            <Link
              href="/admin/verifications"
              className="text-xs font-medium text-charcoal hover:underline"
            >
              Open Verification Center
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active governance or compliance alerts.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((alert) => (
                <li key={alert.title} className="py-3">
                  <Link href={alert.href} className="flex items-start gap-3 group">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-charcoal group-hover:underline">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.detail}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-charcoal">
              Integration Health Status
            </h2>
            <Link
              href="/admin/integrations"
              className="text-xs font-medium text-charcoal hover:underline"
            >
              View Diagnostics
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {integrations.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    item.healthy
                      ? "bg-limebrand/25 text-charcoal"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {item.healthy ? "Healthy" : "Missing Config"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-charcoal">
            Recent Administrative & System Actions
          </h2>
          <Link
            href="/admin/audit"
            className="text-xs font-medium text-charcoal hover:underline"
          >
            Full Audit Log
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No audit events recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2.5 pr-4 font-medium">Action</th>
                  <th className="py-2.5 pr-4 font-medium">Actor</th>
                  <th className="py-2.5 pr-4 font-medium">Resource</th>
                  <th className="py-2.5 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAudit.map((row) => (
                  <tr key={String(row.id)}>
                    <td className="py-2.5 pr-4 font-mono text-xs text-charcoal">
                      {String(row.action)}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                      {row.full_name
                        ? `${String(row.full_name)} (${String(row.email ?? "")})`
                        : "System"}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-charcoal">
                      {String(row.entity_type)} · {String(row.entity_id).slice(0, 8)}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">
                      {new Date(String(row.created_at)).toLocaleString()}
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
