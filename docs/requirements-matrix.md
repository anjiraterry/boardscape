# PRD Requirements-to-Implementation Matrix (Post-Audit)

> **Honest Status Note**: All P0 requirements below are `IMPLEMENTED` in source code, SQL migrations, and test files, **not** `TESTED`, because Node.js/npm/Supabase CLI execution is blocked inside the sandbox (`C:\nodejs` and `C:\Users\tagbo\nvm` return `Access is denied`, and `BypassSandbox` is blocked by policy).

| ID | Feature Name | Priority | Status | Associated Files | Test Coverage (Written, Not Executed) | Blockers |
|---|---|---|---|---|---|---|
| FR-001 | Organization-based authentication & RBAC | P0 | IMPLEMENTED | `src/modules/identity/*`, `src/lib/auth/*`, `src/app/login/page.tsx`, `src/app/auth/callback/route.ts`, `supabase/migrations/0002_rls_policies.sql` | `tests/integration/tenant-isolation.test.ts` | Node & Supabase execution |
| FR-002 | Agency contact and campaign brief | P0 | IMPLEMENTED | `src/app/(marketing)/brief/*`, `src/app/api/briefs/route.ts`, `src/modules/crm/*` | `tests/e2e/core-flows.spec.ts` | Node/Playwright execution |
| FR-003 | Content and claim controls | P0 | IMPLEMENTED | `src/app/(marketing)/*` | `tests/e2e/core-flows.spec.ts` | Node/Playwright execution |
| FR-004 | Mobile survey capture | P0 | IMPLEMENTED | `src/app/(field)/field/surveys/new/page.tsx`, `src/modules/surveys/*` | `tests/unit/surveys-geospatial.test.ts` | Node execution |
| FR-005 | Separate site and face records | P0 | IMPLEMENTED | `supabase/migrations/0001_initial_schema.sql`, `src/modules/inventory/*` | `tests/unit/surveys-geospatial.test.ts` | Live DB migration |
| FR-006 | Offline survey queue | P0 | IMPLEMENTED | `src/lib/offline-queue.ts`, `src/app/(field)/field/sync/page.tsx`, `src/app/api/field/surveys/route.ts` | `tests/e2e/core-flows.spec.ts` | Node/Browser execution |
| FR-007 | Duplicate and coordinate quality review | P0 | IMPLEMENTED | `supabase/migrations/0003_spatial_functions.sql`, `src/app/api/studio/surveys/[id]/review/route.ts`, `src/app/(studio)/studio/surveys/page.tsx` | `tests/unit/surveys-geospatial.test.ts` | Live PostGIS execution |
| FR-008 | Operator authorization and documentation | P0 | IMPLEMENTED | `src/modules/operators/*`, `src/app/api/studio/authorizations/route.ts`, `src/app/(studio)/studio/operators/page.tsx` | `tests/unit/inventory.test.ts` | Live DB |
| FR-009 | Publication moderation | P0 | IMPLEMENTED | `src/modules/inventory/state-machine.ts`, `src/app/api/studio/faces/[id]/publish/route.ts`, `src/components/studio/publish-face-button.tsx` | `tests/unit/inventory.test.ts` | Node execution |
| FR-010 | Map/list inventory discovery | P0 | IMPLEMENTED | `src/app/(atlas)/atlas/page.tsx`, `src/components/atlas/*`, `src/app/api/atlas/faces/route.ts` | `tests/e2e/core-flows.spec.ts` | Node/Playwright execution |
| FR-011 | Listing detail and data freshness | P0 | IMPLEMENTED | `src/app/(atlas)/atlas/[slug]/page.tsx` | `tests/e2e/core-flows.spec.ts` | Node execution |
| FR-012 | Shortlists and comparison | P0 | IMPLEMENTED | `src/app/(atlas)/shortlist/page.tsx` | `tests/e2e/core-flows.spec.ts` | Node execution |
| FR-013 | Campaign briefs from Atlas | P0 | IMPLEMENTED | `src/app/(atlas)/shortlist/page.tsx`, `src/app/api/briefs/route.ts` | `tests/e2e/core-flows.spec.ts` | Node execution |
| FR-015 | Lead CRM | P0 | IMPLEMENTED | `src/modules/crm/*`, `src/app/(studio)/studio/leads/page.tsx` | — | Live DB |
| FR-016 | Supplier quote request | P0 | IMPLEMENTED | `src/modules/quotes/*`, `src/app/(operator)/operator/requests/page.tsx` | `tests/unit/quotes-bookings.test.ts` | Live DB |
| FR-017 | Revisioned client proposals | P0 | IMPLEMENTED | `src/modules/quotes/*`, `src/app/api/client/proposals/[id]/respond/route.ts`, `src/app/(studio)/studio/quotes/page.tsx`, `src/app/(atlas)/client/page.tsx` | `tests/unit/quotes-bookings.test.ts` | Node execution |
| FR-018 | Manual booking confirmation | P0 | IMPLEMENTED | `src/modules/bookings/*`, `src/app/api/studio/bookings/route.ts` | `tests/unit/quotes-bookings.test.ts` | Node execution |
| FR-020 | Campaign workspace | P0 | IMPLEMENTED | `src/modules/campaigns/*`, `src/app/(studio)/studio/campaigns/page.tsx` | `tests/unit/campaigns-intelligence.test.ts` | Node execution |
| FR-021 | Creative and regulatory approval checklist | P0 | IMPLEMENTED | `src/modules/campaigns/state-machine.ts` | `tests/unit/campaigns-intelligence.test.ts` | Node execution |
| FR-022 | Proof-of-posting collection | P0 | IMPLEMENTED | `src/app/api/studio/campaigns/[id]/proofs/route.ts`, `src/modules/campaigns/*` | `tests/unit/campaigns-intelligence.test.ts` | Node execution |
| FR-023 | Campaign report export | P0 | IMPLEMENTED | `src/app/api/studio/campaigns/[id]/report/route.ts` | `tests/unit/campaigns-intelligence.test.ts` | Node execution |
| FR-025 | Compliance document register | P0 | IMPLEMENTED | `src/modules/compliance/*`, `src/app/(studio)/studio/compliance/page.tsx` | — | Node execution |
| FR-026 | Audit log and safe exports | P0 | IMPLEMENTED | `src/modules/audit/*`, `src/app/(studio)/studio/audit/page.tsx` | — | Node execution |
| FR-027 | Observed traffic and site quality fields | P0 | IMPLEMENTED | `src/modules/intelligence/*` | `tests/unit/campaigns-intelligence.test.ts` | Node execution |
| FR-030 | Operational analytics | P0 | IMPLEMENTED | `src/app/(studio)/studio/page.tsx` | — | Node execution |
| FR-031 | Dedicated Platform Administration Module (`/admin`) | P0 | IMPLEMENTED | `src/app/(admin)/admin/*`, `src/app/api/admin/*`, `src/modules/identity/*`, `db/migrations/0002_admin_module.sql` | `tests/unit/admin-rbac.test.ts` | — |
