-- ===========================================================================
-- 0006  Talent discovery, recruiter access, notifications and audit
-- ===========================================================================
-- §5 M09 (shortlists), M10 (recruiter access/enquiries), M13 (notifications),
-- M14 (audit), §8
-- ===========================================================================

-- Internal + recruiter shortlists (§5 M09).
create table shortlists (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations (id) on delete cascade,
  created_by      uuid not null references users (id),
  name            text not null,
  purpose         text,
  visibility      media_visibility not null default 'internal',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table shortlists is 'Internal / recruiter shortlists (§5 M09).';

create trigger trg_shortlists_updated_at
  before update on shortlists
  for each row execute function set_updated_at();

create table shortlist_players (
  id           uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references shortlists (id) on delete cascade,
  player_id    uuid not null references players (id) on delete cascade,
  notes        text,                                      -- reason for inclusion/exclusion (§5 M09)
  added_by     uuid references users (id),
  added_at     timestamptz not null default now(),
  unique (shortlist_id, player_id)
);
comment on table shortlist_players is 'Players on a shortlist with reason notes (§5 M09).';

-- Recruiter access requests / enquiries (§5 M10, §9 Recruiter access).
-- Access is time-limited and logged; no unrestricted browse of the database (§2).
create table recruitment_enquiries (
  id               uuid primary key default gen_random_uuid(),
  recruiter_org_id uuid not null references organisations (id) on delete cascade,
  requested_by     uuid not null references users (id),
  player_id        uuid references players (id) on delete cascade,
  enquiry_type     text,                                  -- access_request | enquiry | portfolio_request
  message          text,
  status           enquiry_status not null default 'requested',
  decided_by       uuid references users (id),            -- TBA reviewer/admin
  decided_at       timestamptz,
  access_granted_at timestamptz,
  access_expiry    timestamptz,                           -- time-limited access (§5 M10)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table recruitment_enquiries is 'Recruiter access requests and enquiries; time-limited, human-approved, logged (§5 M10, §2).';

create trigger trg_recruitment_enquiries_updated_at
  before update on recruitment_enquiries
  for each row execute function set_updated_at();

-- Notifications / tasks (§5 M13).
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  type        text not null,                              -- assignment | review | consent_renewal | access_request | development_review
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
comment on table notifications is 'In-app notifications (§5 M13). Email is sent via the transactional provider.';

-- Append-only audit trail (§5 M14, §12). Every sensitive access/change recorded.
create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users (id),
  action        text not null,                            -- e.g. 'player.view', 'document.download', 'report.approve'
  entity_type   text not null,
  entity_id     uuid,
  metadata      jsonb not null default '{}'::jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);
comment on table audit_logs is 'Append-only audit trail; log every sensitive view/download/change (§5 M14, §12). No UPDATE/DELETE policy is granted.';
