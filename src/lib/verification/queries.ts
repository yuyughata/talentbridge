import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface VerificationRow {
  id: string;
  player_id: string;
  verification_type: string;
  status: string;
  expires_at: string | null;
  restricted_document_reference: string | null;
  notes: string | null;
  checked_at: string | null;
  created_at: string;
  player_name: string | null;
}

function playerName(row: Record<string, unknown>): string | null {
  const p = row.players as { display_name: string | null; preferred_name: string | null } | null;
  return p?.preferred_name || p?.display_name || null;
}

const SELECT =
  "id, player_id, verification_type, status, expires_at, restricted_document_reference, notes, checked_at, created_at, players(display_name, preferred_name)";

/** Verification records across players (TBA staff only, RLS-enforced §12). */
export async function listVerificationRecords(limit = 100): Promise<VerificationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("verification_records")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    ...(r as unknown as VerificationRow),
    player_name: playerName(r as Record<string, unknown>),
  }));
}

/** Verification records for one player (staff view on the profile). */
export async function listPlayerVerifications(playerId: string): Promise<VerificationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("verification_records")
    .select(SELECT)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    ...(r as unknown as VerificationRow),
    player_name: playerName(r as Record<string, unknown>),
  }));
}
