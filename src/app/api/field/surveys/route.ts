import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/guards";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { SurveySubmissionSchema } from "@/modules/surveys/schemas";
import { assessCoordinateQuality } from "@/modules/surveys/service";
import { recordAuditEvent } from "@/modules/audit/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const actor = requireRole(session, [
      "surveyor",
      "verifier_ops",
      "admin_finance",
    ]);

    const body = await request.json();
    const parsed = SurveySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid survey payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Neon database is not configured" },
        { status: 503 }
      );
    }

    const input = parsed.data;
    const sql = getSql();

    // Idempotency check (FR-006): prevent duplicate records on offline retry
    const existingRows = await sql`
      SELECT id, site_id
      FROM surveys
      WHERE sync_key = ${input.syncKey}
      LIMIT 1
    `;
    const existingSurvey = existingRows[0];

    if (existingSurvey) {
      return NextResponse.json(
        {
          status: "already_synced",
          surveyId: String(existingSurvey.id),
          siteId: String(existingSurvey.site_id),
        },
        { status: 200 }
      );
    }

    // Nearby duplicate site check via Haversine distance in meters (FR-007)
    const nearbySites = await sql`
      SELECT
        id AS site_id,
        public_id,
        (
          6371000 * ACOS(
            LEAST(1.0,
              COS(RADIANS(${input.latitude})) * COS(RADIANS(latitude)) *
              COS(RADIANS(longitude) - RADIANS(${input.longitude})) +
              SIN(RADIANS(${input.latitude})) * SIN(RADIANS(latitude))
            )
          )
        ) AS distance_meters
      FROM sites
      WHERE latitude BETWEEN ${input.latitude - 0.001} AND ${input.latitude + 0.001}
        AND longitude BETWEEN ${input.longitude - 0.001} AND ${input.longitude + 0.001}
        AND (
          6371000 * ACOS(
            LEAST(1.0,
              COS(RADIANS(${input.latitude})) * COS(RADIANS(latitude)) *
              COS(RADIANS(longitude) - RADIANS(${input.longitude})) +
              SIN(RADIANS(${input.latitude})) * SIN(RADIANS(latitude))
            )
          )
        ) <= 50
      ORDER BY distance_meters ASC
      LIMIT 5
    `;

    const coordCheck = assessCoordinateQuality(input.gpsAccuracyMeters);
    const sitePublicId = `ABJ-${Date.now().toString(36).toUpperCase()}`;

    const siteRows = await sql`
      INSERT INTO sites (
        public_id,
        latitude,
        longitude,
        gps_accuracy_meters,
        address,
        road_name,
        district,
        corridor,
        structure_type,
        created_by
      )
      VALUES (
        ${sitePublicId},
        ${input.latitude},
        ${input.longitude},
        ${input.gpsAccuracyMeters},
        ${input.address},
        ${input.roadName},
        ${input.district},
        ${input.corridor ?? null},
        ${input.structureType},
        ${actor.userId}
      )
      RETURNING id
    `;

    const siteId = siteRows[0]?.id ? String(siteRows[0].id) : null;
    if (!siteId) {
      return NextResponse.json(
        { error: "Failed to create site record" },
        { status: 500 }
      );
    }

    for (let index = 0; index < input.faces.length; index++) {
      const face = input.faces[index];
      const slug = `${slugify(input.district)}-${slugify(input.roadName)}-${sitePublicId.toLowerCase()}-f${index + 1}`;
      await sql`
        INSERT INTO faces (
          site_id,
          slug,
          label,
          format,
          width_meters,
          height_meters,
          azimuth_deg,
          illumination,
          obstruction_level,
          road_direction,
          state,
          source_type
        )
        VALUES (
          ${siteId},
          ${slug},
          ${face.label},
          ${face.format},
          ${face.widthMeters},
          ${face.heightMeters},
          ${face.azimuthDeg},
          ${face.illumination},
          ${face.obstructionLevel},
          ${face.roadDirection},
          'surveyed',
          'FIELD_OBSERVED'
        )
      `;
    }

    const hasDuplicates = nearbySites.length > 0;
    const duplicateStatus = hasDuplicates ? "flagged_nearby" : "pending";
    const duplicateSiteId = hasDuplicates
      ? String(nearbySites[0].site_id)
      : null;
    const payload = JSON.stringify({
      faceCount: input.faces.length,
      coordinateQuality: coordCheck.quality,
    });

    const surveyRows = await sql`
      INSERT INTO surveys (
        sync_key,
        site_id,
        observer_id,
        recorded_at,
        gps_accuracy_meters,
        displayed_operator_name,
        displayed_operator_contact,
        condition_notes,
        duplicate_review_status,
        duplicate_of_site_id,
        payload
      )
      VALUES (
        ${input.syncKey},
        ${siteId},
        ${actor.userId},
        ${input.recordedAt},
        ${input.gpsAccuracyMeters},
        ${input.displayedOperatorName ?? null},
        ${input.displayedOperatorContact ?? null},
        ${input.conditionNotes ?? null},
        ${duplicateStatus},
        ${duplicateSiteId},
        ${payload}::jsonb
      )
      RETURNING id
    `;

    const surveyId = surveyRows[0]?.id ? String(surveyRows[0].id) : null;
    if (!surveyId) {
      return NextResponse.json(
        { error: "Failed to save survey record" },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      actorId: actor.userId,
      organizationId: actor.activeOrganizationId,
      entityType: "survey",
      entityId: surveyId,
      action: "inventory.survey_submitted",
      afterState: {
        siteId,
        faceCount: input.faces.length,
        duplicateFlagged: hasDuplicates,
      },
      source: "field_pwa",
    });

    return NextResponse.json(
      {
        status: "created",
        surveyId,
        siteId,
        nearbyDuplicates: nearbySites,
        coordinateWarning: coordCheck.warning ?? null,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
