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
