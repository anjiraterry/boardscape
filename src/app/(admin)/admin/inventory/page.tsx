import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { hasPermission } from "@/modules/identity/policies";
import { AdminInventoryClient } from "@/components/admin/admin-inventory-client";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await getServerSession();
  const actor = requirePermission(session, "inventory:review");

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const [rows, historyRows] = await Promise.all([
    sql`
      SELECT
        f.id AS face_id,
        f.label,
        f.format,
        f.state,
        f.availability,
        f.updated_at,
        s.id AS site_id,
        s.title AS site_title,
        s.corridor,
        s.district,
        o.name AS operator_name,
        la.review_status AS auth_status,
        (
          SELECT COUNT(*)::int FROM media_assets ma
          WHERE ma.face_id = f.id OR ma.site_id = s.id
        ) AS evidence_count,
        EXISTS (
          SELECT 1 FROM surveys sv
          WHERE sv.site_id = s.id AND sv.duplicate_of_site_id IS NOT NULL
        ) AS has_duplicate_warning
      FROM faces f
      INNER JOIN sites s ON s.id = f.site_id
      LEFT JOIN listing_authorizations la ON la.face_id = f.id AND la.is_active = true
      LEFT JOIN organizations o ON o.id = la.operator_org_id
      ORDER BY f.updated_at DESC
      LIMIT 100
    `,
    sql`
      SELECT a.id, a.action, a.entity_id, a.after_state, a.created_at, p.full_name
      FROM audit_events a
      LEFT JOIN profiles p ON p.id = a.actor_id
      WHERE a.entity_type IN ('face', 'site')
      ORDER BY a.created_at DESC
      LIMIT 10
    `,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Inventory Oversight
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Sites, Faces & Publication Control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect verification states, duplicate-location warnings, evidence
          counts, and unpublish unauthorized listings.
        </p>
      </div>

      <AdminInventoryClient
        items={rows.map((r) => ({
          faceId: String(r.face_id),
          label: String(r.label),
          format: String(r.format),
          state: String(r.state),
          availability: String(r.availability),
          siteId: String(r.site_id),
          siteTitle: String(r.site_title),
          corridor: String(r.corridor),
          district: String(r.district),
          operatorName: r.operator_name ? String(r.operator_name) : null,
          authStatus: r.auth_status ? String(r.auth_status) : null,
          evidenceCount: Number(r.evidence_count ?? 0),
          hasDuplicateWarning: Boolean(r.has_duplicate_warning),
          updatedAt: String(r.updated_at),
        }))}
        canReview={hasPermission(actor, "inventory:review")}
      />

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-3">
          Recent Inventory Modification History
        </h2>
        {historyRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No inventory modification history recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-border text-xs">
            {historyRows.map((h) => (
              <li
                key={String(h.id)}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <span className="font-mono font-medium text-charcoal">
                    {String(h.action)}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    on {String(h.entity_id).slice(0, 8)} by{" "}
                    {h.full_name ? String(h.full_name) : "System"}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(String(h.created_at)).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
