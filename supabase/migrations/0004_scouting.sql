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
