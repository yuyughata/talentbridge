"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { notifyUser } from "@/lib/notifications/notify";
import type { AssignmentFormState } from "./types";

const schema = z.object({
  scoutUserId: z.string().uuid("Choose a scout."),
  targetPlayerId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  targetPosition: z.string().optional(),
  objective: z.string().optional(),
  dueDate: z.string().optional(),
});

/** Create a scouting assignment (§5 M04). TBA staff only (enforced by RLS too). */
export async function createAssignment(
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };
  if (!ctx.isSuperAdmin && !ctx.roles.includes("tba_reviewer")) {
    return { error: "Only TBA staff can create assignments." };
  }

  const parsed = schema.safeParse({
    scoutUserId: formData.get("scoutUserId"),
    targetPlayerId: formData.get("targetPlayerId") || "",
    targetPosition: formData.get("targetPosition") || undefined,
    objective: formData.get("objective") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid assignment." };
  }

  const supabase = createClient();

  // Optional fixture context.
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

  const { data: created, error } = await supabase
    .from("scouting_assignments")
    .insert({
      scout_user_id: parsed.data.scoutUserId,
      assigned_by: ctx.userId,
      match_id: matchId,
      target_player_id: parsed.data.targetPlayerId ?? null,
      target_position: parsed.data.targetPosition ?? null,
      objective: parsed.data.objective ?? null,
      due_date: parsed.data.dueDate || null,
      status: "open",
    })
    .select("id")
    .single();
  if (error || !created) {
    return { error: "Could not create the assignment." };
  }

  await logAudit("assignment.create", "scouting_assignment", created.id, {
    scout: parsed.data.scoutUserId,
  });
  await notifyUser(
    parsed.data.scoutUserId,
    "assignment",
    "New scouting assignment",
    parsed.data.objective ?? null,
    "/scout/assignments",
  );

  revalidatePath("/admin/assignments");
  redirect("/admin/assignments");
}

/** Update an assignment's status (scout owns its own; staff any — RLS enforced). */
export async function updateAssignmentStatus(assignmentId: string, status: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("scouting_assignments")
    .update({ status: status as never })
    .eq("id", assignmentId);
  revalidatePath("/scout/assignments");
  revalidatePath("/admin/assignments");
}
