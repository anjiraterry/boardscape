# Boardscape Architecture

**System:** Boardscape Operating Platform + Boardscape Atlas  
**Architecture Style:** Next.js Modular Monolith (App Router + TypeScript)  
**Initial Market:** Abuja, FCT, Nigeria

## 1. High-Level Topology

```
src/
├── app/
│   ├── (marketing)/     # Corporate agency website
│   ├── (atlas)/         # Map-first discovery, face details, shortlists, client portal
│   ├── (studio)/        # Internal agency operations dashboard
│   ├── (field)/         # Mobile-first Field Survey PWA
│   ├── (operator)/      # Limited P0 operator workspace
│   └── api/             # Thin HTTP/Webhook/Inngest entrypoints
├── modules/             # Strictly isolated business domains
│   ├── identity/        # Organizations, memberships, active org, RBAC
│   ├── inventory/       # Sites, faces, lifecycle state machine, publication
│   ├── surveys/         # Field capture, offline sync idempotency, duplicate review
│   ├── geospatial/      # PostGIS bbox, Abuja districts, azimuth utilities
│   ├── operators/       # Operator orgs, authorizations, rate cards, availability
│   ├── crm/             # Leads, briefs, contacts, pipeline
│   ├── quotes/          # Supplier quote requests, versioned proposals
│   ├── bookings/        # Manual booking confirmations, exclusive date overlap checks
│   ├── campaigns/       # Campaign workspaces, tasks, creative checklists, proofs, reports
│   ├── compliance/      # Permit & vetting document register (no govt certification claim)
│   ├── intelligence/    # Traffic observations, provenance, experimental visibility index
│   ├── audit/           # Immutable audit trail for high-risk commercial/approval actions
│   ├── notifications/   # Outbox pattern + idempotent reminder dispatch
│   └── billing/         # P1-reserved types & boundaries (NGN kobo minor units)
├── lib/                 # Cross-cutting infrastructure (auth, db, logger, money, rate-limit)
├── inngest/             # Durable background jobs
└── components/          # Shared UI primitives and domain-agnostic design system
```

## 2. Core Architectural Invariants

1. **Site vs. Face Separation**: A physical structure (`sites`) holds PostGIS `geography(Point,4326)` and road/district metadata; each advertising surface (`faces`) has independent format, dimensions, azimuth (0–359°), illumination, pricing, availability, and lifecycle state.
2. **Public vs. Private Data Boundary**: Public Atlas queries only return `published` faces and public-safe site fields. Private operator contacts, internal rates, permit scans, and client commercial proposals remain behind server-side authorization + Supabase RLS.
3. **State Machine Integrity**: Face publication, quote/booking progression, and campaign execution enforce explicit transition rules and preconditions (e.g., client acceptance never implies supplier confirmation).
4. **Financial Precision**: All monetary amounts are stored as integer minor units (`NGN` kobo).
5. **Honest Intelligence & Compliance Labels**: Traffic observations are never relabeled as verified impressions or reach; compliance document review never implies government certification.
