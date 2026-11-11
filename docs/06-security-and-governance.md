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

## RLS test plan (required before pilot)

Write integration tests that run as one signed-in user per role against a live Supabase instance
and assert:

1. A scout can read their own reports but not another scout's drafts.
2. An academy coach can read their academy's players but **not** another academy's.
3. A recruiter with no grant cannot read any player; with an active grant can read only the granted
   player's **shared** media; with an expired grant loses access.
4. A guardian can read only their linked child's records.
5. `verification_records` and `workload_entries` are unreadable to recruiters and other academies.
6. `audit_logs` cannot be updated or deleted by any non-service role.

## Secrets & environment

- Never commit `.env*`. Use `.env.example` as the template.
- The service-role key bypasses RLS — use it only in trusted server actions
  (`createServiceRoleClient()`), never in client components or `NEXT_PUBLIC_*`.
- Rotate provider keys (email, video, Supabase) on staff changes.
