import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requirePermission } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { recordAuditEvent } from "@/modules/audit/service";

const UpdateSettingSchema = z.object({
  key: z.enum(["platform_identity", "feature_flags", "operational_defaults"]),
  value: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export async function GET() {
  try {
    const session = await getServerSession();
    requirePermission(session, "settings:manage");

    const integrations = {
      databaseConfigured: isDatabaseConfigured(),
      authSecretConfigured: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
      neonBranch: process.env.NEON_BRANCH ?? "local",
      nodeEnv: process.env.NODE_ENV ?? "development",
      blobUploadMode: process.env.BLOB_READ_WRITE_TOKEN ? "vercel_blob" : "local_uploads",
      mapTilesConfigured: Boolean(process.env.NEXT_PUBLIC_MAP_STYLE_URL),
    };

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ settings: {}, integrations });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT key, value, updated_at FROM platform_settings
    `;
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[String(row.key)] = row.value;
    }

    return NextResponse.json({ settings, integrations });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requirePermission(session, "settings:manage");

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const parsed = UpdateSettingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid setting payload" }, { status: 400 });
    }

    const { key, value } = parsed.data;
    const sql = getSql();

    const beforeRows = await sql`
      SELECT value FROM platform_settings WHERE key = ${key} LIMIT 1
    `;
    const beforeValue = beforeRows[0]?.value ?? {};

    await sql`
      INSERT INTO platform_settings (key, value, updated_by, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${actor.userId}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
    `;

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "platform_setting",
      entityId: key,
      action: "admin.settings_updated",
      beforeState: typeof beforeValue === "object" && beforeValue ? (beforeValue as Record<string, unknown>) : {},
      afterState: value,
      source: "admin",
    });

    return NextResponse.json({ ok: true, key, value });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
