# Boardscape Testing Strategy

## Test Suites

1. **Unit Tests (`tests/unit/*.test.ts`)** via Vitest:
   - State machine transitions (`inventory`, `quotes`, `campaigns`)
   - Booking date overlap & exclusivity invariants (`bookings`)
   - Money formatting & kobo calculations (`lib/money`)
   - Intelligence provenance validation (`intelligence`)
   - Authorization policy guards (`identity`)
   - Idempotency key & duplicate coordinate distance checks (`surveys`, `geospatial`)
2. **Integration Tests (`tests/integration/*.test.ts`)** via Vitest:
   - Tenant isolation (Org A cannot read/mutate Org B proposals, campaigns, or private operator data)
   - PostGIS bounding-box query contracts
   - Survey idempotent sync (`sync_key` replay protection)
3. **End-to-End Tests (`tests/e2e/*.spec.ts`)** via Playwright:
   - Public brief submission → CRM lead creation
   - Atlas filtering, detail view, shortlist persistence
   - Field Survey PWA offline draft → sync queue
   - Studio verification → publication → proposal → booking → campaign proof → report

## Running Tests (requires Node.js on PATH)
```bash
npm install
npm run typecheck
npm run test
npm run test:e2e
```
