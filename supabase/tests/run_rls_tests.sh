#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Run the RLS integration tests (supabase/tests/rls.test.sql) against a
# throwaway Postgres cluster with the migrations applied and a Supabase-style
# `auth` stub (auth.uid() reads request.jwt.claims). No network / no project.
#
# Requires a local PostgreSQL (initdb, pg_ctl, psql, createdb on PATH).
# Usage: supabase/tests/run_rls_tests.sh
# ---------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATIONS="$REPO_ROOT/supabase/migrations"
TEST_SQL="$REPO_ROOT/supabase/tests/rls.test.sql"
WORK="$(mktemp -d)"
PORT="${PGRLS_PORT:-55439}"

cleanup() { pg_ctl -D "$WORK/data" stop -w -m immediate >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

initdb -D "$WORK/data" --auth=trust >/dev/null
pg_ctl -D "$WORK/data" -o "-p $PORT -k $WORK" -l "$WORK/log" -w start >/dev/null
export PGHOST="$WORK" PGPORT="$PORT" PGUSER="$(whoami)"
createdb tba

psql -d tba -v ON_ERROR_STOP=1 -q <<'SQL'
create extension if not exists pgcrypto;
-- API roles Supabase provides by default
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
-- auth stub: auth.uid() reads the JWT `sub` claim, exactly like Supabase.
create schema if not exists auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create or replace function auth.uid() returns uuid language sql stable as $fn$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$fn$;
SQL

for f in "$MIGRATIONS"/0*.sql; do
  psql -d tba -v ON_ERROR_STOP=1 -q -f "$f"
done

# Grant the API roles table/function access; RLS remains the gate.
psql -d tba -v ON_ERROR_STOP=1 -q <<'SQL'
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant execute on all functions in schema public to anon, authenticated;
SQL

echo "== Running RLS assertions =="
psql -d tba -v ON_ERROR_STOP=1 -f "$TEST_SQL" 2>&1 | grep -E "NOTICE|FAIL|ERROR" || true
