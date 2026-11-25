-- 0002_admin_module.sql (Additive migration for Boardscape Administration Module)

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'platform_admin';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_reason text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE listing_authorizations
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE permit_records
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (key, value)
VALUES
  ('platform_identity', '{"platformName":"boardscape","pilotRegion":"Abuja, FCT","supportEmail":"ops@boardscape.ng"}'::jsonb),
  ('feature_flags', '{"publicAtlasEnabled":true,"publicBriefIntakeEnabled":true,"fieldOfflineQueueEnabled":true,"operatorPortalEnabled":true}'::jsonb),
  ('operational_defaults', '{"surveyDuplicateRadiusMeters":50,"maxGpsWarningMeters":30,"quoteValidityDays":14}'::jsonb)
ON CONFLICT (key) DO NOTHING;
