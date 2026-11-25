# Environment Setup

Copy `.env.example` to `.env.local` and configure:

1. **Supabase**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose in `NEXT_PUBLIC_*` or client components)
2. **MapLibre**:
   - `NEXT_PUBLIC_MAPLIBRE_STYLE_URL` (defaults to MapLibre demo tiles; replace with licensed production basemap style for Abuja pilot)
3. **Inngest**:
   - `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
4. **Sentry**:
   - `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

## Local Database Migrations
Apply SQL files in `supabase/migrations/` in order (`0001_initial_schema.sql`, `0002_rls_policies.sql`, `0003_spatial_functions.sql`) via Supabase CLI (`supabase db push`) or Supabase SQL Editor.
