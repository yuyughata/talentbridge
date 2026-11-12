"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { computeCompleteness, parseList } from "./constants";
import { getMinorAgeThreshold } from "@/lib/settings/queries";
import { logAudit } from "@/lib/audit";
import type { PlayerFormState } from "./types";

const schema = z.object({
  displayName: z.string().min(2, "Enter the player's full name."),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  primaryPosition: z.string().optional(),
  dominantFoot: z.string().optional(),
  heightCm: z.coerce
    .number()
    .int()
    .min(100)
    .max(230)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  location: z.string().optional(),
  // FIFA passport / EPP identity fields (§FIFA RSTP).
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("").transform(() => undefined)),
  legalFirstName: z.string().optional(),
  legalLastName: z.string().optional(),
  placeOfBirth: z.string().optional(),
  countryOfBirth: z.string().optional(),
  fifaConnectId: z.string().optional(),
});

function isMinor(dob: string | null | undefined, threshold: number): boolean {
  if (!dob) return false;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age < threshold;
}

async function buildRecord(formData: FormData) {
  const parsed = schema.safeParse({
    displayName: formData.get("displayName"),
    preferredName: formData.get("preferredName") || undefined,
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    nationality: formData.get("nationality") || undefined,
    primaryPosition: formData.get("primaryPosition") || undefined,
    dominantFoot: formData.get("dominantFoot") || undefined,
    heightCm: formData.get("heightCm") ?? "",
    location: formData.get("location") || undefined,
    gender: formData.get("gender") || undefined,
    legalFirstName: formData.get("legalFirstName") || undefined,
    legalLastName: formData.get("legalLastName") || undefined,
    placeOfBirth: formData.get("placeOfBirth") || undefined,
    countryOfBirth: formData.get("countryOfBirth") || undefined,
    fifaConnectId: formData.get("fifaConnectId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? ("Invalid details." as string) };
  }
  const d = parsed.data;
  const record = {
    display_name: d.displayName,
    preferred_name: d.preferredName ?? null,
    date_of_birth: d.dateOfBirth ?? null,
    nationality: d.nationality ?? null,
    primary_position: d.primaryPosition ?? null,
    secondary_positions: parseList(formData.get("secondaryPositions")),
    dominant_foot: d.dominantFoot ?? null,
    height_cm: d.heightCm ?? null,
    location: d.location ?? null,
    languages: parseList(formData.get("languages")),
    portrait_url: (formData.get("portraitUrl") as string)?.trim() || null,
    gender: d.gender ?? null,
    legal_first_name: d.legalFirstName ?? null,
    legal_last_name: d.legalLastName ?? null,
    place_of_birth: d.placeOfBirth ?? null,
    country_of_birth: d.countryOfBirth ?? null,
    fifa_connect_id: d.fifaConnectId ?? null,
    is_minor: isMinor(d.dateOfBirth, await getMinorAgeThreshold()),
  };
  return { record };
}

/** Create a player (§5 M02). Academy staff scope to their academy; RLS enforces it. */
export async function createPlayer(
  _prev: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const built = await buildRecord(formData);
  if ("error" in built) return { error: built.error };

  // Resolve the academy: explicit field (admin) or the staff member's academy.
  const explicit = (formData.get("academyId") as string) || "";
  const academyMembership = ctx.memberships.find((m) => m.role === "academy_staff");
  const academyId = explicit || academyMembership?.organisationId || null;

  const completeness = computeCompleteness(built.record);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      ...built.record,
      primary_academy_id: academyId,
      profile_status: "draft",
      completeness_percent: completeness,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not create the player. Check your permissions for this academy." };
  }
  revalidatePath("/academy/squad");
  redirect(`/players/${data.id}`);
}

/** Update a player. RLS allows staff, the player's academy, or the player themselves. */
export async function updatePlayer(
  id: string,
  _prev: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const built = await buildRecord(formData);
  if ("error" in built) return { error: built.error };

  const completeness = computeCompleteness(built.record);
  const supabase = createClient();
  const { error } = await supabase
    .from("players")
    .update({ ...built.record, completeness_percent: completeness })
    .eq("id", id);

  if (error) {
    return { error: "Could not save changes. You may not have permission to edit this player." };
  }
  revalidatePath(`/players/${id}`);
  return { message: "Profile saved." };
}

/** Move a player's profile through its lifecycle (draft → submitted, etc.). */
export async function setPlayerStatus(id: string, status: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("players")
    .update({ profile_status: status } as never)
    .eq("id", id);
  await logAudit("player.status", "player", id, { status });
  revalidatePath(`/players/${id}`);
}
