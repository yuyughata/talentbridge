import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MediaRow {
  id: string;
  kind: string;
  storage_provider: string;
  asset_reference: string;
  title: string | null;
  visibility: string;
  processing_status: string;
  consent_id: string | null;
  created_at: string;
}

/** Media assets for a player (§5 M06). RLS limits what each viewer sees. */
export async function listMedia(playerId: string): Promise<MediaRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("media_assets")
    .select(
      "id, kind, storage_provider, asset_reference, title, visibility, processing_status, consent_id, created_at",
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data as MediaRow[] | null) ?? [];
}

/** Media linked to the signed-in user's own player record (player portal). */
export async function listMyMedia(
  userId: string,
): Promise<{ playerId: string | null; media: MediaRow[] }> {
  const supabase = createClient();
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const playerId = (player as { id: string } | null)?.id ?? null;
  if (!playerId) return { playerId: null, media: [] };
  return { playerId, media: await listMedia(playerId) };
}
