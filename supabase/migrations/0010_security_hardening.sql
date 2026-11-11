-- ===========================================================================
-- 0010  Security hardening (post-deploy advisor fixes)
-- ===========================================================================
-- Addresses Supabase database linter findings after the initial schema:
--  * 0011 function_search_path_mutable — pin search_path on the trigger helper.
--  * 0028/0029 (anon|authenticated)_security_definer_function_executable —
--    the tba_* RLS helper functions are SECURITY DEFINER (required to avoid RLS
--    recursion) and were exposed as PostgREST RPC endpoints in the public schema.
--    Moving them to a non-exposed `private` schema removes the RPC surface while
--    keeping RLS working: existing policies reference the functions by OID, which
--    is unchanged by a schema move. API roles keep EXECUTE (granted to PUBLIC)
--    and are granted USAGE on the schema so policy evaluation can still call them.
-- ===========================================================================

alter function public.set_updated_at() set search_path = public;

create schema if not exists private;

alter function public.tba_is_super_admin() set schema private;
alter function public.tba_is_staff() set schema private;
alter function public.tba_is_org_member(uuid) set schema private;
alter function public.tba_is_self_player(uuid) set schema private;
alter function public.tba_is_guardian_of(uuid) set schema private;
alter function public.tba_academy_can_access_player(uuid) set schema private;
alter function public.tba_recruiter_has_player_access(uuid) set schema private;
alter function public.tba_can_view_player(uuid) set schema private;
alter function public.tba_can_write_report(uuid) set schema private;

grant usage on schema private to anon, authenticated, service_role;
