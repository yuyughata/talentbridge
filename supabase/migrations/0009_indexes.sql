-- ===========================================================================
-- 0009  Indexes for common filters (§8)
-- ===========================================================================

-- Identity / orgs
create index idx_users_email on users (email);
create index idx_org_members_user on organisation_members (user_id);
create index idx_org_members_org on organisation_members (organisation_id);
create index idx_orgs_type on organisations (type);

-- Players: discovery filter rail (§4 Recruiter discovery) — position, foot, location, status.
create index idx_players_academy on players (primary_academy_id);
create index idx_players_status on players (profile_status);
create index idx_players_position on players (primary_position);
create index idx_players_foot on players (dominant_foot);
create index idx_players_location on players (location);
create index idx_players_user on players (user_id);

create index idx_guardians_player on player_guardians (player_id);
create index idx_guardians_user on player_guardians (guardian_user_id);
create index idx_consents_player on player_consents (player_id);
create index idx_club_history_player on player_club_history (player_id);
create index idx_verification_player on verification_records (player_id);
create index idx_verification_expiry on verification_records (expires_at);

-- Scouting
create index idx_assignments_scout on scouting_assignments (scout_user_id);
create index idx_assignments_status on scouting_assignments (status);
create index idx_assignments_due on scouting_assignments (due_date);
create index idx_reports_player on scouting_reports (player_id);
create index idx_reports_scout on scouting_reports (scout_user_id);
create index idx_reports_status on scouting_reports (status);
create index idx_reports_match on scouting_reports (match_id);
create index idx_ratings_report on scorecard_ratings (report_id);

-- Media / development
create index idx_media_player on media_assets (player_id);
create index idx_media_visibility on media_assets (visibility);
create index idx_dev_plans_player on development_plans (player_id);
create index idx_dev_goals_plan on development_goals (plan_id);

-- Discovery / recruitment
create index idx_shortlist_players_shortlist on shortlist_players (shortlist_id);
create index idx_shortlist_players_player on shortlist_players (player_id);
create index idx_enquiries_recruiter on recruitment_enquiries (recruiter_org_id);
create index idx_enquiries_player on recruitment_enquiries (player_id);
create index idx_enquiries_status on recruitment_enquiries (status);

-- Notifications / audit
create index idx_notifications_user on notifications (user_id, read_at);
create index idx_audit_actor on audit_logs (actor_user_id);
create index idx_audit_entity on audit_logs (entity_type, entity_id);
create index idx_audit_created on audit_logs (created_at);

-- Training & development module
create index idx_programmes_academy on training_programmes (academy_id);
create index idx_microcycles_programme on training_microcycles (programme_id);
create index idx_sessions_academy on training_sessions (academy_id);
create index idx_sessions_programme on training_sessions (programme_id);
create index idx_sessions_scheduled on training_sessions (scheduled_at);
create index idx_attendance_session on session_attendance (session_id);
create index idx_attendance_player on session_attendance (player_id);
create index idx_observations_session on session_observations (session_id);
create index idx_observations_player on session_observations (player_id);
create index idx_workload_player on workload_entries (player_id);
create index idx_dev_reviews_plan on development_reviews (plan_id);
create index idx_dev_reviews_player on development_reviews (player_id);
