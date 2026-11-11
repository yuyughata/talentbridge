# 02 — Core data model

_Source: blueprint §8 (core model) and §5A/§J (development module). Implemented in
`supabase/migrations/`._

## Conventions (§8)

- **UUID** primary keys (`gen_random_uuid()`).
- `created_at` / `updated_at` timestamps on every table (`set_updated_at()` trigger).
- Foreign keys for all relationships; indexes for common filters (`0009_indexes.sql`).
- Explicit **status enums** rather than free text (`0001_extensions_and_enums.sql`).
- **Weight snapshot** stored on each scorecard rating so historical scores stay interpretable if
  the scoring model changes.

## Migration order

| File | Contents |
| --- | --- |
| `0001_extensions_and_enums.sql` | `pgcrypto`, all enums, `set_updated_at()` |
| `0002_identity_and_orgs.sql` | `users`, `organisations`, `organisation_members` |
| `0003_players_and_consent.sql` | `players`, `player_guardians`, `player_consents`, `player_club_history`, `verification_records` |
| `0004_scouting.sql` | `matches`, `scouting_assignments`, `scouting_reports`, `scorecard_ratings`, `speed_subscores`, `report_position_notes`, `report_key_moments` |
| `0005_media_and_development.sql` | `media_assets`, `development_plans`, `development_goals` |
| `0006_discovery_recruitment_audit.sql` | `shortlists`, `shortlist_players`, `recruitment_enquiries`, `notifications`, `audit_logs` |
| `0007_development_module.sql` | Academy training module (§5A) — curricula, programmes, microcycles, sessions, attendance, observations, workload, reviews |
| `0008_rls_helpers_and_policies.sql` | RLS helper functions + policies on all tables |
| `0009_indexes.sql` | Indexes for common filters |

## Core entities (§8)

| Entity / table | Key fields and relationships |
| --- | --- |
| `users` | id, email, display_name, status; linked to `auth.users` |
| `organisations` | id, name, type (academy/club/agency/tba), country, verification_status |
| `organisation_members` | organisation_id, user_id, role, membership_status |
| `players` | id, user_id (optional), primary_academy_id, display_name, **date_of_birth (restricted)**, primary_position, secondary_positions, dominant_foot, height_cm, location, profile_status |
| `player_guardians` | player_id, guardian_user_id, relationship, consent_status (restricted) |
| `player_consents` | player_id, consent_type, version, granted_at, withdrawn_at, scope, evidence_reference |
| `player_club_history` | player_id, organisation_id, from/to_date, level, verification_status, evidence_note |
| `scouting_assignments` | scout_user_id, match_id, target_position, due_date, status |
| `matches` | competition, home/away team, match_date, venue, source_reference |
| `scouting_reports` | player_id, scout_user_id, match_id, minutes_observed, confidence, weighted_score, narrative, status, submitted_at, reviewed_by |
| `scorecard_ratings` | report_id, category, rating_1_to_10, **weight_snapshot**, evidence_note |
| `speed_subscores` | report_id, acceleration, top_speed, repeated_sprint, football_speed |
| `media_assets` | player_id, match_id, storage_provider, asset_reference, visibility, consent_id, processing_status |
| `development_plans` | player_id, created_by, review_date, status |
| `development_goals` | plan_id, attribute, baseline, target, action, owner, due_date, status |
| `verification_records` | player_id, verification_type, status, checked_by, checked_at, restricted_document_reference |
| `shortlists` | organisation_id, created_by, name, purpose, visibility |
| `shortlist_players` | shortlist_id, player_id, notes, added_at |
| `recruitment_enquiries` | recruiter_org_id, player_id, enquiry_type, message, status, access_expiry |
| `audit_logs` | actor_user_id, action, entity_type, entity_id, timestamp, metadata (append-only) |

## Development module entities (§5A J)

Academy-scoped, kept **distinct** from scouting assessments; health-related data is kept out of
general performance tables and behind restricted access (§7):

`curriculum_templates`, `position_training_templates`, `training_programmes`,
`training_microcycles`, `training_sessions`, `session_goal_links`, `session_attendance`,
`session_observations`, `workload_entries`, `development_reviews`.

Each record carries academy scope, timestamps, status and an access policy enforced by RLS.

## Separation of concerns

- **Public / football** fields (position, foot, height band, location) are on `players` and safe
  for discovery.
- **Restricted PII** (`date_of_birth`, nationality, documents) lives on `players` (restricted
  columns) and `verification_records` (staff-only table).
- **Welfare** data (`workload_entries`, `session_observations`) is academy/staff-only and never
  recruiter-facing.

## Regenerating types

```bash
npm run db:types   # supabase gen types typescript --local > src/types/database.types.ts
```

`src/types/database.types.ts` currently ships a permissive placeholder so the app compiles before a
Supabase project exists; replace it with generated types as soon as the local stack is up.
