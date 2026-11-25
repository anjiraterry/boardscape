import fs from "node:fs";
import { Pool } from "@neondatabase/serverless";

const env = fs.readFileSync(".env.local", "utf8");
const branchMatch = env.match(/^NEON_BRANCH=(.+)$/m);
const branch = branchMatch ? branchMatch[1].trim() : "";

if (branch !== "dev") {
  throw new Error(
    `SAFETY_ABORT: Refusing to seed fictional dev fixtures on branch "${branch}". Switch to branch "dev" first.`
  );
}

const dbMatch =
  env.match(/^DATABASE_URL_UNPOOLED=(.+)$/m) ||
  env.match(/^DATABASE_URL=(.+)$/m);
if (!dbMatch) throw new Error("Missing DATABASE_URL in .env.local");
const connectionString = dbMatch[1].trim().replace(/^['"]|['"]$/g, "");

const pool = new Pool({ connectionString });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  // 1. Fictional Operator & Client Organizations
  const op1 = await client.query(
    `INSERT INTO organizations (name, type, slug, contact_email)
     VALUES ('[DEV FIXTURE] Meridian Outdoor Ltd', 'operator', 'dev-fixture-meridian', 'dev-meridian@example.invalid')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`
  );
  const op2 = await client.query(
    `INSERT INTO organizations (name, type, slug, contact_email)
     VALUES ('[DEV FIXTURE] Apex Gantry Media', 'operator', 'dev-fixture-apex', 'dev-apex@example.invalid')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`
  );
  const clientOrg = await client.query(
    `INSERT INTO organizations (name, type, slug, contact_email)
     VALUES ('[DEV FIXTURE] Kestrel Consumer Goods', 'client', 'dev-fixture-kestrel', 'dev-kestrel@example.invalid')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`
  );

  const op1Id = op1.rows[0].id;
  const op2Id = op2.rows[0].id;
  const clientOrgId = clientOrg.rows[0].id;

  await client.query(
    `INSERT INTO operators (organization_id, legal_name, primary_contact_name, primary_contact_email, onboarding_notes)
     VALUES
       ($1, '[DEV FIXTURE] Meridian Outdoor Ltd', 'Dev Contact A', 'dev-meridian@example.invalid', 'Fictional dev fixture operator'),
       ($2, '[DEV FIXTURE] Apex Gantry Media', 'Dev Contact B', 'dev-apex@example.invalid', 'Fictional dev fixture operator')
     ON CONFLICT (organization_id) DO NOTHING`,
    [op1Id, op2Id]
  );

  // 2. Fictional Multi-Face Sites & Different Formats / Verification States
  const site1 = await client.query(
    `INSERT INTO sites (public_id, latitude, longitude, gps_accuracy_meters, address, road_name, district, corridor, structure_type)
     VALUES ('DEV-ABJ-001', 9.0765, 7.4795, 6.5, '[DEV FIXTURE] Plot 42 Aminu Kano Crescent', 'Aminu Kano Crescent', 'Wuse II', 'Wuse Commercial Corridor', 'unipole')
     ON CONFLICT (public_id) DO UPDATE SET district = EXCLUDED.district
     RETURNING id`
  );
  const site2 = await client.query(
    `INSERT INTO sites (public_id, latitude, longitude, gps_accuracy_meters, address, road_name, district, corridor, structure_type)
     VALUES ('DEV-ABJ-002', 9.0289, 7.3921, 8.0, '[DEV FIXTURE] KM 9 Umaru Musa Yar''Adua Way', 'Airport Road', 'Lugbe', 'Airport Road Corridor', 'gantry')
     ON CONFLICT (public_id) DO UPDATE SET district = EXCLUDED.district
     RETURNING id`
  );
  const site3 = await client.query(
    `INSERT INTO sites (public_id, latitude, longitude, gps_accuracy_meters, address, road_name, district, corridor, structure_type)
     VALUES ('DEV-ABJ-003', 9.0825, 7.4962, 5.2, '[DEV FIXTURE] Transcorp Junction', 'Aguiyi Ironsi Street', 'Maitama', 'Maitama Diplomatic Corridor', 'digital_led')
     ON CONFLICT (public_id) DO UPDATE SET district = EXCLUDED.district
     RETURNING id`
  );
  const site4 = await client.query(
    `INSERT INTO sites (public_id, latitude, longitude, gps_accuracy_meters, address, road_name, district, corridor, structure_type)
     VALUES ('DEV-ABJ-004', 9.0578, 7.4951, 9.0, '[DEV FIXTURE] Central Area Spine', 'Constitution Avenue', 'Central Business District', 'CBD Core', 'rooftop')
     ON CONFLICT (public_id) DO UPDATE SET district = EXCLUDED.district
     RETURNING id`
  );

  const s1Id = site1.rows[0].id;
  const s2Id = site2.rows[0].id;
  const s3Id = site3.rows[0].id;
  const s4Id = site4.rows[0].id;

  const systemActor = "00000000-0000-0000-0000-000000000000";

  // Multi-face unipole (published + verified_private)
  const f1 = await client.query(
    `INSERT INTO faces (site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, obstruction_level, road_direction, state, public_summary, source_type, last_confirmed_at, published_at)
     VALUES ($1, 'dev-wuse-aminu-kano-f1', '[DEV FIXTURE] Aminu Kano Unipole — Face A (Inbound)', 'unipole', 12.0, 4.0, 90, 'frontlit', 'clear', 'Inbound Wuse', 'published', 'Fictional dev fixture face for testing Atlas filtering.', 'FIELD_OBSERVED', NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET state = 'published'
     RETURNING id`,
    [s1Id]
  );
  await client.query(
    `INSERT INTO faces (site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, obstruction_level, road_direction, state, public_summary, source_type, last_confirmed_at)
     VALUES ($1, 'dev-wuse-aminu-kano-f2', '[DEV FIXTURE] Aminu Kano Unipole — Face B (Outbound)', 'unipole', 12.0, 4.0, 270, 'frontlit', 'clear', 'Outbound Wuse', 'verified_private', 'Fictional dev fixture face (verified_private, not public).', 'FIELD_OBSERVED', NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [s1Id]
  );

  // Expressway gantry (published)
  const f3 = await client.query(
    `INSERT INTO faces (site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, obstruction_level, road_direction, state, public_summary, source_type, last_confirmed_at, published_at)
     VALUES ($1, 'dev-airport-road-gantry-f1', '[DEV FIXTURE] Airport Road Gantry — Citybound Span', 'gantry', 18.0, 5.0, 45, 'backlit', 'clear', 'Citybound', 'published', 'Fictional dev fixture gantry face.', 'OPERATOR_PROVIDED', NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET state = 'published'
     RETURNING id`,
    [s2Id]
  );

  // Digital LED (published, unconfirmed timestamp)
  const f4 = await client.query(
    `INSERT INTO faces (site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, obstruction_level, road_direction, state, public_summary, source_type, published_at)
     VALUES ($1, 'dev-maitama-digital-f1', '[DEV FIXTURE] Maitama Digital LED — Northbound', 'digital_led', 8.0, 4.5, 0, 'digital_led', 'clear', 'Northbound', 'published', 'Fictional dev fixture digital LED screen.', 'FIELD_OBSERVED', NOW())
     ON CONFLICT (slug) DO UPDATE SET state = 'published'
     RETURNING id`,
    [s3Id]
  );

  // Rooftop (awaiting_operator — not published)
  await client.query(
    `INSERT INTO faces (site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, obstruction_level, road_direction, state, public_summary, source_type)
     VALUES ($1, 'dev-cbd-rooftop-f1', '[DEV FIXTURE] CBD Rooftop — Eastbound', 'rooftop', 15.0, 5.0, 110, 'none', 'partial', 'Eastbound', 'awaiting_operator', 'Fictional dev fixture awaiting operator auth.', 'FIELD_OBSERVED')
     ON CONFLICT (slug) DO NOTHING`,
    [s4Id]
  );

  // Listing authorizations for published faces
  await client.query(
    `INSERT INTO listing_authorizations (face_id, operator_org_id, grant_type, marketing_scope, verified_by, is_active)
     VALUES
       ($1, $3, 'written_mandate', 'non_exclusive', $5, true),
       ($2, $4, 'email_confirmation', 'non_exclusive', $5, true)
     ON CONFLICT DO NOTHING`,
    [f1.rows[0].id, f3.rows[0].id, op1Id, op2Id, systemActor]
  );

  // Sample lead + proposal + proposal_line for testing Client Portal & Bookings
  const leadRes = await client.query(
    `INSERT INTO leads (client_org_id, company_name, contact_name, contact_email, source, status, notes)
     VALUES ($1, '[DEV FIXTURE] Kestrel Consumer Goods', 'Dev Buyer', 'dev-buyer@example.invalid', 'website_brief', 'proposal_in_progress', 'Fictional dev fixture lead')
     RETURNING id`,
    [clientOrgId]
  );
  const leadId = leadRes.rows[0].id;

  const propRes = await client.query(
    `INSERT INTO proposals (lead_id, client_org_id, version, title, status, media_subtotal_minor, total_minor, assumptions, valid_until, created_by)
     VALUES ($1, $2, 1, '[DEV FIXTURE] Abuja Q2 Launch Proposal', 'sent_to_client', 250000000, 285000000, 'Fictional dev fixture proposal', NOW() + interval '14 days', $3)
     ON CONFLICT (lead_id, version) DO NOTHING
     RETURNING id`,
    [leadId, clientOrgId, systemActor]
  );

  if (propRes.rows[0]?.id) {
    await client.query(
      `INSERT INTO proposal_lines (proposal_id, face_id, flight_start, flight_end, media_cost_minor, rate_source)
       VALUES ($1, $2, '2026-12-01', '2026-12-31', 250000000, 'OPERATOR_CONFIRMED')`,
      [propRes.rows[0].id, f1.rows[0].id]
    );
  }

  await client.query("COMMIT");
  console.log("Seeded fictional dev fixtures on branch:", branch, {
    op1Id,
    op2Id,
    clientOrgId,
    publishedFaceIds: [f1.rows[0].id, f3.rows[0].id, f4.rows[0].id],
  });
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(err);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
