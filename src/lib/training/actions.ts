"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import type { SessionFormState } from "./types";

const schema = z.object({
  title: z.string().min(2, "Give the session a title."),
  objective: z.string().optional(),
  scheduledAt: z.string().optional(),
  durationMin: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  intensityIntent: z.string().optional(),
});

/** Create a training session for the coach's academy (§5A B). RLS: academy member. */
export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };
  const academy = ctx.memberships.find((m) => m.role === "academy_staff");
  if (!academy && !ctx.isSuperAdmin && !ctx.roles.includes("tba_reviewer")) {
    return { error: "You must belong to an academy to create sessions." };
  }
  const academyId = (formData.get("academyId") as string) || academy?.organisationId;
  if (!academyId) return { error: "No academy found for your account." };

  const parsed = schema.safeParse({
    title: formData.get("title"),
    objective: formData.get("objective") || undefined,
    scheduledAt: formData.get("scheduledAt") || undefined,
    durationMin: formData.get("durationMin") ?? "",
    intensityIntent: formData.get("intensityIntent") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid session." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      academy_id: academyId,
      coach_user_id: ctx.userId,
      title: parsed.data.title,
      objective: parsed.data.objective ?? null,
      scheduled_at: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt).toISOString()
        : null,
      duration_min: parsed.data.durationMin ?? null,
      intensity_intent: parsed.data.intensityIntent ?? null,
      status: "planned",
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not create the session." };

  revalidatePath("/academy/calendar");
  redirect(`/academy/sessions/${data.id}`);
}

/** Record attendance for one player in a session (§5A E). Upsert on the pair. */
export async function recordAttendance(
  sessionId: string,
  playerId: string,
  present: boolean,
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("session_attendance")
    .upsert(
      { session_id: sessionId, player_id: playerId, present },
      { onConflict: "session_id,player_id" },
    );
  revalidatePath(`/academy/sessions/${sessionId}`);
}

/** Add a coaching observation for a player in a session (§5A E). Not a diagnosis. */
export async function addObservation(
  sessionId: string,
  playerId: string,
  formData: FormData,
): Promise<void> {
  const text = String(formData.get("observation") ?? "").trim();
  if (!text) return;
  const ctx = await getUserContext();
  const supabase = createClient();
  await supabase.from("session_observations").insert({
    session_id: sessionId,
    player_id: playerId,
    coach_user_id: ctx?.userId ?? null,
    observation: text,
  });
  revalidatePath(`/academy/sessions/${sessionId}`);
}

/** Mark a session delivered with a short summary (§5A E). */
export async function markSessionDelivered(sessionId: string, formData: FormData): Promise<void> {
  const note = String(formData.get("deliveredNote") ?? "").trim();
  const supabase = createClient();
  await supabase
    .from("training_sessions")
    .update({ status: "delivered", session_delivered_note: note || null } as never)
    .eq("id", sessionId);
  revalidatePath(`/academy/sessions/${sessionId}`);
}
