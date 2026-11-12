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
