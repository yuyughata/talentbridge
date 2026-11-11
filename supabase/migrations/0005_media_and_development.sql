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
