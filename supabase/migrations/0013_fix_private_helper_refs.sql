-- ===========================================================================
-- 0013  Fix private helper cross-references (critical RLS bug)
-- ===========================================================================
-- When 0010 moved the SECURITY DEFINER helpers from public → private, two of
-- them kept UNQUALIFIED calls to sibling helpers (tba_is_staff → tba_is_super_admin,
-- tba_can_write_report → tba_is_staff). Those functions run with search_path=public,
-- so after the move the unqualified names no longer resolve ("function
-- tba_is_super_admin() does not exist") the moment a policy that uses them is
-- evaluated against a real row. Schema-qualify the calls so they resolve.
--
-- Surfaced by the RLS integration test suite (supabase/tests). `create or replace`
-- keeps each function's OID, so existing RLS policies continue to bind.
-- ===========================================================================

create or replace function private.tba_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_super_admin() or exists (
    select 1
    from organisation_members m
    join organisations o on o.id = m.organisation_id
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and o.type = 'tba'
      and m.role in ('tba_reviewer', 'super_admin')
  );
$$;

create or replace function private.tba_can_write_report(p_report uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select private.tba_is_staff() or exists (
    select 1 from scouting_reports r where r.id = p_report and r.scout_user_id = auth.uid()
  );
$$;
