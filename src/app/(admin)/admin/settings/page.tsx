import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import {
  AdminSettingsClient,
  type PlatformSettingsValues,
} from "@/components/admin/admin-settings-client";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: PlatformSettingsValues = {
  platform_identity: {
    platformName: "boardscape",
    pilotRegion: "Abuja, FCT",
    supportEmail: "ops@boardscape.ng",
  },
  feature_flags: {
    publicAtlasEnabled: true,
    publicBriefIntakeEnabled: true,
    fieldOfflineQueueEnabled: true,
    operatorPortalEnabled: true,
  },
  operational_defaults: {
    surveyDuplicateRadiusMeters: 50,
    maxGpsWarningMeters: 30,
    quoteValidityDays: 14,
  },
};

export default async function AdminSettingsPage() {
  const session = await getServerSession();
  requirePermission(session, "settings:manage");

  const merged: PlatformSettingsValues = { ...DEFAULT_SETTINGS };

  if (isDatabaseConfigured()) {
    const sql = getSql();
    const rows = await sql`SELECT key, value FROM platform_settings`;
    for (const row of rows) {
      const key = String(row.key);
      if (key === "platform_identity" && row.value) {
        merged.platform_identity = {
          ...DEFAULT_SETTINGS.platform_identity,
          ...(row.value as PlatformSettingsValues["platform_identity"]),
        };
      } else if (key === "feature_flags" && row.value) {
        merged.feature_flags = {
          ...DEFAULT_SETTINGS.feature_flags,
          ...(row.value as PlatformSettingsValues["feature_flags"]),
        };
      } else if (key === "operational_defaults" && row.value) {
        merged.operational_defaults = {
          ...DEFAULT_SETTINGS.operational_defaults,
          ...(row.value as PlatformSettingsValues["operational_defaults"]),
        };
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Configuration
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Platform Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform identity, feature flags, and operational thresholds.
        </p>
      </div>

      <AdminSettingsClient initialSettings={merged} />
    </div>
  );
}
