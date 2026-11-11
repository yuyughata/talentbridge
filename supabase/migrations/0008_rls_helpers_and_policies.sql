-- ===========================================================================
-- 0008  Row Level Security — helper functions and policies
-- ===========================================================================
-- Blueprint §7: "Enforce permissions in database policies, not only by hiding
-- buttons in the interface." §12: recruiter access is invite-only, verified and
-- time-limited; sensitive documents are restricted to verification staff.
--
-- The Supabase service_role key bypasses RLS and is used only by trusted server
-- actions (e.g. verification workflows). All browser/anon/authenticated traffic
-- is subject to the policies below.
--
-- NOTE: These policies are a reviewed baseline. A full RLS test suite and
-- security review are required before pilot launch (§12, docs/06-...md).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid policy recursion)
-- ---------------------------------------------------------------------------
create or replace function tba_is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_super_admin from users where id = auth.uid()), false);
$$;

create or replace function tba_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_super_admin() or exists (
    select 1
    from organisation_members m
    join organisations o on o.id = m.organisation_id
    where m.user_id = auth.uid()
      and m.membership_status = 'active'
      and o.type = 'tba'
      and m.role in ('tba_reviewer', 'super_admin')
  );
$$;

create or replace function tba_is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organisation_members m
    where m.user_id = auth.uid()
      and m.organisation_id = p_org
      and m.membership_status = 'active'
  );
$$;

create or replace function tba_is_self_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from players p where p.id = p_player and p.user_id = auth.uid());
$$;

create or replace function tba_is_guardian_of(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from player_guardians g
    where g.player_id = p_player and g.guardian_user_id = auth.uid()
  );
$$;

create or replace function tba_academy_can_access_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from players p
    join organisation_members m on m.organisation_id = p.primary_academy_id
    where p.id = p_player
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
      and m.role in ('academy_staff', 'tba_reviewer', 'super_admin')
  );
$$;

-- Recruiter access is granted per player, approved by TBA and time-limited (§5 M10).
create or replace function tba_recruiter_has_player_access(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from recruitment_enquiries e
    join organisation_members m on m.organisation_id = e.recruiter_org_id
    where e.player_id = p_player
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
      and e.status in ('approved', 'active')
      and (e.access_expiry is null or e.access_expiry > now())
  );
$$;

-- Combined read rule for player-scoped data.
create or replace function tba_can_view_player(p_player uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_staff()
      or tba_is_self_player(p_player)
      or tba_is_guardian_of(p_player)
      or tba_academy_can_access_player(p_player)
      or tba_recruiter_has_player_access(p_player);
$$;

-- Does the current user have write access to a report (owner scout or staff)?
create or replace function tba_can_write_report(p_report uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select tba_is_staff() or exists (
    select 1 from scouting_reports r
    where r.id = p_report and r.scout_user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table users                   enable row level security;
alter table organisations           enable row level security;
alter table organisation_members    enable row level security;
alter table players                 enable row level security;
alter table player_guardians        enable row level security;
alter table player_consents         enable row level security;
alter table player_club_history     enable row level security;
alter table verification_records    enable row level security;
alter table matches                 enable row level security;
alter table scouting_assignments    enable row level security;
alter table scouting_reports        enable row level security;
alter table scorecard_ratings       enable row level security;
alter table speed_subscores         enable row level security;
alter table report_position_notes   enable row level security;
alter table report_key_moments      enable row level security;
alter table media_assets            enable row level security;
alter table development_plans       enable row level security;
alter table development_goals       enable row level security;
alter table shortlists              enable row level security;
alter table shortlist_players       enable row level security;
alter table recruitment_enquiries   enable row level security;
alter table notifications           enable row level security;
alter table audit_logs              enable row level security;
alter table curriculum_templates    enable row level security;
alter table position_training_templates enable row level security;
alter table training_programmes     enable row level security;
alter table training_microcycles    enable row level security;
alter table training_sessions       enable row level security;
alter table session_goal_links      enable row level security;
alter table session_attendance      enable row level security;
alter table session_observations    enable row level security;
alter table workload_entries        enable row level security;
alter table development_reviews     enable row level security;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create policy users_select_self_or_staff on users
  for select using (id = auth.uid() or tba_is_staff());
create policy users_update_self on users
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy users_staff_manage on users
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- organisations
-- ---------------------------------------------------------------------------
create policy orgs_select_member_or_staff on organisations
  for select using (tba_is_org_member(id) or tba_is_staff());
create policy orgs_staff_manage on organisations
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- organisation_members
-- ---------------------------------------------------------------------------
create policy org_members_select on organisation_members
  for select using (user_id = auth.uid() or tba_is_org_member(organisation_id) or tba_is_staff());
create policy org_members_staff_manage on organisation_members
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------------
create policy players_select on players
  for select using (tba_can_view_player(id));
create policy players_insert on players
  for insert with check (tba_is_staff() or tba_is_org_member(primary_academy_id));
create policy players_update on players
  for update using (
    tba_is_staff()
    or tba_academy_can_access_player(id)
    or tba_is_self_player(id)
  ) with check (
    tba_is_staff()
    or tba_academy_can_access_player(id)
    or tba_is_self_player(id)
  );

-- ---------------------------------------------------------------------------
-- player_guardians
-- ---------------------------------------------------------------------------
create policy guardians_select on player_guardians
  for select using (
    guardian_user_id = auth.uid() or tba_is_staff() or tba_academy_can_access_player(player_id)
  );
create policy guardians_staff_manage on player_guardians
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- player_consents
-- ---------------------------------------------------------------------------
create policy consents_select on player_consents
  for select using (tba_can_view_player(player_id));
create policy consents_write on player_consents
  for all using (
    tba_is_staff() or tba_is_self_player(player_id) or tba_is_guardian_of(player_id)
  ) with check (
    tba_is_staff() or tba_is_self_player(player_id) or tba_is_guardian_of(player_id)
  );

-- ---------------------------------------------------------------------------
-- player_club_history
-- ---------------------------------------------------------------------------
create policy club_history_select on player_club_history
  for select using (tba_can_view_player(player_id));
create policy club_history_write on player_club_history
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

-- ---------------------------------------------------------------------------
-- verification_records  (restricted to TBA staff — §12)
-- ---------------------------------------------------------------------------
create policy verification_staff_only on verification_records
  for all using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- matches  (non-sensitive context)
-- ---------------------------------------------------------------------------
create policy matches_select_authenticated on matches
  for select using (auth.uid() is not null);
create policy matches_write on matches
  for all using (tba_is_staff() or created_by = auth.uid())
  with check (tba_is_staff() or created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- scouting_assignments
-- ---------------------------------------------------------------------------
create policy assignments_select on scouting_assignments
  for select using (scout_user_id = auth.uid() or tba_is_staff());
create policy assignments_staff_manage on scouting_assignments
  for all using (tba_is_staff()) with check (tba_is_staff());
create policy assignments_scout_update on scouting_assignments
  for update using (scout_user_id = auth.uid()) with check (scout_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- scouting_reports
-- ---------------------------------------------------------------------------
create policy reports_select on scouting_reports
  for select using (
    tba_is_staff()
    or scout_user_id = auth.uid()
    or (status = 'approved' and tba_can_view_player(player_id))
  );
create policy reports_scout_insert on scouting_reports
  for insert with check (scout_user_id = auth.uid() or tba_is_staff());
create policy reports_update on scouting_reports
  for update using (
    tba_is_staff() or (scout_user_id = auth.uid() and status in ('draft', 'needs_clarification'))
  ) with check (
    tba_is_staff() or scout_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- report child tables (scorecard_ratings, speed_subscores, notes, key moments)
-- ---------------------------------------------------------------------------
create policy ratings_select on scorecard_ratings
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy ratings_write on scorecard_ratings
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy speed_select on speed_subscores
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy speed_write on speed_subscores
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy posnotes_select on report_position_notes
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy posnotes_write on report_position_notes
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

create policy keymoments_select on report_key_moments
  for select using (exists (
    select 1 from scouting_reports r
    where r.id = report_id
      and (tba_is_staff() or r.scout_user_id = auth.uid()
           or (r.status = 'approved' and tba_can_view_player(r.player_id)))
  ));
create policy keymoments_write on report_key_moments
  for all using (tba_can_write_report(report_id)) with check (tba_can_write_report(report_id));

-- ---------------------------------------------------------------------------
-- media_assets  (private by default; recruiters only see shared/public + access)
-- ---------------------------------------------------------------------------
create policy media_select on media_assets
  for select using (
    tba_is_staff()
    or tba_is_self_player(player_id)
    or tba_is_guardian_of(player_id)
    or tba_academy_can_access_player(player_id)
    or (visibility in ('shared', 'public') and tba_recruiter_has_player_access(player_id))
  );
create policy media_write on media_assets
  for all using (
    tba_is_staff() or tba_academy_can_access_player(player_id) or tba_is_self_player(player_id)
  ) with check (
    tba_is_staff() or tba_academy_can_access_player(player_id) or tba_is_self_player(player_id)
  );

-- ---------------------------------------------------------------------------
-- development_plans / development_goals
-- ---------------------------------------------------------------------------
create policy dev_plans_select on development_plans
  for select using (tba_can_view_player(player_id));
create policy dev_plans_write on development_plans
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

create policy dev_goals_select on development_goals
  for select using (exists (
    select 1 from development_plans p where p.id = plan_id and tba_can_view_player(p.player_id)
  ));
create policy dev_goals_write on development_goals
  for all using (exists (
    select 1 from development_plans p where p.id = plan_id
      and (tba_is_staff() or tba_academy_can_access_player(p.player_id))
  )) with check (exists (
    select 1 from development_plans p where p.id = plan_id
      and (tba_is_staff() or tba_academy_can_access_player(p.player_id))
  ));

-- ---------------------------------------------------------------------------
-- shortlists / shortlist_players
-- ---------------------------------------------------------------------------
create policy shortlists_select on shortlists
  for select using (tba_is_staff() or tba_is_org_member(organisation_id) or created_by = auth.uid());
create policy shortlists_write on shortlists
  for all using (tba_is_staff() or created_by = auth.uid() or tba_is_org_member(organisation_id))
  with check (tba_is_staff() or created_by = auth.uid() or tba_is_org_member(organisation_id));

create policy shortlist_players_select on shortlist_players
  for select using (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  ));
create policy shortlist_players_write on shortlist_players
  for all using (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  )) with check (exists (
    select 1 from shortlists s where s.id = shortlist_id
      and (tba_is_staff() or tba_is_org_member(s.organisation_id) or s.created_by = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- recruitment_enquiries
-- ---------------------------------------------------------------------------
create policy enquiries_select on recruitment_enquiries
  for select using (tba_is_staff() or tba_is_org_member(recruiter_org_id));
create policy enquiries_recruiter_insert on recruitment_enquiries
  for insert with check (tba_is_org_member(recruiter_org_id));
create policy enquiries_staff_decide on recruitment_enquiries
  for update using (tba_is_staff()) with check (tba_is_staff());

-- ---------------------------------------------------------------------------
-- notifications  (owner only)
-- ---------------------------------------------------------------------------
create policy notifications_owner on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- audit_logs  (staff read; append-only insert; no update/delete policy)
-- ---------------------------------------------------------------------------
create policy audit_select_staff on audit_logs
  for select using (tba_is_staff());
create policy audit_insert on audit_logs
  for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Academy training & development module (academy-scoped)
-- ---------------------------------------------------------------------------
create policy curriculum_select on curriculum_templates
  for select using (is_global or tba_is_staff() or tba_is_org_member(academy_id));
create policy curriculum_write on curriculum_templates
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy postemplates_select on position_training_templates
  for select using (auth.uid() is not null);
create policy postemplates_staff_write on position_training_templates
  for all using (tba_is_staff()) with check (tba_is_staff());

create policy programmes_select on training_programmes
  for select using (tba_is_staff() or tba_is_org_member(academy_id));
create policy programmes_write on training_programmes
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy microcycles_access on training_microcycles
  for all using (exists (
    select 1 from training_programmes p where p.id = programme_id
      and (tba_is_staff() or tba_is_org_member(p.academy_id))
  )) with check (exists (
    select 1 from training_programmes p where p.id = programme_id
      and (tba_is_staff() or tba_is_org_member(p.academy_id))
  ));

create policy sessions_select on training_sessions
  for select using (tba_is_staff() or tba_is_org_member(academy_id));
create policy sessions_write on training_sessions
  for all using (tba_is_staff() or tba_is_org_member(academy_id))
  with check (tba_is_staff() or tba_is_org_member(academy_id));

create policy session_goals_access on session_goal_links
  for all using (exists (
    select 1 from training_sessions s where s.id = session_id
      and (tba_is_staff() or tba_is_org_member(s.academy_id))
  )) with check (exists (
    select 1 from training_sessions s where s.id = session_id
      and (tba_is_staff() or tba_is_org_member(s.academy_id))
  ));

-- Attendance: academy staff manage; linked player/guardian may read their own row.
create policy attendance_select on session_attendance
  for select using (
    tba_is_staff()
    or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
    or tba_is_self_player(player_id)
    or tba_is_guardian_of(player_id)
  );
create policy attendance_write on session_attendance
  for all using (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  ) with check (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  );

-- Observations: academy/staff only (coaching record, not recruiter-facing — §5A I).
create policy observations_access on session_observations
  for all using (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  ) with check (
    tba_is_staff() or exists (select 1 from training_sessions s where s.id = session_id and tba_is_org_member(s.academy_id))
  );

-- Workload / welfare data: restricted to academy staff + TBA staff only (§5A H/I).
create policy workload_access on workload_entries
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));

-- Development reviews: visible to those who can view the player; written by academy/staff.
create policy dev_reviews_select on development_reviews
  for select using (tba_can_view_player(player_id));
create policy dev_reviews_write on development_reviews
  for all using (tba_is_staff() or tba_academy_can_access_player(player_id))
  with check (tba_is_staff() or tba_academy_can_access_player(player_id));
