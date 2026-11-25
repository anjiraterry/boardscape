# Architecture Decision Records (ADRs)

## ADR-001: Next.js Modular Monolith over Microservices
- **Status**: Accepted
- **Context**: Abuja pilot needs rapid iteration across 5 surfaces (agency site, Atlas, Studio, Field PWA, Operator workspace) with strict data boundaries.
- **Decision**: Single Next.js 15 App Router TypeScript application with isolated `src/modules/<domain>` folders, PostgreSQL/PostGIS via Supabase, and Inngest for async jobs.
- **Consequences**: Zero network overhead between domains, atomic transactions across leads/proposals/bookings, and clear extraction seams if spatial/AI compute scales later.

## ADR-002: Separate `sites` and `faces` Entities
- **Status**: Accepted
- **Context**: A single billboard gantry or monopole in Abuja commonly carries 2–4 distinct faces with different road approaches, sizes, and operators/prices.
- **Decision**: Store physical coordinates (`geography(Point,4326)`) on `sites` and commercial/visibility/state attributes on `faces`.
- **Consequences**: Accurate multi-face surveys, independent booking exclusivity per face, and clean duplicate detection at the site level.

## ADR-003: Integer Minor Units (NGN Kobo) for All Financial Values
- **Status**: Accepted
- **Context**: Floating-point arithmetic introduces rounding drift in media spend, agency fees, and taxes.
- **Decision**: Store all prices, fees, and totals as `bigint` kobo (`price_minor`) with explicit `currency` (`NGN`).
- **Consequences**: Deterministic proposal and margin calculations.

## ADR-004: Honest Provenance for Intelligence & Compliance
- **Status**: Accepted
- **Context**: OOH traffic counts are not validated impressions, and operator-supplied permits are not government certification by Boardscape.
- **Decision**: Enforce `source_type` enums, `measured_at`/`valid_until` timestamps, and non-certification UI labels at schema and component levels.
