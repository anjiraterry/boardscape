-- Boardscape Row Level Security (RLS) Policies
-- Enforces strict organization-scoped tenant isolation and public/private boundary.

-- Helper functions
CREATE OR REPLACE FUNCTION auth_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION is_boardscape_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships m
    JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND o.type = 'agency'
      AND m.role IN (
        'admin_finance',
        'sales_account_manager',
        'media_planner',
        'surveyor',
        'verifier_ops',
        'campaign_manager'
      )
  );
$$;

CREATE OR REPLACE FUNCTION has_staff_role(allowed_roles app_role[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships m
    JOIN organizations o ON o.id = m.organization_id
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND o.type = 'agency'
      AND m.role = ANY(allowed_roles)
  );
$$;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;

-- Organizations & Memberships
CREATE POLICY "Users see own orgs or staff sees all"
  ON organizations FOR SELECT
  USING (id IN (SELECT auth_org_ids()) OR is_boardscape_staff());

CREATE POLICY "Admin manages organizations"
  ON organizations FOR ALL
  USING (has_staff_role(ARRAY['admin_finance']::app_role[]))
  WITH CHECK (has_staff_role(ARRAY['admin_finance']::app_role[]));

CREATE POLICY "Users see own memberships or admin sees all"
  ON memberships FOR SELECT
  USING (user_id = auth.uid() OR has_staff_role(ARRAY['admin_finance']::app_role[]));

CREATE POLICY "Admin manages memberships"
  ON memberships FOR ALL
  USING (has_staff_role(ARRAY['admin_finance']::app_role[]))
  WITH CHECK (has_staff_role(ARRAY['admin_finance']::app_role[]));

-- Public Atlas Inventory (ONLY published faces and their parent sites)
CREATE POLICY "Public can read sites with published faces"
  ON sites FOR SELECT
  USING (
    is_boardscape_staff()
    OR EXISTS (
      SELECT 1 FROM faces f WHERE f.site_id = sites.id AND f.state = 'published'
    )
  );

CREATE POLICY "Staff manages sites"
  ON sites FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Public can read published faces"
  ON faces FOR SELECT
  USING (
    state = 'published'
    OR is_boardscape_staff()
    OR EXISTS (
      SELECT 1 FROM listing_authorizations la
      WHERE la.face_id = faces.id
        AND la.is_active = true
        AND la.operator_org_id IN (SELECT auth_org_ids())
    )
  );

CREATE POLICY "Staff manages faces"
  ON faces FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Surveys (Staff + Surveyors)
CREATE POLICY "Staff and surveyors manage surveys"
  ON surveys FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Staff manages survey attachments"
  ON survey_attachments FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Operators, Authorizations, Rate Cards, Availability, Permits
CREATE POLICY "Staff and owning operator read operator record"
  ON operators FOR SELECT
  USING (is_boardscape_staff() OR organization_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff manages operators"
  ON operators FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Staff and owning operator read authorizations"
  ON listing_authorizations FOR SELECT
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff manages listing authorizations"
  ON listing_authorizations FOR ALL
  USING (has_staff_role(ARRAY['admin_finance', 'verifier_ops']::app_role[]))
  WITH CHECK (has_staff_role(ARRAY['admin_finance', 'verifier_ops']::app_role[]));

CREATE POLICY "Staff and owning operator read rate cards"
  ON rate_cards FOR SELECT
  USING (
    is_boardscape_staff()
    OR operator_org_id IN (SELECT auth_org_ids())
    OR (is_publishable = true AND EXISTS (
      SELECT 1 FROM faces f WHERE f.id = rate_cards.face_id AND f.state = 'published'
    ))
  );

CREATE POLICY "Staff and owning operator manage rate cards"
  ON rate_cards FOR ALL
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()))
  WITH CHECK (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff and owning operator manage availability"
  ON availability_records FOR ALL
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()))
  WITH CHECK (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff and owning operator read permits"
  ON permit_records FOR SELECT
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff and owning operator manage permits"
  ON permit_records FOR ALL
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()))
  WITH CHECK (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

-- Shortlists (Owner-scoped)
CREATE POLICY "Users manage own shortlists"
  ON shortlists FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own shortlist items"
  ON shortlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM shortlists s WHERE s.id = shortlist_items.shortlist_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shortlists s WHERE s.id = shortlist_items.shortlist_id AND s.user_id = auth.uid()));

-- Leads & Briefs
CREATE POLICY "Staff and owning client org read briefs"
  ON campaign_briefs FOR SELECT
  USING (is_boardscape_staff() OR client_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff manages briefs"
  ON campaign_briefs FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Staff manages leads"
  ON leads FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Quote Requests, Proposals & Bookings
CREATE POLICY "Staff and owning operator manage quote requests"
  ON quote_requests FOR ALL
  USING (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()))
  WITH CHECK (is_boardscape_staff() OR operator_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Client org reads own proposals"
  ON proposals FOR SELECT
  USING (is_boardscape_staff() OR client_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff manages proposals"
  ON proposals FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Client org reads own proposal lines"
  ON proposal_lines FOR SELECT
  USING (
    is_boardscape_staff()
    OR EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_lines.proposal_id
        AND p.client_org_id IN (SELECT auth_org_ids())
    )
  );

CREATE POLICY "Staff manages proposal lines"
  ON proposal_lines FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Scoped booking visibility"
  ON bookings FOR SELECT
  USING (
    is_boardscape_staff()
    OR client_org_id IN (SELECT auth_org_ids())
    OR operator_org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "Staff manages bookings"
  ON bookings FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Campaigns, Tasks, Creative Assets & Proofs
CREATE POLICY "Client org reads own campaigns"
  ON campaigns FOR SELECT
  USING (is_boardscape_staff() OR client_org_id IN (SELECT auth_org_ids()));

CREATE POLICY "Staff manages campaigns"
  ON campaigns FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Client org reads own campaign tasks; staff manages"
  ON campaign_tasks FOR SELECT
  USING (
    is_boardscape_staff()
    OR EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_tasks.campaign_id
        AND c.client_org_id IN (SELECT auth_org_ids())
    )
  );

CREATE POLICY "Staff manages campaign tasks"
  ON campaign_tasks FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Client org reads own creative assets; staff manages"
  ON creative_assets FOR SELECT
  USING (
    is_boardscape_staff()
    OR EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = creative_assets.campaign_id
        AND c.client_org_id IN (SELECT auth_org_ids())
    )
  );

CREATE POLICY "Staff manages creative assets"
  ON creative_assets FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Client org sees approved proofs for own campaigns"
  ON posting_proofs FOR SELECT
  USING (
    is_boardscape_staff()
    OR (
      review_status = 'approved'
      AND EXISTS (
        SELECT 1 FROM campaigns c
        WHERE c.id = posting_proofs.campaign_id
          AND c.client_org_id IN (SELECT auth_org_ids())
      )
    )
  );

CREATE POLICY "Staff manages posting proofs"
  ON posting_proofs FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Intelligence (Staff manages; public read only via curated projections)
CREATE POLICY "Staff manages traffic observations"
  ON traffic_observations FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

CREATE POLICY "Staff manages intelligence estimates"
  ON intelligence_estimates FOR ALL
  USING (is_boardscape_staff())
  WITH CHECK (is_boardscape_staff());

-- Audit Events & Notification Outbox
CREATE POLICY "Privileged staff read audit events"
  ON audit_events FOR SELECT
  USING (has_staff_role(ARRAY['admin_finance', 'verifier_ops']::app_role[]));

CREATE POLICY "Admin manages notification outbox"
  ON notification_outbox FOR ALL
  USING (has_staff_role(ARRAY['admin_finance']::app_role[]))
  WITH CHECK (has_staff_role(ARRAY['admin_finance']::app_role[]));
