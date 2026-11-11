-- ===========================================================================
-- RLS integration tests (§12 pre-pilot requirement)
-- ===========================================================================
-- Seeds fixtures as a privileged role, then asserts row visibility for each
-- role by impersonating users via `request.jwt.claims` (the same mechanism
-- Supabase Auth uses: auth.uid() reads the `sub` claim). Each assertion runs
-- the RLS-gated query as the `authenticated` role.
--
-- Run locally with supabase/tests/run_rls_tests.sh (throwaway Postgres), or as
-- a reference for `supabase test db`. The whole script runs in one transaction
-- and rolls back, so it is repeatable and leaves no data behind.
-- ===========================================================================

begin;

-- --- Fixtures (seeded as the privileged role; bypasses RLS) ----------------
set local role postgres;

-- Users (auth.users → public.users via handle_new_user trigger)
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'reviewer@tba.africa'),
  ('a0000000-0000-0000-0000-000000000002', 'scout@tba.africa'),
  ('a0000000-0000-0000-0000-000000000003', 'coachx@academyx.africa'),
  ('a0000000-0000-0000-0000-000000000004', 'coachy@academyy.africa'),
  ('a0000000-0000-0000-0000-000000000005', 'recruiter@clubz.africa'),
  ('a0000000-0000-0000-0000-000000000006', 'player@one.africa'),
  ('a0000000-0000-0000-0000-000000000007', 'guardian@one.africa');

-- Organisations
insert into organisations (id, name, type) values
  ('b0000000-0000-0000-0000-000000000001', 'TBA', 'tba'),
  ('b0000000-0000-0000-0000-000000000002', 'Academy X', 'academy'),
  ('b0000000-0000-0000-0000-000000000003', 'Academy Y', 'academy'),
  ('b0000000-0000-0000-0000-000000000004', 'Club Z', 'club');

-- Memberships
insert into organisation_members (organisation_id, user_id, role) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'tba_reviewer'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'scout'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'academy_staff'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'academy_staff'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'recruiter');

-- Players: P1 & P2 in Academy X (P1 linked to the player user), P3 in Academy Y
insert into players (id, primary_academy_id, user_id, display_name) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'Player One'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', null, 'Player Two'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', null, 'Player Three');

-- Guardian link for P1
insert into player_guardians (player_id, guardian_user_id, relationship) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'parent');

-- Recruiter (Club Z) has an approved, non-expired grant for P1 only
insert into recruitment_enquiries (recruiter_org_id, requested_by, player_id, status, access_expiry) values
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'approved', now() + interval '30 days');

-- Media on P1: one shared, one private
insert into media_assets (id, player_id, storage_provider, asset_reference, visibility) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'youtube', 'https://example.com/shared', 'shared'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'youtube', 'https://example.com/private', 'private');

-- Verification record (staff-only) + an audit entry
insert into verification_records (player_id, verification_type, status) values
  ('c0000000-0000-0000-0000-000000000001', 'identity', 'pending');
insert into audit_logs (actor_user_id, action, entity_type, entity_id) values
  ('a0000000-0000-0000-0000-000000000001', 'test.seed', 'player', 'c0000000-0000-0000-0000-000000000001');

-- Helper to impersonate a user id for the next assertion.
-- (Set via `set local request.jwt.claims` before each block.)

-- ===========================================================================
-- Assertions
-- ===========================================================================

-- A1: anonymous sees no players
set local role anon;
set local request.jwt.claims = '{}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 0 then raise exception 'A1 FAIL: anon saw % players (expected 0)', n; end if;
end $$;
reset role;

-- A2: a scout can view all players (internal assessment network)
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000002"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 3 then raise exception 'A2 FAIL: scout saw % players (expected 3)', n; end if;
end $$;
reset role;

-- A3: Academy X staff sees only Academy X players (not Academy Y)
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000003"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 2 then raise exception 'A3 FAIL: academyX saw % players (expected 2)', n; end if;
  if exists (select 1 from players where id = 'c0000000-0000-0000-0000-000000000003') then
    raise exception 'A3 FAIL: academyX could see Academy Y player';
  end if;
end $$;
reset role;

-- A4: TBA reviewer (staff) sees all players
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000001"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 3 then raise exception 'A4 FAIL: reviewer saw % players (expected 3)', n; end if;
end $$;
reset role;

-- A5: recruiter sees only the player they were granted (P1)
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000005"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 1 then raise exception 'A5 FAIL: recruiter saw % players (expected 1)', n; end if;
  if not exists (select 1 from players where id = 'c0000000-0000-0000-0000-000000000001') then
    raise exception 'A5 FAIL: recruiter could not see granted player P1';
  end if;
end $$;
reset role;

-- A6: a player sees only their own record
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000006"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 1 then raise exception 'A6 FAIL: player self saw % players (expected 1)', n; end if;
end $$;
reset role;

-- A7: a guardian sees only their linked child
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000007"}';
do $$ declare n int; begin
  select count(*) into n from players;
  if n <> 1 then raise exception 'A7 FAIL: guardian saw % players (expected 1)', n; end if;
end $$;
reset role;

-- A8: verification_records are staff-only
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000001"}';
do $$ declare n int; begin
  select count(*) into n from verification_records;
  if n <> 1 then raise exception 'A8 FAIL: reviewer saw % verification records (expected 1)', n; end if;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000003"}';
do $$ declare n int; begin
  select count(*) into n from verification_records;
  if n <> 0 then raise exception 'A8 FAIL: academyX saw % verification records (expected 0)', n; end if;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000005"}';
do $$ declare n int; begin
  select count(*) into n from verification_records;
  if n <> 0 then raise exception 'A8 FAIL: recruiter saw % verification records (expected 0)', n; end if;
end $$;
reset role;

-- A9: audit log is staff-only
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000005"}';
do $$ declare n int; begin
  select count(*) into n from audit_logs;
  if n <> 0 then raise exception 'A9 FAIL: recruiter saw % audit rows (expected 0)', n; end if;
end $$;
reset role;

-- A10: recruiter sees only shared/public media of a granted player, not private
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000005"}';
do $$ declare n int; begin
  select count(*) into n from media_assets where player_id = 'c0000000-0000-0000-0000-000000000001';
  if n <> 1 then raise exception 'A10 FAIL: recruiter saw % media (expected 1 shared)', n; end if;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000003"}';
do $$ declare n int; begin
  select count(*) into n from media_assets where player_id = 'c0000000-0000-0000-0000-000000000001';
  if n <> 2 then raise exception 'A10 FAIL: academyX saw % media (expected 2)', n; end if;
end $$;
reset role;

-- A11: a recruiter cannot insert a player (write denied by RLS)
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000005"}';
do $$ begin
  begin
    insert into players (primary_academy_id, display_name)
    values ('b0000000-0000-0000-0000-000000000002', 'Injected');
    raise exception 'A11 FAIL: recruiter was able to insert a player';
  exception
    when insufficient_privilege or check_violation then null; -- expected
  end;
end $$;
reset role;

-- A12: a scout cannot approve a report (only staff review) — report owned by scout
set local role postgres;
insert into scouting_reports (id, player_id, scout_user_id, status)
values ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'submitted');
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a0000000-0000-0000-0000-000000000002"}';
do $$ declare updated int; begin
  update scouting_reports set status = 'approved'
  where id = 'e0000000-0000-0000-0000-000000000001';
  get diagnostics updated = row_count;
  -- RLS update USING clause bars a submitted report from its scout; 0 rows change.
  if updated <> 0 then raise exception 'A12 FAIL: scout approved own report (% rows)', updated; end if;
end $$;
reset role;

do $$ begin raise notice 'ALL RLS TESTS PASSED'; end $$;

rollback;
