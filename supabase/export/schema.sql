-- ===========================================================================
-- Talent Bridge Africa — CONSOLIDATED SCHEMA
-- Generated 2026-11-13 by concatenating supabase/migrations/0001..0018 in order.
-- Creates: extensions, enums, tables, RLS policies, SECURITY DEFINER helpers,
-- triggers, indexes. Run this on a fresh project BEFORE loading export/data.sql.
-- (Equivalent to running the migrations; provided for one-shot restore.)
-- ===========================================================================

-- ===== 0001_extensions_and_enums.sql =============================================
-- ===========================================================================
-- 0001  Extensions, enums and shared utilities
-- ===========================================================================
-- Talent Bridge Africa core schema.
-- Design rules (blueprint §7, §8):
--   * UUID primary keys, created_at / updated_at on every table.
--   * Explicit status enums rather than free text.
--   * Permissions are enforced in the database (RLS), not only in the UI.
-- ===========================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- --------------------------------------------------------------------------
-- Enums
-- --------------------------------------------------------------------------

-- Platform roles (§5 M01, §5A I). A user may hold different roles per org.
create type app_role as enum (
  'player',
  'guardian',
  'scout',
  'academy_staff',   -- coach / academy director (granular job title stored separately)
  'tba_reviewer',
  'recruiter',
  'super_admin'
);

-- Organisation types (§8 organisations).
create type organisation_type as enum (
  'academy',
  'club',
  'agency',
  'tba'
);

-- Shared verification state for orgs, players and documents.
create type verification_status as enum (
  'unverified',
  'pending',
  'verified',
  'rejected',
  'expired'
);

-- Player profile lifecycle (§4 Status design — plain-language states).
-- NOTE: 'verified' here never implies FIFA/transfer approval; it is an internal
-- evidence-checked state only.
create type profile_status as enum (
  'draft',
  'submitted',
  'under_review',
  'active',
  'needs_evidence',
  'restricted',
  'archived'
);

-- Scouting report lifecycle (§9 Scout-to-review, Appendix A Review status).
create type report_status as enum (
  'draft',
  'submitted',
  'needs_clarification',
  'approved',
  'rejected'
);

-- Assignment lifecycle (§5 M04).
create type assignment_status as enum (
  'open',
  'in_progress',
  'submitted',
  'completed',
  'cancelled'
);

-- Assessor confidence (§6 mandatory context fields).
create type confidence_level as enum ('low', 'medium', 'high');

-- Seven weighted scorecard categories (§6). Weights live in application config
-- and are snapshotted onto each rating row (weight_snapshot).
create type scorecard_category as enum (
  'technical',
  'tactical',
  'physical',
  'speed',
  'decision_making',
  'mental',
  'consistency'
);

-- Consent lifecycle (§5 M03).
create type consent_status as enum ('granted', 'withdrawn', 'expired', 'pending');

-- Media visibility (§5 M06, §12 — private by default).
create type media_visibility as enum ('private', 'internal', 'shared', 'public');

create type media_processing_status as enum ('pending', 'processing', 'ready', 'failed');

-- Recruiter access / enquiry lifecycle (§5 M10, §9 Recruiter access).
create type enquiry_status as enum (
  'requested',
  'approved',
  'active',
  'expired',
  'revoked',
  'declined'
);

-- Development plan + review lifecycle (§5 M07, §5A).
create type plan_status as enum ('active', 'completed', 'cancelled', 'archived');
create type goal_status as enum ('not_started', 'in_progress', 'achieved', 'deferred');

-- Scout recommendation (Appendix A).
create type scout_recommendation as enum (
  'monitor',
  'reassess',
  'development_priority',
  'technical_review'
);

-- --------------------------------------------------------------------------
-- Shared trigger: maintain updated_at
-- --------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function set_updated_at is
  'BEFORE UPDATE trigger helper that refreshes updated_at to now().';

-- ===== 0002_identity_and_orgs.sql =============================================
-- ===========================================================================
-- 0002  Identity and organisations
-- ===========================================================================
-- §5 M01 (identity, auth, roles), §8 users / organisations / organisation_members
-- ===========================================================================

-- Application profile for each authenticated user. Mirrors auth.users(id).
create table users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  display_name  text,
  phone         text,
  status        text not null default 'active',          -- active | invited | suspended
  is_super_admin boolean not null default false,          -- platform operator
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table users is 'Application profile linked 1:1 to auth.users (§8).';

create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

-- Organisations: academies, clubs, agencies and TBA itself (§8).
create table organisations (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  type                organisation_type not null,
  country             text,
  city                text,
  verification_status verification_status not null default 'unverified',
  verified_by         uuid references users (id),
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table organisations is 'Academies, clubs, agencies and TBA (§8). Clubs/agencies must be independently verified before recruiter access (§12).';

create trigger trg_organisations_updated_at
  before update on organisations
  for each row execute function set_updated_at();

-- Membership + role of a user within an organisation (§8).
-- A user may belong to several organisations with different roles.
create table organisation_members (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references organisations (id) on delete cascade,
  user_id            uuid not null references users (id) on delete cascade,
  role               app_role not null,
  job_title          text,                               -- e.g. 'Academy director', 'Head coach'
  membership_status  text not null default 'active',     -- active | invited | revoked
  invited_by         uuid references users (id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (organisation_id, user_id, role)
);
comment on table organisation_members is 'User <-> organisation membership with role (§8).';

create trigger trg_org_members_updated_at
  before update on organisation_members
  for each row execute function set_updated_at();

-- ===== 0003_players_and_consent.sql =============================================
-- ===========================================================================
-- 0003  Player registry, consent, safeguarding and verification
-- ===========================================================================
-- §5 M02 (registry), M03 (consent/safeguarding), M08 (verification), §8
-- Privacy rules (§2, §12): date_of_birth and documents are restricted; public
-- profile fields are separated from private identity/contact/medical records.
-- ===========================================================================

create table players (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references users (id) on delete set null, -- optional: player may not have a login yet
  primary_academy_id   uuid references organisations (id),
  display_name         text not null,
  preferred_name       text,
  -- Restricted PII — exposed only to authorised staff, never to recruiter-facing profiles (§2).
  date_of_birth        date,
  nationality          text,
  -- Public / football fields.
  primary_position     text,
  secondary_positions  text[] not null default '{}',
  dominant_foot        text,                               -- left | right | both
  height_cm            integer check (height_cm is null or (height_cm between 100 and 230)),
  location             text,
  languages            text[] not null default '{}',
  profile_status       profile_status not null default 'draft',
  is_minor             boolean not null default false,     -- drives safeguarding (§2, §5A H)
  completeness_percent integer not null default 0 check (completeness_percent between 0 and 100),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table players is 'Player registry (§8 M02). DOB/nationality are restricted PII and must not appear on recruiter-facing profiles (§2, §12).';

create trigger trg_players_updated_at
  before update on players
  for each row execute function set_updated_at();

-- Guardian links for minors (§5 M03). Restricted access.
create table player_guardians (
  id               uuid primary key default gen_random_uuid(),
  player_id        uuid not null references players (id) on delete cascade,
  guardian_user_id uuid not null references users (id) on delete cascade,
  relationship     text,                                   -- parent | legal guardian | ...
  consent_status   consent_status not null default 'pending',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (player_id, guardian_user_id)
);
comment on table player_guardians is 'Guardian <-> player links for minors (§5 M03). Restricted access.';

create trigger trg_player_guardians_updated_at
  before update on player_guardians
  for each row execute function set_updated_at();

-- Consent records: every external share / media use needs a recorded lawful basis (§2, §5 M03).
create table player_consents (
  id                 uuid primary key default gen_random_uuid(),
  player_id          uuid not null references players (id) on delete cascade,
  consent_type       text not null,                        -- media_use | external_share | data_processing | ...
  version            text not null,                        -- consent form version
  status             consent_status not null default 'granted',
  scope              text,                                  -- permitted audiences / purposes
  granted_by         uuid references users (id),           -- player or guardian who granted
  granted_at         timestamptz,
  withdrawn_at       timestamptz,
  evidence_reference text,                                  -- pointer to stored evidence (private)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table player_consents is 'Versioned consent with lawful basis and withdrawal (§2, §5 M03, §12).';

create trigger trg_player_consents_updated_at
  before update on player_consents
  for each row execute function set_updated_at();

-- Playing history (§8 player_club_history).
create table player_club_history (
  id                  uuid primary key default gen_random_uuid(),
  player_id           uuid not null references players (id) on delete cascade,
  organisation_id     uuid references organisations (id),
  club_name           text,                                -- free text when not a registered org
  from_date           date,
  to_date             date,
  level               text,                                -- competition / role level
  verification_status verification_status not null default 'unverified',
  evidence_note       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table player_club_history is 'Playing history with per-entry verification (§8).';

create trigger trg_player_club_history_updated_at
  before update on player_club_history
  for each row execute function set_updated_at();

-- Identity / age / registration verification (§5 M08). Sensitive document refs only.
create table verification_records (
  id                           uuid primary key default gen_random_uuid(),
  player_id                    uuid not null references players (id) on delete cascade,
  verification_type            text not null,              -- identity | age | registration | playing_history
  status                       verification_status not null default 'pending',
  checked_by                   uuid references users (id), -- designated verification staff only (§12)
  checked_at                   timestamptz,
  expires_at                   date,                       -- document expiry (§5 M08)
  restricted_document_reference text,                      -- private storage path; never public
  notes                        text,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);
comment on table verification_records is 'Identity/age/registration evidence tracking (§5 M08). Documents stay in private storage with scoped access (§12).';

create trigger trg_verification_records_updated_at
  before update on verification_records
  for each row execute function set_updated_at();

-- ===== 0004_scouting.sql =============================================
-- ===========================================================================
-- 0004  Scouting — matches, assignments, reports and scorecards
-- ===========================================================================
-- §5 M04 (assignments), M05 (reports/scorecards), §6 (scoring model), §8
-- ===========================================================================

create table matches (
  id               uuid primary key default gen_random_uuid(),
  competition      text,
  home_team        text,
  away_team        text,
  home_team_org_id uuid references organisations (id),
  away_team_org_id uuid references organisations (id),
  match_date       date,
  venue            text,
  source_reference text,
  created_by       uuid references users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table matches is 'Match / fixture context for assignments and reports (§8).';

create trigger trg_matches_updated_at
  before update on matches
  for each row execute function set_updated_at();

-- Scouting assignments (§5 M04).
create table scouting_assignments (
  id               uuid primary key default gen_random_uuid(),
  scout_user_id    uuid not null references users (id) on delete cascade,
  assigned_by      uuid references users (id),
  match_id         uuid references matches (id) on delete set null,
  target_player_id uuid references players (id) on delete set null,
  target_position  text,
  objective        text,
  due_date         date,
  status           assignment_status not null default 'open',
  assignment_notes text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table scouting_assignments is 'Match/tournament scouting assignments with targets and deadlines (§5 M04).';

create trigger trg_scouting_assignments_updated_at
  before update on scouting_assignments
  for each row execute function set_updated_at();

-- Scouting reports (§5 M05, §6 mandatory context fields).
create table scouting_reports (
  id                 uuid primary key default gen_random_uuid(),
  player_id          uuid not null references players (id) on delete cascade,
  scout_user_id      uuid not null references users (id) on delete cascade,
  assignment_id      uuid references scouting_assignments (id) on delete set null,
  match_id           uuid references matches (id) on delete set null,
  position_observed  text,
  role_observed      text,
  minutes_observed   integer check (minutes_observed is null or minutes_observed >= 0),
  watched_scope      text,                                 -- full_match | half | clips (§6)
  confidence         confidence_level not null default 'medium',
  confidence_reason  text,
  -- Overall weighted score out of 100, computed from scorecard_ratings using the
  -- weight snapshot. Stored for fast listing/sorting; recomputed on rating change.
  weighted_score     numeric(5,2) check (weighted_score is null or (weighted_score between 0 and 100)),
  recommendation     scout_recommendation,
  narrative          text,
  strengths          text,                                 -- required narrative (Appendix A)
  development_areas  text,                                 -- required narrative (Appendix A)
  status             report_status not null default 'draft',
  submitted_at       timestamptz,
  reviewed_by        uuid references users (id),
  reviewed_at        timestamptz,
  review_comment     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table scouting_reports is 'Structured scouting report (§5 M05, §6). Approval updates assessment history but does NOT auto-verify the player (§9).';

create trigger trg_scouting_reports_updated_at
  before update on scouting_reports
  for each row execute function set_updated_at();

-- Per-category ratings with weight snapshot (§6, §8 scorecard_ratings).
-- Storing weight_snapshot keeps historical scores interpretable if weights change (§8).
create table scorecard_ratings (
  id             uuid primary key default gen_random_uuid(),
  report_id      uuid not null references scouting_reports (id) on delete cascade,
  category       scorecard_category not null,
  rating_1_to_10 integer not null check (rating_1_to_10 between 1 and 10),
  weight_snapshot numeric(4,3) not null check (weight_snapshot >= 0 and weight_snapshot <= 1),
  evidence_note  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (report_id, category)
);
comment on table scorecard_ratings is 'One rating per category per report with the weight in force at the time (§6, §8).';

create trigger trg_scorecard_ratings_updated_at
  before update on scorecard_ratings
  for each row execute function set_updated_at();

-- Speed overlay sub-scores (§6 Speed assessment sub-score).
create table speed_subscores (
  id                    uuid primary key default gen_random_uuid(),
  report_id             uuid not null references scouting_reports (id) on delete cascade,
  acceleration          integer check (acceleration between 1 and 10),
  top_speed             integer check (top_speed between 1 and 10),
  repeated_sprint       integer check (repeated_sprint between 1 and 10),
  football_speed        integer check (football_speed between 1 and 10),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (report_id)
);
comment on table speed_subscores is 'Speed sub-dimensions: acceleration, top speed, repeated sprint, football speed (§6).';

create trigger trg_speed_subscores_updated_at
  before update on speed_subscores
  for each row execute function set_updated_at();

-- Position-specific overlay notes, kept separate from the base model (§6 overlays).
create table report_position_notes (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid not null references scouting_reports (id) on delete cascade,
  attribute  text not null,
  note       text,
  created_at timestamptz not null default now()
);
comment on table report_position_notes is 'Optional position-specific overlay attributes; do not distort base weights (§6).';

-- Key moments / timestamped clips (Appendix A).
create table report_key_moments (
  id             uuid primary key default gen_random_uuid(),
  report_id      uuid not null references scouting_reports (id) on delete cascade,
  timestamp_sec  integer,
  description    text not null,
  media_asset_id uuid,                                     -- FK added in 0005 after media_assets exists
  created_at     timestamptz not null default now()
);
comment on table report_key_moments is 'Timestamped match moments with optional authorised clip reference (Appendix A).';

-- ===== 0005_media_and_development.sql =============================================
-- ===========================================================================
-- 0005  Media library and MVP player development (IDP)
-- ===========================================================================
-- §5 M06 (video/media), M07 (development — MVP level), §8
-- ===========================================================================

-- Media assets (§5 M06). Large video lives with a dedicated provider, not in Postgres.
create table media_assets (
  id                uuid primary key default gen_random_uuid(),
  player_id         uuid references players (id) on delete cascade,
  match_id          uuid references matches (id) on delete set null,
  uploaded_by       uuid references users (id),
  kind              text not null default 'video',        -- video | image | document
  storage_provider  text not null,                        -- video provider id OR 'supabase-storage'
  asset_reference   text not null,                        -- provider asset id / storage path
  title             text,
  visibility        media_visibility not null default 'private',
  consent_id        uuid references player_consents (id),
  processing_status media_processing_status not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table media_assets is 'Authorised match footage / images / documents (§5 M06). Private by default; needs a consent reference before any external share (§2).';

create trigger trg_media_assets_updated_at
  before update on media_assets
  for each row execute function set_updated_at();

-- Now that media_assets exists, wire the key-moment clip reference (from 0004).
alter table report_key_moments
  add constraint report_key_moments_media_fk
  foreign key (media_asset_id) references media_assets (id) on delete set null;

-- MVP individual development plan (§5 M07; richer academy module added in 0007).
create table development_plans (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players (id) on delete cascade,
  academy_id  uuid references organisations (id),
  created_by  uuid references users (id),
  title       text,
  baseline_note text,
  review_date date,
  status      plan_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table development_plans is 'Individual development plan — MVP level (§5 M07, §5A K Release 1).';

create trigger trg_development_plans_updated_at
  before update on development_plans
  for each row execute function set_updated_at();

create table development_goals (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references development_plans (id) on delete cascade,
  attribute   text not null,                              -- attribute being developed
  baseline    text,
  target      text,                                       -- measurable success indicator
  action      text,                                       -- specific training action
  owner       uuid references users (id),                 -- responsible coach/player
  due_date    date,
  status      goal_status not null default 'not_started',
  coach_comment   text,
  player_reflection text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table development_goals is 'Development goals with baseline/target/action and measurable indicator (§5A D IDP).';

create trigger trg_development_goals_updated_at
  before update on development_goals
  for each row execute function set_updated_at();

-- ===== 0006_discovery_recruitment_audit.sql =============================================
-- ===========================================================================
-- 0006  Talent discovery, recruiter access, notifications and audit
-- ===========================================================================
-- §5 M09 (shortlists), M10 (recruiter access/enquiries), M13 (notifications),
-- M14 (audit), §8
-- ===========================================================================

-- Internal + recruiter shortlists (§5 M09).
create table shortlists (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations (id) on delete cascade,
  created_by      uuid not null references users (id),
  name            text not null,
  purpose         text,
  visibility      media_visibility not null default 'internal',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table shortlists is 'Internal / recruiter shortlists (§5 M09).';

create trigger trg_shortlists_updated_at
  before update on shortlists
  for each row execute function set_updated_at();

create table shortlist_players (
  id           uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references shortlists (id) on delete cascade,
  player_id    uuid not null references players (id) on delete cascade,
  notes        text,                                      -- reason for inclusion/exclusion (§5 M09)
  added_by     uuid references users (id),
  added_at     timestamptz not null default now(),
  unique (shortlist_id, player_id)
);
comment on table shortlist_players is 'Players on a shortlist with reason notes (§5 M09).';

-- Recruiter access requests / enquiries (§5 M10, §9 Recruiter access).
-- Access is time-limited and logged; no unrestricted browse of the database (§2).
create table recruitment_enquiries (
  id               uuid primary key default gen_random_uuid(),
  recruiter_org_id uuid not null references organisations (id) on delete cascade,
  requested_by     uuid not null references users (id),
  player_id        uuid references players (id) on delete cascade,
  enquiry_type     text,                                  -- access_request | enquiry | portfolio_request
  message          text,
  status           enquiry_status not null default 'requested',
  decided_by       uuid references users (id),            -- TBA reviewer/admin
  decided_at       timestamptz,
  access_granted_at timestamptz,
  access_expiry    timestamptz,                           -- time-limited access (§5 M10)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table recruitment_enquiries is 'Recruiter access requests and enquiries; time-limited, human-approved, logged (§5 M10, §2).';

create trigger trg_recruitment_enquiries_updated_at
  before update on recruitment_enquiries
  for each row execute function set_updated_at();

-- Notifications / tasks (§5 M13).
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  type        text not null,                              -- assignment | review | consent_renewal | access_request | development_review
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
comment on table notifications is 'In-app notifications (§5 M13). Email is sent via the transactional provider.';

-- Append-only audit trail (§5 M14, §12). Every sensitive access/change recorded.
create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users (id),
  action        text not null,                            -- e.g. 'player.view', 'document.download', 'report.approve'
  entity_type   text not null,
  entity_id     uuid,
  metadata      jsonb not null default '{}'::jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);
comment on table audit_logs is 'Append-only audit trail; log every sensitive view/download/change (§5 M14, §12). No UPDATE/DELETE policy is granted.';

-- ===== 0007_development_module.sql =============================================
-- ===========================================================================
-- 0007  Academy training & development module (Release 2)
-- ===========================================================================
-- §5A — dedicated TBA Player Development & Academy Training module, §J entities.
-- Keep attendance/coaching observations distinct from scouting assessments and
-- keep health-related info out of general performance tables, behind restricted
-- access (§7 architecture note, §5A H welfare safeguards).
-- ===========================================================================

create type age_band as enum ('u6_9', 'u10_12', 'u13_15', 'u16_18', 'u19_23');
create type session_status as enum ('planned', 'delivered', 'cancelled');

-- Editable curriculum templates per age band (§5A A). Templates, not prescriptions.
create table curriculum_templates (
  id              uuid primary key default gen_random_uuid(),
  academy_id      uuid references organisations (id) on delete cascade, -- null = TBA global template
  name            text not null,
  age_band        age_band not null,
  focus_summary   text,
  is_global       boolean not null default false,
  created_by      uuid references users (id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table curriculum_templates is 'Editable age-band curriculum templates (§5A A). Coaches adapt to maturity/schedule.';
create trigger trg_curriculum_templates_updated_at before update on curriculum_templates for each row execute function set_updated_at();

-- Position-specific development libraries (§5A C).
create table position_training_templates (
  id             uuid primary key default gen_random_uuid(),
  position_group text not null,                            -- goalkeeper | defender | midfielder | winger | striker
  name           text not null,
  focus_points   text[] not null default '{}',
  created_at     timestamptz not null default now()
);
comment on table position_training_templates is 'Position-specific development libraries (§5A C).';

-- Training programmes group microcycles for a squad / age group (§5A B, §J).
create table training_programmes (
  id            uuid primary key default gen_random_uuid(),
  academy_id    uuid not null references organisations (id) on delete cascade,
  name          text not null,
  age_band      age_band,
  curriculum_id uuid references curriculum_templates (id),
  start_date    date,
  end_date      date,
  status        plan_status not null default 'active',
  created_by    uuid references users (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table training_programmes is 'Academy training programme for a squad/age group (§5A B, §J).';
create trigger trg_training_programmes_updated_at before update on training_programmes for each row execute function set_updated_at();

-- Recurring weekly microcycle (§5A B). Editable, not hard-coded.
create table training_microcycles (
  id            uuid primary key default gen_random_uuid(),
  programme_id  uuid not null references training_programmes (id) on delete cascade,
  week_label    text,
  week_start    date,
  intensity_intent text,                                   -- load intent for the week
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table training_microcycles is 'Recurring weekly microcycle within a programme (§5A B).';
create trigger trg_training_microcycles_updated_at before update on training_microcycles for each row execute function set_updated_at();

-- Individual training sessions (§5A B, E).
create table training_sessions (
  id             uuid primary key default gen_random_uuid(),
  academy_id     uuid not null references organisations (id) on delete cascade,
  programme_id   uuid references training_programmes (id) on delete set null,
  microcycle_id  uuid references training_microcycles (id) on delete set null,
  coach_user_id  uuid references users (id),
  title          text not null,
  objective      text,
  scheduled_at   timestamptz,
  duration_min   integer check (duration_min is null or duration_min > 0),
  intensity_intent text,
  equipment      text,
  location       text,
  status         session_status not null default 'planned',
  session_delivered_note text,                             -- delivered vs planned (§5A E)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table training_sessions is 'Planned/delivered training sessions (§5A B, E). Templates editable.';
create trigger trg_training_sessions_updated_at before update on training_sessions for each row execute function set_updated_at();

-- Link sessions to development goals they serve (§5A B).
create table session_goal_links (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references training_sessions (id) on delete cascade,
  goal_id    uuid not null references development_goals (id) on delete cascade,
  unique (session_id, goal_id)
);

-- Attendance per player per session (§5A E).
create table session_attendance (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references training_sessions (id) on delete cascade,
  player_id   uuid not null references players (id) on delete cascade,
  present     boolean not null default true,
  engagement  text,                                        -- coach-friendly note, not a diagnosis
  created_at  timestamptz not null default now(),
  unique (session_id, player_id)
);
comment on table session_attendance is 'Per-player session attendance and engagement (§5A E). Not a medical record.';

-- Coaching observations after a session (§5A E). Distinct from scouting assessments.
create table session_observations (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references training_sessions (id) on delete cascade,
  player_id   uuid not null references players (id) on delete cascade,
  coach_user_id uuid references users (id),
  observation text,
  follow_up   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table session_observations is 'Coach observations per player per session (§5A E). Kept separate from scouting reports (§7).';
create trigger trg_session_observations_updated_at before update on session_observations for each row execute function set_updated_at();

-- Workload / perceived exertion (§5A E). Restricted; only where staff are trained.
create table workload_entries (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players (id) on delete cascade,
  session_id  uuid references training_sessions (id) on delete set null,
  duration_min integer,
  perceived_exertion integer check (perceived_exertion is null or perceived_exertion between 1 and 10),
  note        text,
  recorded_by uuid references users (id),
  recorded_at timestamptz not null default now()
);
comment on table workload_entries is 'Simple workload / RPE records (§5A E). Restricted welfare data — never exposed to recruiters (§5A H/I).';

-- 12-week reassessment / development reviews (§5A F, G, §J development_reviews).
create table development_reviews (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references development_plans (id) on delete cascade,
  player_id   uuid not null references players (id) on delete cascade,
  reviewer_user_id uuid references users (id),
  cycle_label text,                                        -- e.g. 'Cycle 1 (weeks 1-12)'
  review_date date,
  technical_trend text,
  tactical_trend  text,
  speed_trend     text,
  decision_trend  text,
  summary     text,
  next_cycle_focus text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table development_reviews is '12-week reassessment records showing trends over time, not a single headline score (§5A F, G).';
create trigger trg_development_reviews_updated_at before update on development_reviews for each row execute function set_updated_at();

-- ===== 0008_rls_helpers_and_policies.sql =============================================
-- ===========================================================================
-- 0008  Row Level Security — helper functions and policies
-- ===========================================================================
-- Blueprint §7: "Enforce permissions in database policies, not only by hiding
-- buttons in the interface." §12: recruiter access is invite-only, verified and
-- time-limited; sensitive documents are restricted to verification staff.
--
-- The Supabase service_role key bypasses RLS and is used only by trusted server
-- actions (e.g. verification workflows). All browser/anon/authenticated traffic
-- is subject to the policies below.
--
-- NOTE: These policies are a reviewed baseline. A full RLS test suite and
-- security review are required before pilot launch (§12, docs/06-...md).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid policy recursion)
-- ---------------------------------------------------------------------------
create or replace function tba_is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_super_admin from users where id = auth.uid()), false);
$$;

create or replace function tba_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_super_admin() or exists (
    select 1
    from organisation_members m
    join organisations o on o.id = m.organisation_id
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and o.type = 'tba'
      and m.role in ('tba_reviewer', 'super_admin')
  );
$$;

create or replace function tba_is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organisation_members m
    where m.user_id = auth.uid()
      and m.organisation_id = p_org
      and m.membership_status = 'active'
  );
$$;

create or replace function tba_is_self_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from players p where p.id = p_player and p.user_id = auth.uid());
$$;

create or replace function tba_is_guardian_of(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from player_guardians g
    where g.player_id = p_player and g.guardian_user_id = auth.uid()
  );
$$;

create or replace function tba_academy_can_access_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from players p
    join organisation_members m on m.organisation_id = p.primary_academy_id
    where p.id = p_player
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
      and m.role in ('academy_staff', 'tba_reviewer', 'super_admin')
  );
$$;

-- Recruiter access is granted per player, approved by TBA and time-limited (§5 M10).
create or replace function tba_recruiter_has_player_access(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from recruitment_enquiries e
    join organisation_members m on m.organisation_id = e.recruiter_org_id
    where e.player_id = p_player
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
      and e.status in ('approved', 'active')
      and (e.access_expiry is null or e.access_expiry > now())
  );
$$;

-- Combined read rule for player-scoped data.
create or replace function tba_can_view_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_staff()
      or tba_is_self_player(p_player)
      or tba_is_guardian_of(p_player)
      or tba_academy_can_access_player(p_player)
      or tba_recruiter_has_player_access(p_player);
$$;

-- Does the current user have write access to a report (owner scout or staff)?
create or replace function tba_can_write_report(p_report uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_staff() or exists (
    select 1 from scouting_reports r
    where r.id = p_report and r.scout_user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table users                   enable row level security;
alter table organisations           enable row level security;
alter table organisation_members    enable row level security;
alter table players                 enable row level security;
alter table player_guardians        enable row level security;
alter table player_consents         enable row level security;
alter table player_club_history     enable row level security;
alter table verification_records    enable row level security;
alter table matches                 enable row level security;
alter table scouting_assignments    enable row level security;
alter table scouting_reports        enable row level security;
alter table scorecard_ratings       enable row level security;
alter table speed_subscores         enable row level security;
alter table report_position_notes   enable row level security;
alter table report_key_moments      enable row level security;
alter table media_assets            enable row level security;
alter table development_plans       enable row level security;
alter table development_goals       enable row level security;
alter table shortlists              enable row level security;
alter table shortlist_players       enable row level security;
alter table recruitment_enquiries   enable row level security;
alter table notifications           enable row level security;
alter table audit_logs              enable row level security;
alter table curriculum_templates    enable row level security;
alter table position_training_templates enable row level security;
alter table training_programmes     enable row level security;
alter table training_microcycles    enable row level security;
alter table training_sessions       enable row level security;
alter table session_goal_links      enable row level security;
alter table session_attendance      enable row level security;
alter table session_observations    enable row level security;
alter table workload_entries        enable row level security;
alter table development_reviews     enable row level security;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create policy users_select_self_or_staff on users
  for select using (id = auth.uid() or tba_is_staff());
create policy users_update_self on users
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy users_staff_manage on users
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- organisations
-- ---------------------------------------------------------------------------
create policy orgs_select_member_or_staff on organisations
  for select using (tba_is_org_member(id) or tba_is_staff());
create policy orgs_staff_manage on organisations
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- organisation_members
-- ---------------------------------------------------------------------------
create policy org_members_select on organisation_members
  for select using (user_id = auth.uid() or tba_is_org_member(organisation_id) or tba_is_staff());
create policy org_members_staff_manage on organisation_members
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
create policy players_select on players
  for select using (tba_can_view_player(id));
create policy players_insert on players
  for insert with check (tba_is_staff() or tba_is_org_member(primary_academy_id));
create policy players_update on players
  for update using (
    tba_is_staff()
    or tba_academy_can_access_player(id)
    or tba_is_self_player(id)
  ) with check (
    tba_is_staff()
    or tba_academy_can_access_player(id)
    or tba_is_self_player(id)
  );

-- ---------------------------------------------------------------------------
-- player_guardians
-- ---------------------------------------------------------------------------
create policy guardians_select on player_guardians
  for select using (
    guardian_user_id = auth.uid() or tba_is_staff() or tba_academy_can_access_player(player_id)
  );
create policy guardians_staff_manage on player_guardians
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- player_consents
-- ---------------------------------------------------------------------------
create policy consents_select on player_consents
  for select using (tba_can_view_player(player_id));
create policy consents_write on player_consents
  for all using (
    tba_is_staff() or tba_is_self_player(player_id) or tba_is_guardian_of(player_id)
  ) with check (
    tba_is_staff() or tba_is_self_player(player_id) or tba_is_guardian_of(player_id)
  );

-- ---------------------------------------------------------------------------
-- player_club_history
-- ---------------------------------------------------------------------------
create policy club_history_select on player_club_history
  for select using (tba_can_view_player(player_id));
create policy club_history_write on player_club_history
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

-- ---------------------------------------------------------------------------
-- verification_records  (restricted to TBA staff — §12)
-- ---------------------------------------------------------------------------
create policy verification_staff_only on verification_records
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- matches  (non-sensitive context)
-- ---------------------------------------------------------------------------
create policy matches_select_authenticated on matches
  for select using (auth.uid() is not null);
create policy matches_write on matches
  for all using (tba_is_staff() or created_by = auth.uid())
  with check (tba_is_staff() or created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- scouting_assignments
-- ---------------------------------------------------------------------------
create policy assignments_select on scouting_assignments
  for select using (scout_user_id = auth.uid() or tba_is_staff());
create policy assignments_staff_manage on scouting_assignments
  for all using (tba_is_staff()) with check (tba_is_staff());
create policy assignments_scout_update on scouting_assignments
  for update using (scout_user_id = auth.uid()) with check (scout_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- scouting_reports
-- ---------------------------------------------------------------------------
create policy reports_select on scouting_reports
  for select using (
    tba_is_staff()
    or scout_user_id = auth.uid()
    or (status = 'approved' and tba_can_view_player(player_id))
  );
create policy reports_scout_insert on scouting_reports
  for insert with check (scout_user_id = auth.uid() or tba_is_staff());
create policy reports_update on scouting_reports
  for update using (
    tba_is_staff() or (scout_user_id = auth.uid() and status in ('draft', 'needs_clarification'))
  ) with check (
    tba_is_staff() or scout_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- report child tables (scorecard_ratings, speed_subscores, notes, key moments)
-- ---------------------------------------------------------------------------
create policy ratings_select on scorecard_ratings
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy ratings_write on scorecard_ratings
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy speed_select on speed_subscores
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy speed_write on speed_subscores
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy posnotes_select on report_position_notes
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy posnotes_write on report_position_notes
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy keymoments_select on report_key_moments
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy keymoments_write on report_key_moments
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

-- ---------------------------------------------------------------------------
-- media_assets  (private by default; recruiters only see shared/public + access)
-- ---------------------------------------------------------------------------
create policy media_select on media_assets
  for select using (
    tba_is_staff()
    or tba_is_self_player(player_id)
    or tba_is_guardian_of(player_id)
    or tba_academy_can_access_player(player_id)
    or (visibility in ('shared', 'public') and tba_recruiter_has_player_access(player_id))
  );
create policy media_write on media_assets
  for all using (
    tba_is_staff() or tba_academy_can_access_player(player_id) or tba_is_self_player(player_id)
  ) with check (
    tba_is_staff() or tba_academy_can_access_player(player_id) or tba_is_self_player(player_id)
  );

-- ---------------------------------------------------------------------------
-- development_plans / development_goals
-- ---------------------------------------------------------------------------
create policy dev_plans_select on development_plans
  for select using (tba_can_view_player(player_id));
create policy dev_plans_write on development_plans
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

create policy dev_goals_select on development_goals
  for select using (exists (
    select 1 from development_plans p where p.id = plan_id and tba_can_view_player(p.player_id)
  ));
create policy dev_goals_write on development_goals
  for all using (exists (
    select 1 from development_plans p where p.id = plan_id
      and (tba_is_staff() or tba_academy_can_access_player(p.player_id))
  )) with check (exists (
    select 1 from development_plans p where p.id = plan_id
      and (tba_is_staff() or tba_academy_can_access_player(p.player_id))
  ));

-- ---------------------------------------------------------------------------
-- shortlists / shortlist_players
-- ---------------------------------------------------------------------------
create policy shortlists_select on shortlists
  for select using (tba_is_staff() or tba_is_org_member(organisation_id) or created_by = auth.uid());
create policy shortlists_write on shortlists
  for all using (tba_is_staff() or created_by = auth.uid() or tba_is_org_member(organisation_id))
  with check (tba_is_staff() or created_by = auth.uid() or tba_is_org_member(organisation_id));

create policy shortlist_players_select on shortlist_players
  for select using (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  ));
create policy shortlist_players_write on shortlist_players
  for all using (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  )) with check (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- recruitment_enquiries
-- ---------------------------------------------------------------------------
create policy enquiries_select on recruitment_enquiries
  for select using (tba_is_staff() or tba_is_org_member(recruiter_org_id));
create policy enquiries_recruiter_insert on recruitment_enquiries
  for insert with check (tba_is_org_member(recruiter_org_id));
create policy enquiries_staff_decide on recruitment_enquiries
  for update using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- notifications  (owner only)
-- ---------------------------------------------------------------------------
create policy notifications_owner on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- audit_logs  (staff read; append-only insert; no update/delete policy)
-- ---------------------------------------------------------------------------
create policy audit_select_staff on audit_logs
  for select using (tba_is_staff());
create policy audit_insert on audit_logs
  for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Academy training & development module (academy-scoped)
-- ---------------------------------------------------------------------------
create policy curriculum_select on curriculum_templates
  for select using (is_global or tba_is_staff() or tba_is_org_member(academy_id));
create policy curriculum_write on curriculum_templates
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy postemplates_select on position_training_templates
  for select using (auth.uid() is not null);
create policy postemplates_staff_write on position_training_templates
  for all using (tba_is_staff()) with check (tba_is_staff());

create policy programmes_select on training_programmes
  for select using (tba_is_staff() or tba_is_org_member(academy_id));
create policy programmes_write on training_programmes
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy microcycles_access on training_microcycles
  for all using (exists (
    select 1 from training_programmes p where p.id = programme_id
      and (tba_is_staff() or tba_is_org_member(p.academy_id))
  )) with check (exists (
    select 1 from training_programmes p where p.id = programme_id
      and (tba_is_staff() or tba_is_org_member(p.academy_id))
  ));

create policy sessions_select on training_sessions
  for select using (tba_is_staff() or tba_is_org_member(academy_id));
create policy sessions_write on training_sessions
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy session_goals_access on session_goal_links
  for all using (exists (
    select 1 from training_sessions s where s.id = session_id
      and (tba_is_staff() or tba_is_org_member(s.academy_id))
  )) with check (exists (
    select 1 from training_sessions s where s.id = session_id
      and (tba_is_staff() or tba_is_org_member(s.academy_id))
  ));

-- Attendance: academy staff manage; linked player/guardian may read their own row.
create policy attendance_select on session_attendance
  for select using (
    tba_is_staff()
    or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
    or tba_is_self_player(player_id)
    or tba_is_guardian_of(player_id)
  );
create policy attendance_write on session_attendance
  for all using (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  ) with check (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  );

-- Observations: academy/staff only (coaching record, not recruiter-facing — §5A I).
create policy observations_access on session_observations
  for all using (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  ) with check (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  );

-- Workload / welfare data: restricted to academy staff + TBA staff only (§5A H/I).
create policy workload_access on workload_entries
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

-- Development reviews: visible to those who can view the player; written by academy/staff.
create policy dev_reviews_select on development_reviews
  for select using (tba_can_view_player(player_id));
create policy dev_reviews_write on development_reviews
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

-- ===== 0009_indexes.sql =============================================
-- ===========================================================================
-- 0009  Indexes for common filters (§8)
-- ===========================================================================

-- Identity / orgs
create index idx_users_email on users (email);
create index idx_org_members_user on organisation_members (user_id);
create index idx_org_members_org on organisation_members (organisation_id);
create index idx_orgs_type on organisations (type);

-- Players: discovery filter rail (§4 Recruiter discovery) — position, foot, location, status.
create index idx_players_academy on players (primary_academy_id);
create index idx_players_status on players (profile_status);
create index idx_players_position on players (primary_position);
create index idx_players_foot on players (dominant_foot);
create index idx_players_location on players (location);
create index idx_players_user on players (user_id);

create index idx_guardians_player on player_guardians (player_id);
create index idx_guardians_user on player_guardians (guardian_user_id);
create index idx_consents_player on player_consents (player_id);
create index idx_club_history_player on player_club_history (player_id);
create index idx_verification_player on verification_records (player_id);
create index idx_verification_expiry on verification_records (expires_at);

-- Scouting
create index idx_assignments_scout on scouting_assignments (scout_user_id);
create index idx_assignments_status on scouting_assignments (status);
create index idx_assignments_due on scouting_assignments (due_date);
create index idx_reports_player on scouting_reports (player_id);
create index idx_reports_scout on scouting_reports (scout_user_id);
create index idx_reports_status on scouting_reports (status);
create index idx_reports_match on scouting_reports (match_id);
create index idx_ratings_report on scorecard_ratings (report_id);

-- Media / development
create index idx_media_player on media_assets (player_id);
create index idx_media_visibility on media_assets (visibility);
create index idx_dev_plans_player on development_plans (player_id);
create index idx_dev_goals_plan on development_goals (plan_id);

-- Discovery / recruitment
create index idx_shortlist_players_shortlist on shortlist_players (shortlist_id);
create index idx_shortlist_players_player on shortlist_players (player_id);
create index idx_enquiries_recruiter on recruitment_enquiries (recruiter_org_id);
create index idx_enquiries_player on recruitment_enquiries (player_id);
create index idx_enquiries_status on recruitment_enquiries (status);

-- Notifications / audit
create index idx_notifications_user on notifications (user_id, read_at);
create index idx_audit_actor on audit_logs (actor_user_id);
create index idx_audit_entity on audit_logs (entity_type, entity_id);
create index idx_audit_created on audit_logs (created_at);

-- Training & development module
create index idx_programmes_academy on training_programmes (academy_id);
create index idx_microcycles_programme on training_microcycles (programme_id);
create index idx_sessions_academy on training_sessions (academy_id);
create index idx_sessions_programme on training_sessions (programme_id);
create index idx_sessions_scheduled on training_sessions (scheduled_at);
create index idx_attendance_session on session_attendance (session_id);
create index idx_attendance_player on session_attendance (player_id);
create index idx_observations_session on session_observations (session_id);
create index idx_observations_player on session_observations (player_id);
create index idx_workload_player on workload_entries (player_id);
create index idx_dev_reviews_plan on development_reviews (plan_id);
create index idx_dev_reviews_player on development_reviews (player_id);

-- ===== 0010_security_hardening.sql =============================================
-- ===========================================================================
-- 0010  Security hardening (post-deploy advisor fixes)
-- ===========================================================================
-- Addresses Supabase database linter findings after the initial schema:
--  * 0011 function_search_path_mutable — pin search_path on the trigger helper.
--  * 0028/0029 (anon|authenticated)_security_definer_function_executable —
--    the tba_* RLS helper functions are SECURITY DEFINER (required to avoid RLS
--    recursion) and were exposed as PostgREST RPC endpoints in the public schema.
--    Moving them to a non-exposed `private` schema removes the RPC surface while
--    keeping RLS working: existing policies reference the functions by OID, which
--    is unchanged by a schema move. API roles keep EXECUTE (granted to PUBLIC)
--    and are granted USAGE on the schema so policy evaluation can still call them.
-- ===========================================================================

alter function public.set_updated_at() set search_path = public;

create schema if not exists private;

alter function public.tba_is_super_admin() set schema private;
alter function public.tba_is_staff() set schema private;
alter function public.tba_is_org_member(uuid) set schema private;
alter function public.tba_is_self_player(uuid) set schema private;
alter function public.tba_is_guardian_of(uuid) set schema private;
alter function public.tba_academy_can_access_player(uuid) set schema private;
alter function public.tba_recruiter_has_player_access(uuid) set schema private;
alter function public.tba_can_view_player(uuid) set schema private;
alter function public.tba_can_write_report(uuid) set schema private;

grant usage on schema private to anon, authenticated, service_role;

-- ===== 0011_auth_and_invitations.sql =============================================
-- ===========================================================================
-- 0011  Auth bootstrap and invitations (M01 identity, auth, roles)
-- ===========================================================================
-- * Mirror new auth.users into public.users automatically.
-- * Invitation records for the invite-first onboarding flow (§5 M01, §15).
--   Invitation preview + acceptance are performed by trusted server actions
--   using the service role (§7), so no anon-facing policy is required here.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Create a public.users profile row whenever an auth user is created.
-- --------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- --------------------------------------------------------------------------
-- Invitations
-- --------------------------------------------------------------------------
create type invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table invitations (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  role            app_role not null,
  organisation_id uuid references organisations (id) on delete cascade,
  token           text not null unique,
  status          invitation_status not null default 'pending',
  message         text,
  invited_by      uuid references users (id),
  expires_at      timestamptz not null default (now() + interval '14 days'),
  accepted_at     timestamptz,
  accepted_by     uuid references users (id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table invitations is 'Invite-first onboarding records (§5 M01, §15). Preview/accept run as trusted server actions (service role).';

create trigger trg_invitations_updated_at
  before update on invitations
  for each row execute function set_updated_at();

create index idx_invitations_email on invitations (lower(email));
create index idx_invitations_token on invitations (token);
create index idx_invitations_org on invitations (organisation_id);
create index idx_invitations_status on invitations (status);

alter table invitations enable row level security;

-- Staff and members of the target organisation can create/see/manage invites.
-- (Private-schema helpers were introduced in 0010.)
create policy invitations_select on invitations
  for select using (
    private.tba_is_staff()
    or invited_by = auth.uid()
    or (organisation_id is not null and private.tba_is_org_member(organisation_id))
  );
create policy invitations_insert on invitations
  for insert with check (
    invited_by = auth.uid()
    and (
      private.tba_is_staff()
      or (organisation_id is not null and private.tba_is_org_member(organisation_id))
    )
  );
create policy invitations_update on invitations
  for update using (
    private.tba_is_staff()
    or invited_by = auth.uid()
    or (organisation_id is not null and private.tba_is_org_member(organisation_id))
  ) with check (
    private.tba_is_staff()
    or invited_by = auth.uid()
    or (organisation_id is not null and private.tba_is_org_member(organisation_id))
  );

-- ===== 0012_scout_player_access.sql =============================================
-- ===========================================================================
-- 0012  Scouts can view players (RLS fix surfaced by the RLS test suite)
-- ===========================================================================
-- Scouts are part of TBA's internal assessment network and must be able to see
-- players to scout them (§5 M05, §3 Scout workspace → Players). The original
-- tba_can_view_player rule (staff ∨ self ∨ guardian ∨ academy ∨ recruiter) left
-- plain scouts with zero player visibility. Add an explicit scout path.
--
-- Recruiter access stays restricted (invite-only, time-limited, §2); this change
-- only broadens access for active `scout` members. Helpers live in the private
-- schema (see 0010); private calls are schema-qualified so `create or replace`
-- re-resolves them regardless of the function's search_path.
-- ===========================================================================

create or replace function private.tba_is_scout()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organisation_members m
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and m.role = 'scout'
  );
$$;

create or replace function private.tba_can_view_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_staff()
      or private.tba_is_self_player(p_player)
      or private.tba_is_guardian_of(p_player)
      or private.tba_academy_can_access_player(p_player)
      or private.tba_recruiter_has_player_access(p_player)
      or private.tba_is_scout();
$$;

-- ===== 0013_fix_private_helper_refs.sql =============================================
-- ===========================================================================
-- 0013  Fix private helper cross-references (critical RLS bug)
-- ===========================================================================
-- When 0010 moved the SECURITY DEFINER helpers from public → private, two of
-- them kept UNQUALIFIED calls to sibling helpers (tba_is_staff → tba_is_super_admin,
-- tba_can_write_report → tba_is_staff). Those functions run with search_path=public,
-- so after the move the unqualified names no longer resolve ("function
-- tba_is_super_admin() does not exist") the moment a policy that uses them is
-- evaluated against a real row. Schema-qualify the calls so they resolve.
--
-- Surfaced by the RLS integration test suite (supabase/tests). `create or replace`
-- keeps each function's OID, so existing RLS policies continue to bind.
-- ===========================================================================

create or replace function private.tba_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_super_admin() or exists (
    select 1
    from organisation_members m
    join organisations o on o.id = m.organisation_id
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and o.type = 'tba'
      and m.role in ('tba_reviewer', 'super_admin')
  );
$$;

create or replace function private.tba_can_write_report(p_report uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_staff() or exists (
    select 1 from scouting_reports r where r.id = p_report and r.scout_user_id = auth.uid()
  );
$$;

-- ===== 0014_player_portrait.sql =============================================
-- ===========================================================================
-- 0014  Player portrait
-- ===========================================================================
-- Player cards and profiles show a portrait (§4 Player cards). Store a reference
-- to the image (a signed Storage URL or provider link); the UI falls back to an
-- initials monogram when absent. Permission-cleared photography only (§4, §2).
-- ===========================================================================

alter table players add column if not exists portrait_url text;

-- ===== 0015_overlay_ratings.sql =============================================
-- 0015 — Position-specific overlay ratings (§6 Position-specific overlays).
--
-- Goalkeepers are assessed on a different parameter set from outfield players
-- (shot-stopping, handling, command of area, distribution) rather than on
-- dribbling/finishing/sprinting. We reuse the existing report_position_notes
-- table — intended for overlay attributes — and give each attribute an optional
-- 1–10 rating plus stable keys, so the overlay can be rendered and compared
-- without distorting the seven weighted base categories.

alter table public.report_position_notes
  add column if not exists attribute_key  text,
  add column if not exists group_key      text,
  add column if not exists rating_1_to_10 integer
    check (rating_1_to_10 is null or rating_1_to_10 between 1 and 10);

comment on column public.report_position_notes.attribute_key is
  'Stable key for the overlay attribute, e.g. shot_stopping (goalkeeper).';
comment on column public.report_position_notes.group_key is
  'Overlay group this attribute belongs to: goalkeeper | defender | midfielder | winger | striker.';
comment on column public.report_position_notes.rating_1_to_10 is
  'Optional 1–10 overlay rating; does NOT feed the weighted 0–100 score (§6).';

create index if not exists report_position_notes_report_idx
  on public.report_position_notes (report_id);

-- ===== 0016_fifa_epp_alignment.sql =============================================
-- 0016 — FIFA Electronic Player Passport (EPP) alignment.
--
-- Adds the data needed to feed an official player passport through a member
-- association (e.g. the NFF): FIFA Connect IDs, member-association records, the
-- passport identity fields, and a registration-history "spine". This platform
-- does NOT issue an EPP — FIFA/associations do — but this makes the data
-- EPP-ready and exportable as an NFF registration dossier.

-- Member associations (e.g. Nigeria Football Federation). ---------------------
create table if not exists public.associations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  short_code      text,
  country         text,
  fifa_connect_id text,                 -- association FIFA Connect ID
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.associations is 'Member associations that register players (e.g. NFF). Source of passport/EPP data (FIFA RSTP).';

-- Clubs/academies get a FIFA Connect ID and a parent association. ------------
alter table public.organisations
  add column if not exists fifa_connect_id text,
  add column if not exists association_id   uuid references public.associations (id);

-- Passport identity fields on players (DOB/nationality already exist). --------
alter table public.players
  add column if not exists fifa_connect_id   text,
  add column if not exists gender            text check (gender is null or gender in ('male','female','other')),
  add column if not exists legal_first_name  text,
  add column if not exists legal_last_name   text,
  add column if not exists place_of_birth    text,
  add column if not exists country_of_birth  text;

comment on column public.players.fifa_connect_id is 'FIFA Connect ID assigned by the member association; null until registered.';

-- Registration history enums. ------------------------------------------------
do $$ begin
  create type public.registration_player_status as enum ('amateur','professional');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.registration_kind as enum ('permanent','loan');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.registration_state as enum ('confirmed','terminated','pending');
exception when duplicate_object then null; end $$;

-- Registration history — the passport spine (one row per registration spell).
-- FIFA passports list clubs from the calendar year of the player's 12th
-- birthday; season_year supports that filtering.
create table if not exists public.player_registrations (
  id                uuid primary key default gen_random_uuid(),
  player_id         uuid not null references public.players (id) on delete cascade,
  club_id           uuid references public.organisations (id),   -- registered club (if on-platform)
  club_name         text,                                        -- free-text fallback / historical club
  association_id    uuid references public.associations (id),
  season_year       integer check (season_year is null or season_year between 1950 and 2100),
  registered_from   date,
  registered_to     date,                                        -- null = current
  player_status     public.registration_player_status not null default 'amateur',
  registration_kind public.registration_kind          not null default 'permanent',
  training_category text,                                        -- club training category (I–IV)
  state             public.registration_state          not null default 'confirmed',
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table public.player_registrations is 'Per-spell registration history for a player (FIFA RSTP player passport / EPP). Does not replace the official association record.';
create index if not exists player_registrations_player_idx on public.player_registrations (player_id);

create trigger trg_player_registrations_updated_at
  before update on public.player_registrations
  for each row execute function set_updated_at();
create trigger trg_associations_updated_at
  before update on public.associations
  for each row execute function set_updated_at();

-- RLS ------------------------------------------------------------------------
alter table public.associations         enable row level security;
alter table public.player_registrations enable row level security;

-- Associations: readable by any signed-in user; only super admins write.
create policy associations_select on public.associations
  for select using (true);
create policy associations_write on public.associations
  for all using (private.tba_is_super_admin()) with check (private.tba_is_super_admin());

-- Registrations follow the same visibility as the player (staff / academy /
-- self / guardian / recruiter / scout); writes limited to staff and the
-- player's own academy.
create policy player_registrations_select on public.player_registrations
  for select using (private.tba_can_view_player(player_id));
create policy player_registrations_write on public.player_registrations
  for all using (
    private.tba_is_staff() or private.tba_academy_can_access_player(player_id)
  ) with check (
    private.tba_is_staff() or private.tba_academy_can_access_player(player_id)
  );

-- Seed the NFF so academies can attach registrations immediately. ------------
insert into public.associations (id, name, short_code, country)
values ('44444444-4444-4444-4444-444444444401', 'Nigeria Football Federation', 'NFF', 'Nigeria')
on conflict (id) do nothing;

-- ===== 0017_drills_and_curriculum.sql =============================================
-- 0017 — Training drill video link + age-band curriculum modules.

-- A training session can carry a video link for its drills (§5A E).
alter table public.training_sessions
  add column if not exists drill_video_url text;

-- Curriculum modules an academy builds up module-by-module, by age band (§5A A).
create table if not exists public.curriculum_modules (
  id          uuid primary key default gen_random_uuid(),
  academy_id  uuid not null references public.organisations (id) on delete cascade,
  age_band    public.age_band not null,
  title       text not null,
  focus       text,
  detail      text,
  video_url   text,
  position    integer not null default 0,
  created_by  uuid references public.users (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.curriculum_modules is 'Academy development curriculum, one module per row, grouped by age band (§5A).';
create index if not exists curriculum_modules_academy_band_idx
  on public.curriculum_modules (academy_id, age_band, position);
create trigger trg_curriculum_modules_updated_at
  before update on public.curriculum_modules
  for each row execute function set_updated_at();

alter table public.curriculum_modules enable row level security;
create policy curriculum_modules_select on public.curriculum_modules
  for select using (private.tba_is_staff() or private.tba_is_org_member(academy_id));
create policy curriculum_modules_write on public.curriculum_modules
  for all
  using (private.tba_is_staff() or private.tba_is_org_member(academy_id))
  with check (private.tba_is_staff() or private.tba_is_org_member(academy_id));

-- ===== 0018_platform_settings.sql =============================================
-- 0018 — Platform settings (single-row, super-admin editable).

create table if not exists public.platform_settings (
  id                                  uuid primary key,
  platform_name                       text not null default 'Talent Bridge Africa',
  support_email                       text,
  default_timezone                    text not null default 'Africa/Lagos',
  default_country                     text not null default 'Nigeria',
  season_label                        text not null default '2026/27',
  minor_age_threshold                 integer not null default 18
                                        check (minor_age_threshold between 13 and 21),
  require_guardian_consent_for_minors boolean not null default true,
  require_verification_for_active     boolean not null default true,
  restrict_pii_to_staff               boolean not null default true,
  default_confidence                  text not null default 'medium'
                                        check (default_confidence in ('low','medium','high')),
  min_observations                    integer not null default 2
                                        check (min_observations between 1 and 10),
  show_score_to_recruiters            boolean not null default true,
  updated_at                          timestamptz not null default now(),
  updated_by                          uuid references public.users (id)
);
comment on table public.platform_settings is 'Single-row platform configuration edited by super admins.';

alter table public.platform_settings enable row level security;
create policy platform_settings_select on public.platform_settings
  for select using (true);
create policy platform_settings_update on public.platform_settings
  for update using (private.tba_is_super_admin()) with check (private.tba_is_super_admin());

create trigger trg_platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function set_updated_at();

-- Seed the singleton row (fixed id). Inserts are not RLS-enabled for the app.
insert into public.platform_settings (id)
values ('ffffffff-ffff-4fff-8fff-ffffffffff01')
on conflict (id) do nothing;

