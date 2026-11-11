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
