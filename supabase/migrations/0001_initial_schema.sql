-- Boardscape Initial Schema (Abuja Pilot)
-- Enables PostGIS and creates core domain tables with strict site/face separation,
-- integer minor units (NGN kobo), and provenance tracking.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE org_type AS ENUM ('agency', 'client', 'operator');

CREATE TYPE app_role AS ENUM (
  'admin_finance',
  'sales_account_manager',
  'media_planner',
  'surveyor',
  'verifier_ops',
  'campaign_manager',
  'client_user',
  'operator_user'
);

CREATE TYPE face_state AS ENUM (
  'draft',
  'surveyed',
  'awaiting_operator',
  'verified_private',
  'published',
  'suspended',
  'archived'
);

CREATE TYPE face_format AS ENUM (
  'static_billboard',
  'unipole',
  'gantry',
  'rooftop',
  'wall_drape',
  'digital_led',
  'street_furniture'
);

CREATE TYPE source_type AS ENUM (
  'FIELD_OBSERVED',
  'OPERATOR_PROVIDED',
  'BOARDSCAPE_REVIEWED',
  'THIRD_PARTY_LICENSED',
  'MODEL_ESTIMATED'
);

CREATE TYPE quote_status AS ENUM (
  'request_received',
  'qualifying',
  'awaiting_operator_quote',
  'draft_proposal',
  'sent_to_client',
  'client_accepted',
  'supplier_confirmed',
  'booked',
  'revision_requested',
  'rejected',
  'expired',
  'cancelled'
);

CREATE TYPE campaign_status AS ENUM (
  'draft',
  'approved',
  'preproduction',
  'ready_to_launch',
  'installation_in_progress',
  'live',
  'completed',
  'reported',
  'blocked',
  'paused',
  'cancelled',
  'makegood_required'
);

-- 1. Identity & Organizations
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type org_type NOT NULL,
  slug text UNIQUE NOT NULL,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id, role)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(organization_id);

-- 2. Sites & Faces (Billboard Inventory)
CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text UNIQUE NOT NULL,
  location geography(Point, 4326) NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  gps_accuracy_meters numeric(8,2),
  address text NOT NULL,
  road_name text NOT NULL,
  district text NOT NULL,
  corridor text,
  structure_type text NOT NULL DEFAULT 'static_structure',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sites_location ON sites USING GIST (location);
CREATE INDEX idx_sites_district ON sites(district);

CREATE TABLE faces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  format face_format NOT NULL DEFAULT 'static_billboard',
  width_meters numeric(6,2) NOT NULL CHECK (width_meters > 0),
  height_meters numeric(6,2) NOT NULL CHECK (height_meters > 0),
  azimuth_deg integer NOT NULL CHECK (azimuth_deg >= 0 AND azimuth_deg <= 359),
  illumination text NOT NULL DEFAULT 'none',
  obstruction_level text NOT NULL DEFAULT 'clear',
  road_direction text NOT NULL,
  state face_state NOT NULL DEFAULT 'draft',
  public_summary text,
  public_image_path text,
  source_type source_type NOT NULL DEFAULT 'FIELD_OBSERVED',
  last_confirmed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_faces_site ON faces(site_id);
CREATE INDEX idx_faces_state ON faces(state);
CREATE INDEX idx_faces_format ON faces(format);

-- 3. Field Surveys (Idempotent offline sync)
CREATE TABLE surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_key text UNIQUE NOT NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  observer_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL,
  gps_accuracy_meters numeric(8,2),
  displayed_operator_name text,
  displayed_operator_contact text,
  condition_notes text,
  device_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  duplicate_review_status text NOT NULL DEFAULT 'pending',
  duplicate_of_site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  review_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE survey_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  face_id uuid REFERENCES faces(id) ON DELETE SET NULL,
  storage_bucket text NOT NULL DEFAULT 'survey-private',
  storage_path text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  is_public_derived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Operators, Listing Authorizations, Rate Cards & Availability
CREATE TABLE operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  onboarding_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

CREATE TABLE listing_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  operator_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  grant_type text NOT NULL,
  marketing_scope text NOT NULL DEFAULT 'non_exclusive',
  evidence_path text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  verified_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_face ON listing_authorizations(face_id);
CREATE INDEX idx_auth_org ON listing_authorizations(operator_org_id);

CREATE TABLE rate_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  operator_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  price_minor bigint NOT NULL CHECK (price_minor >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  duration_unit text NOT NULL DEFAULT 'monthly',
  is_publishable boolean NOT NULL DEFAULT false,
  source_type source_type NOT NULL DEFAULT 'OPERATOR_PROVIDED',
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  valid_until timestamptz,
  confirmed_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE availability_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  operator_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  availability_status text NOT NULL DEFAULT 'unconfirmed',
  available_from date,
  available_to date,
  confirmed_by_name text,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Compliance Records (Permits & Vetting - no govt certification claim)
CREATE TABLE permit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  face_id uuid REFERENCES faces(id) ON DELETE CASCADE,
  operator_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claimed_authority text NOT NULL,
  issuer text NOT NULL,
  reference_number text,
  expires_at date,
  document_path text,
  review_status text NOT NULL DEFAULT 'evidence_missing',
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. CRM, Leads, Briefs & Shortlists
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  source text NOT NULL DEFAULT 'website_brief',
  status text NOT NULL DEFAULT 'new',
  owner_id uuid,
  follow_up_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaign_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  client_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  objective text NOT NULL,
  target_districts text[] NOT NULL DEFAULT '{}',
  preferred_formats text[] NOT NULL DEFAULT '{}',
  budget_min_minor bigint,
  budget_max_minor bigint,
  start_date date,
  end_date date,
  creative_needed boolean NOT NULL DEFAULT false,
  consent_to_contact boolean NOT NULL DEFAULT true,
  source_face_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Abuja Shortlist',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shortlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortlist_id uuid NOT NULL REFERENCES shortlists(id) ON DELETE CASCADE,
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shortlist_id, face_id)
);

-- 7. Quotes, Proposals & Bookings
CREATE TABLE quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES campaign_briefs(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  operator_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  flight_start date NOT NULL,
  flight_end date NOT NULL,
  status quote_status NOT NULL DEFAULT 'request_received',
  operator_rate_minor bigint,
  operator_confirmed_by text,
  operator_confirmed_at timestamptz,
  operator_quote_expires_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  client_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft_proposal',
  currency text NOT NULL DEFAULT 'NGN',
  media_subtotal_minor bigint NOT NULL DEFAULT 0,
  production_subtotal_minor bigint NOT NULL DEFAULT 0,
  agency_fee_minor bigint NOT NULL DEFAULT 0,
  tax_minor bigint NOT NULL DEFAULT 0,
  total_minor bigint NOT NULL DEFAULT 0,
  assumptions text NOT NULL,
  valid_until timestamptz NOT NULL,
  sent_at timestamptz,
  accepted_at timestamptz,
  accepted_by uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, version)
);

CREATE TABLE proposal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE RESTRICT,
  quote_request_id uuid REFERENCES quote_requests(id) ON DELETE SET NULL,
  flight_start date NOT NULL,
  flight_end date NOT NULL,
  media_cost_minor bigint NOT NULL,
  production_cost_minor bigint NOT NULL DEFAULT 0,
  service_fee_minor bigint NOT NULL DEFAULT 0,
  rate_source text NOT NULL,
  rate_valid_until timestamptz
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  proposal_line_id uuid NOT NULL REFERENCES proposal_lines(id) ON DELETE RESTRICT,
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE RESTRICT,
  client_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  operator_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_exclusive boolean NOT NULL DEFAULT true,
  client_accepted_at timestamptz NOT NULL,
  supplier_confirmed_at timestamptz NOT NULL,
  supplier_confirmed_by text NOT NULL,
  confirmed_by_staff uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_bookings_face_dates ON bookings(face_id, start_date, end_date);

-- 8. Campaigns, Tasks, Creative Assets & Proof of Posting
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  client_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name text NOT NULL,
  owner_id uuid NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date date NOT NULL,
  end_date date NOT NULL,
  creative_brief text,
  risk_flags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaign_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  stage text NOT NULL,
  assigned_to uuid,
  due_date date,
  is_required boolean NOT NULL DEFAULT true,
  completed_at timestamptz,
  waived_by uuid,
  waiver_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE creative_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  storage_path text NOT NULL,
  vetting_reference text,
  approval_status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posting_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE RESTRICT,
  storage_path text NOT NULL,
  captured_at timestamptz NOT NULL,
  latitude double precision,
  longitude double precision,
  submitted_by uuid NOT NULL,
  issue_flag text,
  review_status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Advertising Intelligence (Observations separated from modelled estimates)
CREATE TABLE traffic_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  observer_id uuid NOT NULL,
  observed_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  vehicle_count integer NOT NULL DEFAULT 0 CHECK (vehicle_count >= 0),
  pedestrian_count integer NOT NULL DEFAULT 0 CHECK (pedestrian_count >= 0),
  vehicle_direction text NOT NULL,
  observation_method text NOT NULL,
  weather_conditions text,
  road_speed_estimate text,
  source_type source_type NOT NULL DEFAULT 'FIELD_OBSERVED',
  confidence text NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE intelligence_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id uuid NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value_numeric numeric(12,2) NOT NULL,
  method_version text NOT NULL,
  source_type source_type NOT NULL DEFAULT 'MODEL_ESTIMATED',
  confidence text NOT NULL,
  assumptions text NOT NULL,
  measured_at timestamptz NOT NULL,
  ingested_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  reviewer_id uuid
);

-- 10. Audit Events & Notification Outbox
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  source text NOT NULL DEFAULT 'api',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_events(created_at DESC);

CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  recipient_user_id uuid,
  recipient_email text,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
