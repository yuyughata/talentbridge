# Database export — move Talent Bridge Africa to a new Supabase project

A complete, self-contained snapshot of the live Supabase database
(`vdggexjlaohjlcqadbgr`), ready to recreate on a fresh project. Every data block
in `data.sql` was **md5-verified byte-for-byte** against the source database when
generated (2026-11-13).

## Files

| File | What it is |
|------|-----------|
| `schema.sql` | The full schema — extensions, enums, tables, RLS policies, `private.*` SECURITY DEFINER helpers, triggers and indexes. This is migrations `0001`–`0018` concatenated in order. |
| `data.sql` | All live data: **117 rows** across **28 public tables**, plus **7 auth users + 7 identities** (original bcrypt password hashes, so existing logins keep working). |
| `README.md` | This runbook. |

> The authoritative schema is still `supabase/migrations/`. `schema.sql` is a
> convenience bundle for a one-shot restore without the Supabase CLI.

## What is and isn't included

- **Included:** public schema structure + data, and `auth.users` / `auth.identities`
  for the 7 accounts (admin, reviewer, scout, coach, recruiter, player, guardian).
- **Not included (nothing to move):** Storage objects — the source project has
  **zero** storage buckets and objects. Transient auth rows (sessions, refresh
  tokens, MFA) are intentionally omitted; users simply sign in again.
- **Not included (secret, set per-project):** API keys, the JWT secret, SMTP and
  any dashboard-level auth settings. Reconfigure these on the new project.

## Restore steps

1. **Create the new Supabase project** (note its project ref, DB password, and the
   new API URL + keys).

2. **Apply the schema** — either:
   - **CLI (recommended):** `supabase link --project-ref <NEW_REF>` then
     `supabase db push` (applies `supabase/migrations/`), **or**
   - **SQL editor:** paste and run `schema.sql`.

3. **Load the data** — in the new project's **SQL editor**, paste and run
   `data.sql`. It runs in one transaction, loads auth accounts first, then clears
   the migration-seeded rows and loads the authoritative data. It sets
   `session_replication_role = replica` during the load so triggers and FK order
   don't interfere, and resets it at the end.

4. **Re-point the app** — update the Next.js environment variables to the new
   project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - any optional AI keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) you already use.

5. **Create storage buckets if/when needed** — none exist in the source yet. When
   the app starts storing documents/media, create the private bucket(s) it expects
   on the new project (and port their access policies).

## Verify the restore

Run this on the new project; counts should match the table below:

```sql
select 'players' t, count(*) from public.players
union all select 'scouting_reports', count(*) from public.scouting_reports
union all select 'scorecard_ratings', count(*) from public.scorecard_ratings
union all select 'auth.users', count(*) from auth.users
order by 1;
```

Expected row counts (source snapshot):

```
associations 1          organisation_members 4    scorecard_ratings 28
audit_logs 2            organisations 3           scouting_assignments 2
curriculum_modules 5    platform_settings 1       scouting_reports 4
curriculum_templates 4  player_consents 4         session_attendance 7
development_goals 2     player_guardians 1        speed_subscores 3
development_plans 1     player_registrations 2    training_sessions 1
development_reviews 1   players 11                users 7
matches 1               position_training_templates 5   verification_records 3
media_assets 2          recruitment_enquiries 1
notifications 3         report_position_notes 8   auth.users 7 / auth.identities 7
```

## Alternative: authoritative CLI dump

This export was produced through the Supabase Management API (the only channel
reachable from the build sandbox). If you have direct database access, the
canonical move is:

```bash
# from the SOURCE project
supabase db dump --db-url "postgresql://postgres:<pw>@db.vdggexjlaohjlcqadbgr.supabase.co:5432/postgres" -f schema.sql
supabase db dump --db-url "...same..." --data-only -f data.sql
# restore into the NEW project
psql "postgresql://postgres:<pw>@db.<NEW_REF>.supabase.co:5432/postgres" -f schema.sql
psql "...new..." -f data.sql
```
