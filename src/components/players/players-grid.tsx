import Link from "next/link";
import { PlayerCard } from "@/components/player/player-card";
import { toPlayerCard, type PlayerRow } from "@/lib/players/queries";

/** Grid of player cards linking to each player's profile. */
export function PlayersGrid({ players }: { players: PlayerRow[] }) {
  if (players.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-navy-200 bg-surface px-6 py-12 text-center">
        <p className="text-sm font-medium text-navy">No players yet</p>
        <p className="mt-1 text-sm text-navy-400">
          Players you can access will appear here once they are added.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((p) => (
        <Link key={p.id} href={`/players/${p.id}`} className="block">
          <PlayerCard player={toPlayerCard(p)} />
        </Link>
      ))}
    </div>
  );
}
