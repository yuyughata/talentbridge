import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface GoalRow {
  id: string;
  attribute: string;
  baseline: string | null;
  target: string | null;
  action: string | null;
  due_date: string | null;
  status: string;
  coach_comment: string | null;
}

export interface PlanWithGoals {
  id: string;
  title: string | null;
  baseline_note: string | null;
  review_date: string | null;
  status: string;
  created_at: string;
  goals: GoalRow[];
}

export interface ReviewRow {
  id: string;
  cycle_label: string | null;
  review_date: string | null;
  technical_trend: string | null;
  tactical_trend: string | null;
  speed_trend: string | null;
  decision_trend: string | null;
  summary: string | null;
  next_cycle_focus: string | null;
}

/** All development plans for a player, each with its goals (§5 M07, §5A D). */
export async function listPlansWithGoals(playerId: string): Promise<PlanWithGoals[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("development_plans")
    .select(
      "id, title, baseline_note, review_date, status, created_at, development_goals(id, attribute, baseline, target, action, due_date, status, coach_comment)",
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => {
    const row = p as Record<string, unknown>;
    const goals = (row.development_goals as GoalRow[] | null) ?? [];
    return { ...(row as unknown as PlanWithGoals), goals };
  });
}

/** 12-week reassessment reviews for a player (§5A F/G), newest first. */
export async function listReviews(playerId: string): Promise<ReviewRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("development_reviews")
    .select(
      "id, cycle_label, review_date, technical_trend, tactical_trend, speed_trend, decision_trend, summary, next_cycle_focus",
    )
    .eq("player_id", playerId)
    .order("review_date", { ascending: false, nullsFirst: false });
  return (data as ReviewRow[] | null) ?? [];
}
