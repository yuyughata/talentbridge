import "server-only";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_DEFINITIONS, type ScorecardCategory } from "@/lib/scoring/model";
import type { RadarAxis } from "@/components/scoring/radar-chart";

const CATEGORY_SHORT: Record<ScorecardCategory, string> = {
  technical: "TEC",
  tactical: "TAC",
  physical: "PHY",
  speed: "SPD",
  decision_making: "DEC",
  mental: "MEN",
  consistency: "CON",
};

export interface PlayerScorecard {
  reportId: string;
  weightedScore: number | null;
  axes: RadarAxis[];
  ratingCount: number;
}

/** The player's most recent scorecard (any status), as radar axes + score. */
export async function latestPlayerScorecard(playerId: string): Promise<PlayerScorecard | null> {
  const supabase = createClient();
  const { data: rep } = await supabase
    .from("scouting_reports")
    .select("id, weighted_score")
    .eq("player_id", playerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!rep) return null;
  const r = rep as { id: string; weighted_score: number | null };

  const { data: ratings } = await supabase
    .from("scorecard_ratings")
    .select("category, rating_1_to_10")
    .eq("report_id", r.id);
  const rows = (ratings as { category: ScorecardCategory; rating_1_to_10: number }[] | null) ?? [];

  const axes: RadarAxis[] = rows.map((row) => ({
    label: CATEGORY_DEFINITIONS[row.category].label.split(" — ")[0] ?? row.category,
    short: CATEGORY_SHORT[row.category] ?? row.category,
    value: row.rating_1_to_10,
  }));

  return { reportId: r.id, weightedScore: r.weighted_score, axes, ratingCount: rows.length };
}

export interface ReportListRow {
  id: string;
  status: string;
  weighted_score: number | null;
  recommendation: string | null;
  confidence: string;
  updated_at: string;
  player_name: string | null;
}

function playerName(row: Record<string, unknown>): string | null {
  const p = row.players as { display_name: string | null; preferred_name: string | null } | null;
  if (!p) return null;
  return p.preferred_name || p.display_name || null;
}

/** Reports authored by the current scout (RLS scopes to own). */
export async function listMyReports(userId: string): Promise<ReportListRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_reports")
    .select(
      "id, status, weighted_score, recommendation, confidence, updated_at, players(display_name, preferred_name)",
    )
    .eq("scout_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(60);
  return (data ?? []).map((r) => ({
    ...(r as unknown as ReportListRow),
    player_name: playerName(r as Record<string, unknown>),
  }));
}

/** Reports awaiting review (reviewer queue, §9). Visible to TBA staff via RLS. */
export async function listReviewQueue(): Promise<ReportListRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_reports")
    .select(
      "id, status, weighted_score, recommendation, confidence, updated_at, submitted_at, players(display_name, preferred_name)",
    )
    .in("status", ["submitted", "needs_clarification"])
    .order("submitted_at", { ascending: true })
    .limit(60);
  return (data ?? []).map((r) => ({
    ...(r as unknown as ReportListRow),
    player_name: playerName(r as Record<string, unknown>),
  }));
}

export interface FullReport {
  id: string;
  player_id: string;
  scout_user_id: string;
  player_name: string | null;
  status: string;
  weighted_score: number | null;
  recommendation: string | null;
  confidence: string;
  confidence_reason: string | null;
  position_observed: string | null;
  role_observed: string | null;
  minutes_observed: number | null;
  watched_scope: string | null;
  narrative: string | null;
  strengths: string | null;
  development_areas: string | null;
  review_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  ratings: {
    category: ScorecardCategory;
    rating_1_to_10: number;
    weight_snapshot: number;
    evidence_note: string | null;
  }[];
  speed: {
    acceleration: number | null;
    top_speed: number | null;
    repeated_sprint: number | null;
    football_speed: number | null;
  } | null;
  overlay: {
    group_key: string | null;
    attribute_key: string | null;
    attribute: string;
    rating_1_to_10: number | null;
    note: string | null;
  }[];
  match: {
    competition: string | null;
    away_team: string | null;
    venue: string | null;
    match_date: string | null;
  } | null;
}

/** A report with its ratings, speed sub-scores, player and match context. */
export async function getReport(id: string): Promise<FullReport | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_reports")
    .select(
      "id, player_id, scout_user_id, status, weighted_score, recommendation, confidence, confidence_reason, position_observed, role_observed, minutes_observed, watched_scope, narrative, strengths, development_areas, review_comment, submitted_at, reviewed_at, players(display_name, preferred_name), matches(competition, away_team, venue, match_date)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const [{ data: ratings }, { data: speed }, { data: overlay }] = await Promise.all([
    supabase
      .from("scorecard_ratings")
      .select("category, rating_1_to_10, weight_snapshot, evidence_note")
      .eq("report_id", id),
    supabase
      .from("speed_subscores")
      .select("acceleration, top_speed, repeated_sprint, football_speed")
      .eq("report_id", id)
      .maybeSingle(),
    supabase
      .from("report_position_notes")
      .select("group_key, attribute_key, attribute, rating_1_to_10, note")
      .eq("report_id", id),
  ]);

  const m = row.matches as FullReport["match"];
  return {
    ...(row as unknown as FullReport),
    player_name: playerName(row),
    ratings: (ratings as FullReport["ratings"]) ?? [],
    speed: (speed as FullReport["speed"]) ?? null,
    overlay: (overlay as unknown as FullReport["overlay"]) ?? [],
    match: m ?? null,
  };
}
