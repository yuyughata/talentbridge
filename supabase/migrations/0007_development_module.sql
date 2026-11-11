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
