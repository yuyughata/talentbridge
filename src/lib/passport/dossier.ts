import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPlayer, type PlayerRow } from "@/lib/players/queries";
import { listRegistrations } from "@/lib/registrations/queries";
import { listPlayerVerifications } from "@/lib/verification/queries";
import type { RegistrationRow } from "@/lib/registrations/types";

export interface DossierAcademy {
  name: string | null;
  fifaConnectId: string | null;
  association: string | null;
  associationFifaId: string | null;
}

export interface DossierVerification {
  type: string;
  status: string;
  expires_at: string | null;
}

export interface PlayerDossier {
  player: PlayerRow;
  academy: DossierAcademy | null;
  registrations: RegistrationRow[];
  verifications: DossierVerification[];
  generatedAt: string;
}

/**
 * Assemble a player's FIFA passport / EPP registration dossier (identity,
 * registration history, verification, academy/association) for the NFF.
 * RLS-scoped: returns null if the caller cannot view the player.
 */
export async function getPlayerDossier(playerId: string): Promise<PlayerDossier | null> {
  const player = await getPlayer(playerId);
  if (!player) return null;

  const [registrations, verifications] = await Promise.all([
    listRegistrations(playerId),
    listPlayerVerifications(playerId).catch(() => []),
  ]);

  let academy: DossierAcademy | null = null;
  if (player.primary_academy_id) {
    const supabase = createClient();
    const { data } = await supabase
      .from("organisations")
      .select("name, fifa_connect_id, associations(name, fifa_connect_id)")
      .eq("id", player.primary_academy_id)
      .maybeSingle();
    if (data) {
      const row = data as unknown as {
        name: string | null;
        fifa_connect_id: string | null;
        associations: { name: string | null; fifa_connect_id: string | null } | null;
      };
      academy = {
        name: row.name,
        fifaConnectId: row.fifa_connect_id,
        association: row.associations?.name ?? null,
        associationFifaId: row.associations?.fifa_connect_id ?? null,
      };
    }
  }

  return {
    player,
    academy,
    registrations,
    verifications: verifications.map((v) => ({
      type: v.verification_type,
      status: v.status,
      expires_at: v.expires_at,
    })),
    generatedAt: new Date().toISOString(),
  };
}
