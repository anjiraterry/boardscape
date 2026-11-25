import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import type { BboxFilter } from "@/modules/geospatial/schemas";
import type { PublicFaceListing } from "@/modules/inventory/schemas";

/**
 * Public-safe inventory query against Neon Postgres. Never returns private
 * operator contacts, internal rates, permit scans, or unpublished faces.
 */
export async function searchPublishedFaces(
  filter: BboxFilter
): Promise<{ faces: PublicFaceListing[]; configured: boolean }> {
  if (!isDatabaseConfigured()) {
    return { faces: [], configured: false };
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT
        f.id AS face_id,
        f.slug,
        f.label,
        f.format,
        f.width_meters,
        f.height_meters,
        f.azimuth_deg,
        f.illumination,
        f.road_direction,
        f.public_summary,
        f.public_image_path,
        f.last_confirmed_at,
        s.id AS site_id,
        s.public_id AS site_public_id,
        s.latitude,
        s.longitude,
        s.address,
        s.road_name,
        s.district,
        s.corridor
      FROM faces f
      INNER JOIN sites s ON s.id = f.site_id
      WHERE f.state = 'published'
        AND s.longitude BETWEEN ${filter.minLng} AND ${filter.maxLng}
        AND s.latitude BETWEEN ${filter.minLat} AND ${filter.maxLat}
        AND (${filter.district || null}::text IS NULL OR s.district = ${filter.district || null})
        AND (${filter.format || null}::text IS NULL OR f.format::text = ${filter.format || null})
        AND (
          ${filter.keyword || null}::text IS NULL
          OR f.label ILIKE ${`%${filter.keyword || ""}%`}
          OR s.road_name ILIKE ${`%${filter.keyword || ""}%`}
          OR s.district ILIKE ${`%${filter.keyword || ""}%`}
          OR s.address ILIKE ${`%${filter.keyword || ""}%`}
        )
      ORDER BY f.last_confirmed_at DESC NULLS LAST, f.created_at DESC
      LIMIT ${filter.limit}
      OFFSET ${filter.offset}
    `;

    const faces: PublicFaceListing[] = rows.map((row) => ({
      faceId: String(row.face_id),
      slug: String(row.slug),
      label: String(row.label),
      format: row.format as PublicFaceListing["format"],
      widthMeters: Number(row.width_meters),
      heightMeters: Number(row.height_meters),
      azimuthDeg: Number(row.azimuth_deg),
      illumination: String(row.illumination),
      roadDirection: String(row.road_direction),
      publicSummary: row.public_summary ? String(row.public_summary) : null,
      publicImagePath: row.public_image_path ? String(row.public_image_path) : null,
      lastConfirmedAt: row.last_confirmed_at ? String(row.last_confirmed_at) : null,
      siteId: String(row.site_id),
      sitePublicId: String(row.site_public_id),
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      address: String(row.address),
      roadName: String(row.road_name),
      district: String(row.district),
      corridor: row.corridor ? String(row.corridor) : null,
      availabilityLabel: row.last_confirmed_at
        ? `Operator confirmed ${new Date(String(row.last_confirmed_at)).toLocaleDateString("en-NG")}`
        : "Availability requires operator confirmation",
    }));

    return { faces, configured: true };
  } catch {
    return { faces: [], configured: true };
  }
}
