"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import type { VerificationFormState } from "./types";

function isStaff(roles: string[]): boolean {
  return roles.includes("super_admin") || roles.includes("tba_reviewer");
}

const schema = z.object({
  playerId: z.string().uuid("Choose a player."),
  verificationType: z.string().min(1, "Choose a verification type."),
  status: z.string().min(1),
  expiresAt: z.string().optional(),
  documentReference: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Create a verification record (§5 M08, §12). Restricted to designated TBA staff
 * (RLS also enforces this). The document reference is a pointer to private
 * storage — never the file itself. Verifying evidence does NOT mark the player
 * profile verified; a human sets that separately (§9).
 */
export async function createVerification(
  _prev: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };
  if (!isStaff(ctx.roles)) return { error: "Only TBA verification staff can do this." };

  const parsed = schema.safeParse({
    playerId: formData.get("playerId"),
    verificationType: formData.get("verificationType"),
    status: formData.get("status") || "pending",
    expiresAt: formData.get("expiresAt") || undefined,
    documentReference: formData.get("documentReference") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid record." };

  const decided = parsed.data.status !== "pending";
  const supabase = createClient();
  const { error } = await supabase.from("verification_records").insert({
    player_id: parsed.data.playerId,
    verification_type: parsed.data.verificationType,
    status: parsed.data.status as never,
    expires_at: parsed.data.expiresAt || null,
    restricted_document_reference: parsed.data.documentReference ?? null,
    notes: parsed.data.notes ?? null,
    checked_by: decided ? ctx.userId : null,
    checked_at: decided ? new Date().toISOString() : null,
  });
  if (error) return { error: "Could not save the verification record." };

  await logAudit("verification.create", "player", parsed.data.playerId, {
    type: parsed.data.verificationType,
    status: parsed.data.status,
  });
  revalidatePath("/admin/verification");
  revalidatePath(`/players/${parsed.data.playerId}`);
  return { message: "Verification record saved." };
}

/** Set a verification record's status (§5 M08). Records who checked and when. */
export async function setVerificationStatus(
  recordId: string,
  playerId: string,
  status: string,
): Promise<void> {
  const ctx = await getUserContext();
  const supabase = createClient();
  await supabase
    .from("verification_records")
    .update({
      status: status as never,
      checked_by: ctx?.userId ?? null,
      checked_at: new Date().toISOString(),
    })
    .eq("id", recordId);
  await logAudit(`verification.${status}`, "player", playerId, { recordId });
  revalidatePath("/admin/verification");
  revalidatePath(`/players/${playerId}`);
}
