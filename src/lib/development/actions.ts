"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import type { DevFormState } from "./types";

async function playerAcademy(playerId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("players")
    .select("primary_academy_id")
    .eq("id", playerId)
    .maybeSingle();
  return (data as { primary_academy_id: string | null } | null)?.primary_academy_id ?? null;
}

const planSchema = z.object({
  playerId: z.string().uuid(),
  title: z.string().min(2, "Give the plan a title."),
  baselineNote: z.string().optional(),
  reviewDate: z.string().optional(),
});

/** Create an individual development plan (§5A D). RLS: staff or the player's academy. */
export async function createPlan(_prev: DevFormState, formData: FormData): Promise<DevFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };
  const parsed = planSchema.safeParse({
    playerId: formData.get("playerId"),
    title: formData.get("title"),
    baselineNote: formData.get("baselineNote") || undefined,
    reviewDate: formData.get("reviewDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid plan." };

  const supabase = createClient();
  const { error } = await supabase.from("development_plans").insert({
    player_id: parsed.data.playerId,
    academy_id: await playerAcademy(parsed.data.playerId),
    created_by: ctx.userId,
    title: parsed.data.title,
    baseline_note: parsed.data.baselineNote ?? null,
    review_date: parsed.data.reviewDate || null,
    status: "active",
  });
  if (error) return { error: "Could not create the plan. Check your permission for this player." };
  await logAudit("development.plan.create", "player", parsed.data.playerId, {});
  revalidatePath(`/players/${parsed.data.playerId}/development`);
  return { message: "Plan created." };
}

const goalSchema = z.object({
  planId: z.string().uuid(),
  playerId: z.string().uuid(),
  attribute: z.string().min(2, "Name the attribute being developed."),
  baseline: z.string().optional(),
  target: z.string().optional(),
  action: z.string().optional(),
  dueDate: z.string().optional(),
});

/** Add a development goal to a plan (§5A D — keep current ability vs rate of improvement). */
export async function createGoal(_prev: DevFormState, formData: FormData): Promise<DevFormState> {
  const parsed = goalSchema.safeParse({
    planId: formData.get("planId"),
    playerId: formData.get("playerId"),
    attribute: formData.get("attribute"),
    baseline: formData.get("baseline") || undefined,
    target: formData.get("target") || undefined,
    action: formData.get("action") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid goal." };

  const supabase = createClient();
  const { error } = await supabase.from("development_goals").insert({
    plan_id: parsed.data.planId,
    attribute: parsed.data.attribute,
    baseline: parsed.data.baseline ?? null,
    target: parsed.data.target ?? null,
    action: parsed.data.action ?? null,
    due_date: parsed.data.dueDate || null,
    status: "not_started",
  });
  if (error) return { error: "Could not add the goal." };
  revalidatePath(`/players/${parsed.data.playerId}/development`);
  return { message: "Goal added." };
}

/** Advance a goal's status. */
export async function updateGoalStatus(
  goalId: string,
  playerId: string,
  status: string,
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("development_goals")
    .update({ status: status as never })
    .eq("id", goalId);
  revalidatePath(`/players/${playerId}/development`);
}

const reviewSchema = z.object({
  planId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  playerId: z.string().uuid(),
  cycleLabel: z.string().optional(),
  reviewDate: z.string().optional(),
  summary: z.string().optional(),
  nextFocus: z.string().optional(),
});

/** Record a 12-week reassessment review (§5A F/G) — trends over time, dated. */
export async function createReview(_prev: DevFormState, formData: FormData): Promise<DevFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };
  const parsed = reviewSchema.safeParse({
    planId: formData.get("planId") || "",
    playerId: formData.get("playerId"),
    cycleLabel: formData.get("cycleLabel") || undefined,
    reviewDate: formData.get("reviewDate") || undefined,
    summary: formData.get("summary") || undefined,
    nextFocus: formData.get("nextFocus") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid review." };

  // A review needs a plan to attach to.
  let planId = parsed.data.planId;
  if (!planId) {
    const supabase = createClient();
    const { data } = await supabase
      .from("development_plans")
      .select("id")
      .eq("player_id", parsed.data.playerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    planId = (data as { id: string } | null)?.id;
    if (!planId) return { error: "Create a development plan before recording a review." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("development_reviews").insert({
    plan_id: planId,
    player_id: parsed.data.playerId,
    reviewer_user_id: ctx.userId,
    cycle_label: parsed.data.cycleLabel ?? null,
    review_date: parsed.data.reviewDate || null,
    technical_trend: (formData.get("technicalTrend") as string) || null,
    tactical_trend: (formData.get("tacticalTrend") as string) || null,
    speed_trend: (formData.get("speedTrend") as string) || null,
    decision_trend: (formData.get("decisionTrend") as string) || null,
    summary: parsed.data.summary ?? null,
    next_cycle_focus: parsed.data.nextFocus ?? null,
  });
  if (error) return { error: "Could not record the review." };
  await logAudit("development.review.create", "player", parsed.data.playerId, {});
  revalidatePath(`/players/${parsed.data.playerId}/development`);
  return { message: "Review recorded." };
}
