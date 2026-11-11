# 01 — Technical architecture

_Source: blueprint §7._

**Recommended approach:** a modular web application with a relational core, private media storage,
clear access policies and an API boundary. Build the smallest reliable platform first; avoid
microservices and expensive AI features in the MVP.

## Stack & responsibilities (§7)

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web application | Next.js + TypeScript | Responsive public site + authenticated role-based workspaces |
| UI system | Tailwind CSS + accessible components | Layouts, forms, tables, dialogs, navigation, responsive behaviour |
| Database | Supabase Postgres | Relational records, constraints, indexes, migrations, reporting |
| Authentication | Supabase Auth | Email/password, invitations, sessions, optional MFA |
| Authorisation | Postgres Row Level Security | Organisation- and player-level access at the data layer |
| File storage | Supabase Storage (private buckets) | Permission-controlled images/documents; short-lived signed URLs |
| Video | Dedicated video provider | Upload, transcoding, playback, thumbnails, timestamped review links |
| Hosting | Vercel | Preview deploys, production hosting, env config |
| Email | Transactional provider | Invitations, verification, notifications, access updates |
| Monitoring | Error tracking + uptime + logs | Detect failures, trace issues, monitor health |
| Analytics | Privacy-conscious product analytics | Measure adoption without exposing sensitive player data |

## System diagram (§7)

```
Players / Scouts / Academies / Recruiters / Admins
        │
        ▼
Next.js Web App  (responsive, role-based UI)          ──  src/app, src/components
        │
        ▼
Server actions / API validation layer                 ──  server components + server actions
        │
        ▼
Supabase Auth ── Postgres + RLS policies              ──  supabase/migrations
        │
        ▼
Private Storage ── Video Provider ── Email
        │
        ▼
Logs / Monitoring / Audit events                      ──  audit_logs + provider
```

## Architecture principles (§7)

1. Enforce permissions in **database policies**, not only by hiding buttons in the interface.
2. Keep service-role keys and secrets on the **server**; never expose them in browser code.
3. Validate every write on the server and apply **database constraints** for critical relationships.
4. Use **signed, short-lived links** for private media and documents.
5. Separate **public** player profile fields from **private** identity, contact, medical and
   contract records.
6. Use **migrations and version control** for schema changes; maintain development, staging and
   production environments.
7. **Back up** the database and test restoration before relying on the platform operationally.
8. Keep a **human review** step before a player is marked verified or shared with external
   recruiters.

## Where this lives in the repo

| Principle | Implementation |
| --- | --- |
| DB-level permissions | `supabase/migrations/0008_rls_helpers_and_policies.sql` |
| Server vs browser Supabase clients | `src/lib/supabase/{server,client}.ts` |
| Service-role isolation | `createServiceRoleClient()` in `src/lib/supabase/server.ts` (server only) |
| Session refresh | `src/middleware.ts` |
| Public vs private fields | `players` (public/football) vs `verification_records` (restricted) in the schema |
| Migrations / environments | `supabase/migrations`, `supabase/config.toml` |

## Client types

- **Browser client** (`createClient` in `client.ts`) — uses the public anon key only; every query
  is constrained by RLS.
- **Server client** (`createClient` in `server.ts`) — runs as the signed-in user via request
  cookies; RLS applies.
- **Service-role client** (`createServiceRoleClient`) — bypasses RLS; used only by trusted server
  actions such as verification workflows. Never import into browser code.

## Media & video

Large video is **never** stored in Postgres. `media_assets` holds a `storage_provider` +
`asset_reference` pointer and a `consent_id`; playback uses the video provider's timestamped review
links. Documents/images go to private Supabase Storage buckets, served via short-lived signed URLs.
