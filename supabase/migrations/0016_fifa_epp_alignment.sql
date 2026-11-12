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
