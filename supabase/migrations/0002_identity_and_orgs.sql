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
