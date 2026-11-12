import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AssignmentRow {
  id: string;
  status: string;
  objective: string | null;
  target_position: string | null;
  due_date: string | null;
  target_player_id: string | null;
  player_name: string | null;
  match_label: string | null;
  scout_name?: string | null;
}

function playerName(row: Record<string, unknown>): string | null {
  const p = row.players as { display_name: string | null; preferred_name: string | null } | null;
  if (!p) return null;
  return p.preferred_name || p.display_name || null;
}

function matchLabel(row: Record<string, unknown>): string | null {
  const m = row.matches as { competition: string | null; away_team: string | null } | null;
  if (!m) return null;
  return [m.competition, m.away_team].filter(Boolean).join(" vs ") || null;
}

const SELECT =
  "id, status, objective, target_position, due_date, target_player_id, players(display_name, preferred_name), matches(competition, away_team)";

/** Assignments for the current scout (RLS scopes to own). */
export async function listMyAssignments(userId: string): Promise<AssignmentRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_assignments")
    .select(SELECT)
    .eq("scout_user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(80);
  return (data ?? []).map((r) => ({
    ...(r as unknown as AssignmentRow),
    player_name: playerName(r as Record<string, unknown>),
    match_label: matchLabel(r as Record<string, unknown>),
  }));
}

/** All assignments (TBA staff view, RLS-scoped). Includes the assigned scout. */
export async function listAllAssignments(): Promise<AssignmentRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_assignments")
    .select(
      "id, status, objective, target_position, due_date, target_player_id, players(display_name, preferred_name), matches(competition, away_team), scout:users!scouting_assignments_scout_user_id_fkey(display_name, email)",
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(80);
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const scout = row.scout as { display_name: string | null; email: string | null } | null;
    return {
      ...(row as unknown as AssignmentRow),
      player_name: playerName(row),
      match_label: matchLabel(row),
      scout_name: scout?.display_name || scout?.email || null,
    };
  });
}

export interface ScoutOption {
  id: string;
  name: string;
}

/** Distinct users holding a scout role, for the assignment picker (staff view). */
export async function listScouts(): Promise<ScoutOption[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("organisation_members")
    .select("user_id, users!organisation_members_user_id_fkey(display_name, email)")
    .eq("role", "scout")
    .eq("membership_status", "active");

  const seen = new Set<string>();
  const out: ScoutOption[] = [];
  for (const r of data ?? []) {
    const row = r as Record<string, unknown>;
    const uid = row.user_id as string;
    if (seen.has(uid)) continue;
    seen.add(uid);
    const u = row.users as { display_name: string | null; email: string | null } | null;
    out.push({ id: uid, name: u?.display_name || u?.email || "Scout" });
  }
  return out;
}
