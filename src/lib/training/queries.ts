import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface SessionRow {
  id: string;
  title: string;
  objective: string | null;
  scheduled_at: string | null;
  duration_min: number | null;
  intensity_intent: string | null;
  status: string;
  academy_id: string;
}

export interface CurriculumRow {
  id: string;
  name: string;
  age_band: string;
  focus_summary: string | null;
  is_global: boolean;
}

export async function listSessions(academyId: string): Promise<SessionRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("training_sessions")
    .select(
      "id, title, objective, scheduled_at, duration_min, intensity_intent, status, academy_id",
    )
    .eq("academy_id", academyId)
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .limit(80);
  return (data as SessionRow[] | null) ?? [];
}

export async function getSession(id: string): Promise<SessionRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("training_sessions")
    .select(
      "id, title, objective, scheduled_at, duration_min, intensity_intent, status, academy_id",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as SessionRow | null) ?? null;
}

export interface AttendanceState {
  present: Record<string, boolean>;
}

/** Attendance map (player_id → present) for a session. */
export async function getSessionAttendance(sessionId: string): Promise<Record<string, boolean>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("session_attendance")
    .select("player_id, present")
    .eq("session_id", sessionId);
  const map: Record<string, boolean> = {};
  for (const r of (data as { player_id: string; present: boolean }[] | null) ?? []) {
    map[r.player_id] = r.present;
  }
  return map;
}

export interface ObservationRow {
  id: string;
  observation: string | null;
  player_name: string | null;
  created_at: string;
}

export async function getSessionObservations(sessionId: string): Promise<ObservationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("session_observations")
    .select("id, observation, created_at, players(display_name, preferred_name)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const p = row.players as { display_name: string | null; preferred_name: string | null } | null;
    return {
      ...(row as unknown as ObservationRow),
      player_name: p?.preferred_name || p?.display_name || null,
    };
  });
}

/** Age-band curriculum templates available to an academy (global + own) (§5A A). */
export async function listCurricula(academyId?: string): Promise<CurriculumRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("curriculum_templates")
    .select("id, name, age_band, focus_summary, is_global")
    .order("age_band", { ascending: true });
  const rows = (data as CurriculumRow[] | null) ?? [];
  return rows.filter((r) => r.is_global || (academyId && !r.is_global));
}
