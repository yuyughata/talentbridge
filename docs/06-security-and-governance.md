# 06 — Security, privacy & governance

_Source: blueprint §12, plus §2 and §5A H._

TBA handles data about young athletes, some of whom may be minors. Privacy and safeguarding are
product requirements, not afterthoughts.

## Governance checklist (§12)

- [ ] **Data inventory** — document what is collected, why, who can access it, where it is stored
      and how long it is retained.
- [ ] **Informed consent** — explain how profiles, images and videos may be used; record consent
      version and withdrawal (`player_consents`).
- [ ] **Nigeria Data Protection Act** — apply the NDPA and applicable regulations; obtain qualified
      local advice on controller/processor duties and any required registration or assessments.
- [ ] **Data minimisation** — do not collect passport, medical or guardian information unless
      necessary for a defined process.
- [ ] **Sensitive document access** — restrict to designated verification staff; log every access
      and download (`audit_logs`, `verification_records` is staff-only via RLS).
- [ ] **Retention & deletion** — procedures for inactive accounts, expired access, withdrawn
      consent and unsuccessful recruitment enquiries.
- [ ] **Safeguarding policy** — staff code of conduct, reporting channel, rules for communication
      with minors (§5A H).
- [ ] **Independent verification** — verify clubs, recruiters and agents independently; keep agent
      licensing and immigration/transfer eligibility **outside** automated platform claims.
- [ ] **Pre-pilot security review** — RLS tests, storage policy tests, dependency review and backup
      restoration.

## How the codebase supports this

| Requirement | Mechanism |
| --- | --- |
| Permissions at the data layer | RLS on all 33 tables (`0008_...sql`) |
| Private by default | `media_assets.visibility` defaults to `private`; `players` private PII columns |
| Restricted verification docs | `verification_records` is TBA-staff-only; stores a `restricted_document_reference`, not the file |
| Signed, short-lived media links | Supabase Storage signed URLs (to be wired in media upload flow) |
| Consent recorded & withdrawable | `player_consents` with `version`, `granted_at`, `withdrawn_at`, `scope` |
| Time-limited recruiter access | `recruitment_enquiries.access_expiry` + `tba_recruiter_has_player_access()` |
| Audit trail | `audit_logs` (append-only; no UPDATE/DELETE policy) |
| Welfare data isolation | `workload_entries`, `session_observations` academy/staff-only; never recruiter-facing |
| Secrets on the server | `SUPABASE_SERVICE_ROLE_KEY` server-only; never in `NEXT_PUBLIC_*` |

## Youth welfare safeguards (§5A H)

- Age-appropriate training volume/intensity; no adult conditioning loads for children; no heavy
  lifting without qualified supervision.
- Rest days and recovery prompts; modify/stop activity on pain, fatigue, illness; refer health
  concerns to professionals.
- Heat safety: sensible training times, shade, water, breaks; follow local guidance.
- Collect only necessary welfare information; restrict sensitive records; apply retention rules;
  never expose private health/identity information in recruiter-facing profiles.

## RLS test suite (implemented)

`supabase/tests/rls.test.sql` seeds fixtures and asserts row visibility for each role by
impersonating users via `request.jwt.claims` (the mechanism Supabase Auth uses — `auth.uid()` reads
the `sub` claim). Run it locally against a throwaway Postgres with
`supabase/tests/run_rls_tests.sh` (no network, no project), or adapt for `supabase test db`.

Assertions (A1–A12): anonymous sees no players; a scout sees all players (internal assessment
network); an academy coach sees only their academy's players; a TBA reviewer sees all; a recruiter
sees only players they were granted; a player/guardian sees only their own/linked record;
`verification_records` and `audit_logs` are staff-only; a recruiter sees only **shared/public** media
of a granted player, not private; a recruiter cannot insert a player; a scout cannot approve their
own report.

### Bugs this suite caught (and fixed)

- **Scouts had zero player visibility** — `tba_can_view_player` omitted scouts, so the scout
  workspace would show empty lists. Fixed in `0012_scout_player_access.sql` (adds `tba_is_scout`).
- **Broken private-helper references** — moving the SECURITY DEFINER helpers to the `private` schema
  (0010) left two of them calling siblings unqualified under `search_path=public`, which fails the
  moment a policy evaluates against a real row (it only went unnoticed while tables were empty).
  Fixed in `0013_fix_private_helper_refs.sql` (schema-qualified calls).

Still to add before pilot: write-path coverage for every table, `workload_entries`/session welfare
isolation, consent-withdrawal effects on media visibility, and storage-bucket policy tests.

## Secrets & environment

- Never commit `.env*`. Use `.env.example` as the template.
- The service-role key bypasses RLS — use it only in trusted server actions
  (`createServiceRoleClient()`), never in client components or `NEXT_PUBLIC_*`.
- Rotate provider keys (email, video, Supabase) on staff changes.
