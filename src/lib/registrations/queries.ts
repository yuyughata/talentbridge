import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AssociationRow, RegistrationRow } from "./types";

const SELECT =
  "id, player_id, club_id, club_name, association_id, season_year, registered_from, " +
  "registered_to, player_status, registration_kind, training_category, state, note, " +
  "organisations(name), associations(name)";

function normalise(row: Record<string, unknown>): RegistrationRow {
  const org = row.organisations as { name: string | null } | null;
  const assoc = row.associations as { name: string | null } | null;
  return {
    ...(row as unknown as RegistrationRow),
    club: org?.name ?? (row.club_name as string | null) ?? null,
    association: assoc?.name ?? null,
  };
}

/** Registration history for a player, newest first (RLS-scoped). */
export async function listRegistrations(playerId: string): Promise<RegistrationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("player_registrations")
    .select(SELECT)
    .eq("player_id", playerId)
    .order("registered_from", { ascending: false, nullsFirst: false });
  return (data ?? []).map((r) => normalise(r as unknown as Record<string, unknown>));
}

/** Member associations for pickers (e.g. NFF). */
export async function listAssociations(): Promise<AssociationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("associations")
    .select("id, name, short_code, country, fifa_connect_id")
    .order("name");
  return (data as AssociationRow[] | null) ?? [];
}
