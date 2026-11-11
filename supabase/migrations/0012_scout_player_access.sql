-- ===========================================================================
-- 0012  Scouts can view players (RLS fix surfaced by the RLS test suite)
-- ===========================================================================
-- Scouts are part of TBA's internal assessment network and must be able to see
-- players to scout them (§5 M05, §3 Scout workspace → Players). The original
-- tba_can_view_player rule (staff ∨ self ∨ guardian ∨ academy ∨ recruiter) left
-- plain scouts with zero player visibility. Add an explicit scout path.
--
-- Recruiter access stays restricted (invite-only, time-limited, §2); this change
-- only broadens access for active `scout` members. Helpers live in the private
-- schema (see 0010); private calls are schema-qualified so `create or replace`
-- re-resolves them regardless of the function's search_path.
-- ===========================================================================

create or replace function private.tba_is_scout()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organisation_members m
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and m.role = 'scout'
  );
$$;

create or replace function private.tba_can_view_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_staff()
      or private.tba_is_self_player(p_player)
      or private.tba_is_guardian_of(p_player)
      or private.tba_academy_can_access_player(p_player)
      or private.tba_recruiter_has_player_access(p_player)
      or private.tba_is_scout();
$$;
