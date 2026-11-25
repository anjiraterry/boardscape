-- Development Test Fixtures for Boardscape (Abuja Pilot)
-- Safe synthetic fixtures for local E2E verification ONLY. Do not run in production.

BEGIN;

-- Organizations
INSERT INTO organizations (id, name, type, slug, contact_email)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Boardscape Agency', 'agency', 'boardscape-agency', 'ops@boardscape.local'),
  ('10000000-0000-0000-0000-000000000002', 'Abuja Outdoor Partners Ltd (Dev)', 'operator', 'abuja-outdoor-dev', 'operator@boardscape.local'),
  ('10000000-0000-0000-0000-000000000003', 'Zuma Consumer Brands (Dev)', 'client', 'zuma-brands-dev', 'client@boardscape.local')
ON CONFLICT (id) DO NOTHING;

-- Synthetic User Memberships (link to auth.users UUIDs in local Supabase)
INSERT INTO memberships (organization_id, user_id, role, is_active)
VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'admin_finance', true),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'surveyor', true),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'operator_user', true),
  ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'client_user', true)
ON CONFLICT DO NOTHING;

-- Operator profile
INSERT INTO operators (id, organization_id, legal_name, primary_contact_name, primary_contact_email)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'Abuja Outdoor Partners Ltd (Dev)',
  'Dev Operator Contact',
  'operator@boardscape.local'
)
ON CONFLICT (organization_id) DO NOTHING;

-- One Site with Two Faces (Maitama / Shehu Shagari Way)
INSERT INTO sites (id, public_id, location, latitude, longitude, gps_accuracy_meters, address, road_name, district, corridor, structure_type, created_by)
VALUES (
  '40000000-0000-0000-0000-000000000001',
  'ABJ-DEV-001',
  ST_SetSRID(ST_MakePoint(7.4951, 9.0765), 4326)::geography,
  9.0765,
  7.4951,
  8.5,
  'Shehu Shagari Way by Transcorp Junction (Dev Fixture)',
  'Shehu Shagari Way',
  'Maitama',
  'Maitama / Mabushi',
  'unipole',
  '20000000-0000-0000-0000-000000000002'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faces (id, site_id, slug, label, format, width_meters, height_meters, azimuth_deg, illumination, road_direction, state, last_confirmed_at, published_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'maitama-shehu-shagari-dev-f1', 'Shehu Shagari Unipole — Face A (Inbound)', 'unipole', 12.0, 4.0, 90, 'frontlit', 'Inbound CBD', 'published', now(), now()),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'maitama-shehu-shagari-dev-f2', 'Shehu Shagari Unipole — Face B (Outbound)', 'unipole', 12.0, 4.0, 270, 'frontlit', 'Outbound Maitama', 'verified_private', now(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Survey & Listing Authorization
INSERT INTO surveys (id, sync_key, site_id, observer_id, recorded_at, gps_accuracy_meters, duplicate_review_status, reviewed_by, reviewed_at)
VALUES (
  '60000000-0000-0000-0000-000000000001',
  'srv_dev_fixture_001',
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  now(),
  8.5,
  'marked_distinct',
  '20000000-0000-0000-0000-000000000001',
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_authorizations (id, face_id, operator_org_id, grant_type, marketing_scope, evidence_path, verified_by, is_active)
VALUES
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'written_agreement', 'non_exclusive', 'private-auth/dev-agreement.pdf', '20000000-0000-0000-0000-000000000001', true),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'written_agreement', 'non_exclusive', 'private-auth/dev-agreement.pdf', '20000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
