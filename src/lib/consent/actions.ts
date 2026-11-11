"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import type { ConsentFormState } from "@/lib/players/types";

const schema = z.object({
  playerId: z.string().uuid(),
  consentType: z.string().min(1, "Choose a consent type."),
  version: z.string().min(1, "Enter a consent version (e.g. v1.0)."),
  scope: z.string().optional(),
});

/**
 * Record a consent with a lawful basis (§2, §5 M03, §12). RLS allows the player,
 * their guardian or TBA staff. `granted_by` is the signed-in user.
 */
export async function recordConsent(
  _prev: ConsentFormState,
  formData: FormData,
): Promise<ConsentFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const parsed = schema.safeParse({
    playerId: formData.get("playerId"),
    consentType: formData.get("consentType"),
    version: formData.get("version"),
    scope: formData.get("scope") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid consent details." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("player_consents").insert({
    player_id: parsed.data.playerId,
    consent_type: parsed.data.consentType,
    version: parsed.data.version,
    scope: parsed.data.scope ?? null,
    status: "granted",
    granted_by: ctx.userId,
    granted_at: new Date().toISOString(),
  });
  if (error) {
    return { error: "Could not record consent. Check your permission for this player." };
  }
  revalidatePath(`/players/${parsed.data.playerId}`);
  return { message: "Consent recorded." };
}

/** Withdraw a consent (§5 M03). Keeps the record for audit; sets status + timestamp. */
export async function withdrawConsent(formData: FormData): Promise<void> {
  const id = String(formData.get("consentId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  if (!id) return;
  const supabase = createClient();
  await supabase
    .from("player_consents")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("id", id);
  if (playerId) revalidatePath(`/players/${playerId}`);
}
