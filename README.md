# Talent Bridge Africa (TBA)

A football **talent intelligence and development platform** for discovering, assessing,
developing and connecting African football talent with credible opportunities.

> **Product principle.** Build a trusted football data and workflow system first — **not** a
> public transfer marketplace, and **not** an automated promise of European placement.

This repository is the engineering foundation generated from the product blueprint
(_Talent Bridge Africa — Platform Product, Technical & Visual Blueprint, Rev 1.1_). It is set up
and ready for full development.

---

## What's in here

| Area | Location | Status |
| --- | --- | --- |
| Next.js + TypeScript + Tailwind app | `src/app`, `src/components` | Scaffolded, builds |
| Brand design tokens (§4) | `tailwind.config.ts`, `src/app/globals.css` | Done |
| Role-based workspaces (§3) | `src/app/{player,scout,academy,recruiter,admin}` | Dashboards scaffolded |
| Supabase schema + RLS + seed (§7, §8, §5A) | `supabase/migrations`, `supabase/seed.sql` | Done, validated |
| Scoring engine — 7 categories incl. Speed (§6) | `src/lib/scoring` | Done, unit-tested |
| Role / permission model (§5 M01) | `src/lib/auth/roles.ts` | Done, unit-tested |
| Developer documentation | `docs/` | Done |
| CI (typecheck, lint, test, build) | `.github/workflows/ci.yml` | Done |

See [`docs/`](./docs) for the full specification derived from the blueprint:

- [00 — Overview & product boundaries](./docs/00-overview.md)
- [01 — Technical architecture](./docs/01-architecture.md)
- [02 — Core data model](./docs/02-data-model.md)
- [03 — Roles & permissions matrix](./docs/03-roles-and-permissions.md)
- [04 — Scoring model (incl. Speed)](./docs/04-scoring-model.md)
- [05 — MVP scope & roadmap](./docs/05-mvp-and-roadmap.md)
- [06 — Security, privacy & governance](./docs/06-security-and-governance.md)
- [07 — Product language guardrails](./docs/07-product-language.md)
- [08 — Academy training & development module](./docs/08-development-module.md)
- [09 — Authentication & invitation onboarding](./docs/09-auth-and-onboarding.md)

---

## Tech stack (§7)

| Layer | Technology |
| --- | --- |
| Web app | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password, invitations, optional MFA) |
| Authorisation | Postgres Row Level Security (RLS) |
| File storage | Supabase Storage, private buckets + signed URLs |
| Video | Dedicated video provider (e.g. Mux / Cloudflare Stream) |
| Hosting | Vercel |
| Email | Transactional provider |
| Monitoring | Error tracking + uptime + structured logs |

---

## Getting started

### Prerequisites

- Node.js **20+**
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for the local database stack)
- Docker (used by the Supabase local stack)

### 1. Install

```bash
npm install
cp .env.example .env.local   # then fill in values
```

### 2. Start the database

```bash
supabase start          # launches local Postgres, Auth, Storage, Studio
supabase db reset       # applies supabase/migrations + supabase/seed.sql
npm run db:types        # regenerate src/types/database.types.ts from the schema
```

Copy the local `API URL` and `anon key` printed by `supabase start` into `.env.local`.

### 3. Run the app

```bash
npm run dev             # http://localhost:3000
```

### Useful scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm test             # vitest (scoring engine + roles)
npm run format       # prettier --write .
npm run db:types     # regenerate Supabase TypeScript types
```

---

## Guardrails every contributor must respect

These come straight from the blueprint (§2, §6, §12, Appendix B) and are **product requirements,
not preferences**:

1. **Private by default.** Passport scans, birth certificates, medical records, private contact
   details and contracts are never shown on public or recruiter-facing profiles.
2. **Permissions live in the database.** RLS is the real access boundary — never rely only on
   hiding UI. See `supabase/migrations/0008_rls_helpers_and_policies.sql`.
3. **Scores are opinions, not truth.** A weighted score is a screening aid, never a FIFA rating or
   a guarantee. "Verified" must never be styled to imply FIFA/transfer approval.
4. **Consent is recorded and withdrawable.** Every external share and media use has a recorded
   lawful basis and consent version.
5. **Human review before verification/sharing.** No automated path marks a player verified or
   shares them externally.
6. **Recruiter access is invite-only, verified, time-limited and logged.** No unrestricted browse
   of the database.

See [`docs/07-product-language.md`](./docs/07-product-language.md) for approved vs. prohibited
language.

---

## Project status & next steps

The foundation (schema, RLS, scoring engine, roles, build pipeline, workspace shells) is complete
and verified, the Supabase project is provisioned, and **authentication + invitation onboarding is
built** (see [docs/09](./docs/09-auth-and-onboarding.md)). The MVP build order (§14, §10) continues:

1. ~~Supabase Auth + invitation flows + route-level gating~~ — **done**.
2. Player registry CRUD + consent capture.
3. Scouting assignment + mobile scouting report writing to `scouting_reports` / `scorecard_ratings`.
4. Reviewer queue (approve / return with comments).
5. Admin dashboard queries for the KPI strip.

> **Before first use:** set `SUPABASE_SERVICE_ROLE_KEY` (for invitation accept), configure Supabase
> Auth Site URL + email provider, and bootstrap the first `super_admin`
> (see [docs/09](./docs/09-auth-and-onboarding.md)).

Track detailed acceptance criteria in [`docs/05-mvp-and-roadmap.md`](./docs/05-mvp-and-roadmap.md).
