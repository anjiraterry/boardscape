# Boardscape Implementation Plan

Executed incrementally following the PRD P0 scope:

- **Sprint 0 (Foundation)**: Repo configuration, Next.js modular monolith structure, Supabase PostgreSQL/PostGIS + RLS migrations, Inngest client, design system tokens & UI primitives, `lib/` helpers, and ADRs.
- **Sprint 1 (Survey & Inventory)**: `sites` & `faces` domain modules, Field Survey PWA (`/field/*`) with IndexedDB offline drafts, idempotent `sync_key` upload, duplicate coordinate warning, and Studio survey review (`/studio/surveys`).
- **Sprint 2 (Atlas)**: Operator authorization gating, face publication moderation, MapLibre GL JS + synchronized list discovery (`/atlas`), detail pages (`/atlas/[slug]`), shortlists (`/shortlist`), and brief initiation.
- **Sprint 3 (Agency Website & Commercial Workflow)**: Editorial agency website (`/`, `/about`, `/services`, `/outdoor-advertising`, `/atlas-overview`, `/contact`, `/brief`, `/privacy`, `/terms`), CRM lead intake (`/studio/leads`), operator quote requests, versioned proposals (`/studio/quotes`, `/client/*`).
- **Sprint 4 (Campaign Operations & Compliance)**: Exclusive booking overlap checks, campaign workspace (`/studio/campaigns`), creative approval checklist, geotagged proof-of-posting, client report export, compliance document register (`/studio/compliance`), and operator workspace (`/operator/*`).
- **Sprint 5 (Production Hardening)**: Operational analytics (`/studio`), audit log viewer (`/studio/audit`), rate limiting, Sentry boundary, unit/integration/E2E test suites, and documentation.
