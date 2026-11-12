"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import {
  SCORECARD_CATEGORIES,
  positionOverlayGroup,
  type ScorecardCategory,
} from "@/lib/scoring/model";
import { buildRatingSnapshots, calculateWeightedScore } from "@/lib/scoring/calculate";
import { logAudit } from "@/lib/audit";
import { notifyUser } from "@/lib/notifications/notify";
import type { ReportFormState, ReviewState } from "./types";

function intInRange(v: FormDataEntryValue | null, min: number, max: number): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/**
 * Create a scouting report with its scorecard (§5 M05, §6). Writes the report,
 * per-category ratings (with weight snapshots), speed sub-scores and match
 * context, then stores the computed weighted score.
 */
export async function createReport(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) return { error: "Select a player." };
  const intent = String(formData.get("intent") ?? "draft"); // draft | submit

  // Ratings — all seven required.
  const ratingMap: Partial<Record<ScorecardCategory, number>> = {};
  for (const cat of SCORECARD_CATEGORIES) {
    const r = intInRange(formData.get(`rating_${cat}`), 1, 10);
    if (r === null) {
      return { error: `Rate every category 1–10 (missing or invalid: ${cat.replace("_", " ")}).` };
    }
    ratingMap[cat] = r;
  }

  const strengths = String(formData.get("strengths") ?? "").trim();
  const developmentAreas = String(formData.get("developmentAreas") ?? "").trim();
  if (intent === "submit" && (!strengths || !developmentAreas)) {
    return { error: "Strengths and development areas are required to submit (§6)." };
  }

  const ratings = buildRatingSnapshots(ratingMap);
  const weighted = calculateWeightedScore(ratings);

  const supabase = createClient();

  // Optional match context.
  const competition = String(formData.get("competition") ?? "").trim();
  const opponent = String(formData.get("opponent") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const matchDate = String(formData.get("matchDate") ?? "").trim();
  let matchId: string | null = null;
  if (competition || opponent) {
    const { data: match } = await supabase
      .from("matches")
      .insert({
        competition: competition || null,
        away_team: opponent || null,
        venue: venue || null,
        match_date: matchDate || null,
        created_by: ctx.userId,
      })
      .select("id")
      .single();
    matchId = match?.id ?? null;
  }

  const { data: report, error } = await supabase
    .from("scouting_reports")
    .insert({
      player_id: playerId,
      scout_user_id: ctx.userId,
      assignment_id: String(formData.get("assignmentId") ?? "") || null,
      match_id: matchId,
      position_observed: String(formData.get("positionObserved") ?? "") || null,
      role_observed: String(formData.get("roleObserved") ?? "") || null,
      minutes_observed: intInRange(formData.get("minutesObserved"), 0, 200),
      watched_scope: String(formData.get("watchedScope") ?? "") || null,
      confidence: String(formData.get("confidence") ?? "medium") as "low" | "medium" | "high",
      confidence_reason: String(formData.get("confidenceReason") ?? "") || null,
      narrative: String(formData.get("narrative") ?? "") || null,
      strengths: strengths || null,
      development_areas: developmentAreas || null,
      recommendation: (String(formData.get("recommendation") ?? "") || null) as never,
      weighted_score: weighted.total,
      status: intent === "submit" ? "submitted" : "draft",
      submitted_at: intent === "submit" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !report) {
    return { error: "Could not save the report. Check your permission for this player." };
  }

  // Ratings + speed children.
  await supabase.from("scorecard_ratings").insert(
    ratings.map((r) => ({
      report_id: report.id,
      category: r.category,
      rating_1_to_10: r.rating,
      weight_snapshot: r.weightSnapshot,
      evidence_note: String(formData.get(`note_${r.category}`) ?? "") || null,
    })),
  );

  await supabase.from("speed_subscores").insert({
    report_id: report.id,
    acceleration: intInRange(formData.get("speed_acceleration"), 1, 10),
    top_speed: intInRange(formData.get("speed_top_speed"), 1, 10),
    repeated_sprint: intInRange(formData.get("speed_repeated_sprint"), 1, 10),
    football_speed: intInRange(formData.get("speed_football_speed"), 1, 10),
  });

  // Position-specific overlay parameters (§6). Goalkeepers are assessed on a
  // different parameter set from outfield players. The group is resolved from
  // the player's real position server-side, not trusted from the client.
  const { data: playerRow } = await supabase
    .from("players")
    .select("primary_position")
    .eq("id", playerId)
    .maybeSingle();
  const overlay = positionOverlayGroup(
    (playerRow as { primary_position?: string | null } | null)?.primary_position,
  );
  const overlayRows = overlay.attributes
    .map((a) => ({
      report_id: report.id,
      group_key: overlay.key,
      attribute_key: a.key,
      attribute: a.label,
      rating_1_to_10: intInRange(formData.get(`overlay_${a.key}`), 1, 10),
      note: String(formData.get(`overlay_note_${a.key}`) ?? "") || null,
    }))
    .filter((r) => r.rating_1_to_10 !== null || r.note !== null);
  if (overlayRows.length > 0) {
    await supabase.from("report_position_notes").insert(overlayRows);
  }

  // Advance the originating assignment when the report is submitted (§5 M04).
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (assignmentId && intent === "submit") {
    await supabase
      .from("scouting_assignments")
      .update({ status: "submitted" as never })
      .eq("id", assignmentId);
  }

  revalidatePath("/scout/reports");
  redirect(`/scout/reports/${report.id}`);
}

/** Submit an existing draft for review (§9). */
export async function submitReport(reportId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("scouting_reports")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", reportId);
  revalidatePath(`/scout/reports/${reportId}`);
}

/**
 * Reviewer decision (§9 scout-to-review). approve → approved; return →
 * needs_clarification (comment required); reject → rejected. RLS limits this to
 * TBA staff. Approval updates assessment history but never auto-verifies the
 * player (§9).
 */
export async function reviewReport(
  reportId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const decision = String(formData.get("decision") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();

  const statusByDecision: Record<string, string> = {
    approve: "approved",
    return: "needs_clarification",
    reject: "rejected",
  };
  const status = statusByDecision[decision];
  if (!status) return { error: "Choose approve, return or reject." };
  if ((decision === "return" || decision === "reject") && !comment) {
    return { error: "Add a comment explaining what is needed." };
  }

  const ctx = await getUserContext();
  const supabase = createClient();

  // Capture the author so we can notify them after the decision.
  const { data: existing } = await supabase
    .from("scouting_reports")
    .select("scout_user_id")
    .eq("id", reportId)
    .maybeSingle();

  const { error } = await supabase
    .from("scouting_reports")
    .update({
      status: status as never,
      review_comment: comment || null,
      reviewed_by: ctx?.userId ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { error: "Could not record the review. You may not have reviewer permission." };

  await logAudit(`report.${status}`, "scouting_report", reportId, { decision });
  const authorId = (existing as { scout_user_id?: string } | null)?.scout_user_id;
  if (authorId) {
    await notifyUser(
      authorId,
      "review",
      `Your report was ${status.replace("_", " ")}`,
      comment || null,
      `/scout/reports/${reportId}`,
    );
  }

  revalidatePath("/admin/review");
  revalidatePath(`/scout/reports/${reportId}`);
  return { message: `Report ${status.replace("_", " ")}.` };
}
