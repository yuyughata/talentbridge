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
