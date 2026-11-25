import { AlertCircle } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { hasPermission } from "@/modules/identity/policies";
import { COMPLIANCE_DISCLAIMER } from "@/modules/compliance/schemas";
import {
  AdminVerificationsClient,
  type VerificationItem,
} from "@/components/admin/admin-verifications-client";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const session = await getServerSession();
  const actor = requirePermission(session, "listings:approve");

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Database not configured.
      </div>
    );
  }

  const sql = getSql();
  const [surveyRows, authRows, permitRows] = await Promise.all([
    sql`
      SELECT
        sv.id,
        sv.displayed_operator_name,
        sv.gps_accuracy_meters,
        sv.duplicate_review_status,
        sv.created_at,
        s.title AS site_title,
        s.corridor
      FROM surveys sv
      LEFT JOIN sites s ON s.id = sv.site_id
      WHERE sv.duplicate_review_status = 'pending'
      ORDER BY sv.created_at DESC
      LIMIT 50
    `,
    sql`
      SELECT
        la.id,
        la.grant_type,
        la.marketing_scope,
        la.evidence_path,
        la.review_status,
        la.created_at,
        f.label AS face_label,
        o.name AS operator_name
      FROM listing_authorizations la
      INNER JOIN faces f ON f.id = la.face_id
      INNER JOIN organizations o ON o.id = la.operator_org_id
      WHERE la.review_status = 'pending'
      ORDER BY la.created_at DESC
      LIMIT 50
    `,
    sql`
      SELECT
        pr.id,
        pr.claimed_authority,
        pr.issuer,
        pr.reference_number,
        pr.expires_at,
        pr.document_path,
        pr.review_status,
        pr.created_at,
        o.name AS operator_name
      FROM permit_records pr
      INNER JOIN organizations o ON o.id = pr.operator_org_id
      WHERE pr.review_status IN ('evidence_missing', 'pending')
         OR (pr.expires_at IS NOT NULL AND pr.expires_at < CURRENT_DATE)
      ORDER BY pr.created_at DESC
      LIMIT 50
    `,
  ]);

  const items: VerificationItem[] = [
    ...surveyRows.map((sv) => ({
      entityType: "survey" as const,
      id: String(sv.id),
      title: sv.site_title
        ? `Field Survey: ${String(sv.site_title)}`
        : "Field Survey (Unlinked Site)",
      subtitle: `${sv.corridor ? String(sv.corridor) : "Unknown corridor"} · Operator sign: ${sv.displayed_operator_name ? String(sv.displayed_operator_name) : "N/A"} · GPS ±${sv.gps_accuracy_meters ?? "?"}m`,
      status: String(sv.duplicate_review_status),
      documentPath: null,
      createdAt: String(sv.created_at),
      flagLabel: null,
    })),
    ...authRows.map((la) => ({
      entityType: "listing_authorization" as const,
      id: String(la.id),
      title: `Operator Authorization: ${String(la.operator_name)} (${String(la.face_label)})`,
      subtitle: `${String(la.grant_type)} · ${String(la.marketing_scope)}`,
      status: String(la.review_status),
      documentPath: la.evidence_path ? String(la.evidence_path) : null,
      createdAt: String(la.created_at),
      flagLabel: la.evidence_path ? null : "Missing document",
    })),
    ...permitRows.map((pr) => {
      const isExpired =
        pr.expires_at && new Date(String(pr.expires_at)) < new Date();
      return {
        entityType: "permit_record" as const,
        id: String(pr.id),
        title: `Compliance Record: ${String(pr.operator_name)} — ${String(pr.claimed_authority)}`,
        subtitle: `Issuer: ${String(pr.issuer)} · Ref: ${pr.reference_number ? String(pr.reference_number) : "None"}`,
        status: String(pr.review_status),
        documentPath: pr.document_path ? String(pr.document_path) : null,
        createdAt: String(pr.created_at),
        flagLabel: isExpired
          ? "Expired permit"
          : String(pr.review_status) === "evidence_missing"
            ? "Missing evidence"
            : null,
      };
    }),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Verification Center
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Surveys, Authorizations & Compliance Evidence
        </h1>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0 text-charcoal mt-0.5" />
          <span>{COMPLIANCE_DISCLAIMER}</span>
        </div>
      </div>

      <AdminVerificationsClient
        items={items}
        canApprove={hasPermission(actor, "listings:approve")}
      />
    </div>
  );
}
