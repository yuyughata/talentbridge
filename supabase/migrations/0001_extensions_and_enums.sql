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
