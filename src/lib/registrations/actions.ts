"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import type { RegistrationFormState } from "./types";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v as string)?.trim();
  return s ? s : null;
}
function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = (v as string)?.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

/** Add a registration spell to a player's passport history (§FIFA RSTP). */
export async function addRegistration(
  playerId: string,
  _prev: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const clubName = str(formData.get("clubName"));
  const clubId = str(formData.get("clubId"));
  if (!clubName && !clubId) return { error: "Enter a club (name or selection)." };

  const supabase = createClient();
  const { error } = await supabase.from("player_registrations").insert({
    player_id: playerId,
    club_id: clubId,
    club_name: clubName,
    association_id: str(formData.get("associationId")),
    season_year: intOrNull(formData.get("seasonYear")),
    registered_from: str(formData.get("registeredFrom")),
    registered_to: str(formData.get("registeredTo")),
    player_status: (str(formData.get("playerStatus")) ?? "amateur") as never,
    registration_kind: (str(formData.get("registrationKind")) ?? "permanent") as never,
    training_category: str(formData.get("trainingCategory")),
    state: (str(formData.get("state")) ?? "confirmed") as never,
    note: str(formData.get("note")),
  });

  if (error) {
    return { error: "Could not save the registration. Check your permission for this player." };
  }
  await logAudit("registration.add", "player", playerId, { clubName, clubId });
  revalidatePath(`/players/${playerId}`);
  return { message: "Registration added." };
}

/** Remove a registration spell. */
export async function deleteRegistration(playerId: string, registrationId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("player_registrations").delete().eq("id", registrationId);
  await logAudit("registration.delete", "player", playerId, { registrationId });
  revalidatePath(`/players/${playerId}`);
}
