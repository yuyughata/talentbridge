"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { EXTERNAL_VISIBILITIES } from "./constants";
import type { MediaFormState } from "./types";

const schema = z.object({
  playerId: z.string().uuid(),
  provider: z.string().min(1, "Choose a provider."),
  url: z.string().url("Enter a valid link to the footage."),
  title: z.string().optional(),
  kind: z.string().min(1),
  visibility: z.string().min(1),
  consentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/**
 * Link authorised footage to a player (§5 M06). Large video stays with the
 * provider; we store a reference. External visibility (shared/public) requires a
 * recorded consent as its lawful basis (§2, §5 M03).
 */
export async function addMedia(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const parsed = schema.safeParse({
    playerId: formData.get("playerId"),
    provider: formData.get("provider"),
    url: formData.get("url"),
    title: formData.get("title") || undefined,
    kind: formData.get("kind") || "video",
    visibility: formData.get("visibility") || "private",
    consentId: formData.get("consentId") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid media." };

  if (EXTERNAL_VISIBILITIES.includes(parsed.data.visibility) && !parsed.data.consentId) {
    return { error: "Shared or public media needs a recorded consent as its lawful basis (§2)." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("media_assets").insert({
    player_id: parsed.data.playerId,
    uploaded_by: ctx.userId,
    kind: parsed.data.kind,
    storage_provider: parsed.data.provider,
    asset_reference: parsed.data.url,
    title: parsed.data.title ?? null,
    visibility: parsed.data.visibility as never,
    consent_id: parsed.data.consentId ?? null,
    processing_status: "ready", // external links are already processed
  });
  if (error) return { error: "Could not add the media. Check your permission for this player." };

  await logAudit("media.add", "player", parsed.data.playerId, {
    provider: parsed.data.provider,
    visibility: parsed.data.visibility,
  });
  revalidatePath(`/players/${parsed.data.playerId}/media`);
  revalidatePath("/player/videos");
  return { message: "Media added." };
}

/** Change a media asset's visibility. External visibility requires a consent (§2). */
export async function setMediaVisibility(
  mediaId: string,
  playerId: string,
  visibility: string,
): Promise<void> {
  const supabase = createClient();
  if (EXTERNAL_VISIBILITIES.includes(visibility)) {
    const { data } = await supabase
      .from("media_assets")
      .select("consent_id")
      .eq("id", mediaId)
      .maybeSingle();
    if (!(data as { consent_id: string | null } | null)?.consent_id) return; // blocked: no lawful basis
  }
  await supabase
    .from("media_assets")
    .update({ visibility: visibility as never })
    .eq("id", mediaId);
  await logAudit("media.visibility", "player", playerId, { visibility });
  revalidatePath(`/players/${playerId}/media`);
  revalidatePath("/player/videos");
}

/** Remove a media asset (RLS: staff / academy / self). */
export async function deleteMedia(mediaId: string, playerId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("media_assets").delete().eq("id", mediaId);
  await logAudit("media.delete", "player", playerId, { mediaId });
  revalidatePath(`/players/${playerId}/media`);
  revalidatePath("/player/videos");
}
