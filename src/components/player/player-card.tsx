import { cn } from "@/lib/utils";
import { ScoreRing } from "./score-ring";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";

export interface PlayerCardData {
  name: string;
  ageBand: string;
  position: string;
  positionCode: string;
  foot: "Left" | "Right" | "Both";
  academy: string;
  location: string;
  lastAssessed: string;
  verification: StatusKind;
  portrait?: string | null;
  score?: number;
  observations?: number;
}

/**
 * Premium scouting player card. Portrait monogram, identity,
 * position pill and an optional weighted index. Verification uses a neutral
 * badge — never a green "approved" treatment.
 */
export function PlayerCard({ player, className }: { player: PlayerCardData; className?: string }) {
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl2 border border-navy-100 bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      {/* header band with pitch tint */}
      <div className="relative bg-navy-depth px-5 pb-4 pt-5 text-white">
        <div className="pitch-lines absolute inset-0 opacity-50" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {player.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.portrait}
                alt={`${player.name} portrait`}
                className="h-14 w-14 flex-none rounded-xl object-cover ring-1 ring-white/15"
              />
            ) : (
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white/10 text-lg font-bold ring-1 ring-white/15">
                {initials}
              </div>
            )}
            <div>
              <p className="text-base font-semibold leading-tight">{player.name}</p>
              <p className="text-xs text-navy-100">
                {player.position} · {player.foot} footed
              </p>
            </div>
          </div>
          <span className="rounded-md bg-amber-sheen px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-900">
            {player.positionCode}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-navy-400">Age band</dt>
            <dd className="nums font-medium text-navy">{player.ageBand}</dd>
          </div>
          <div>
            <dt className="text-navy-400">Academy</dt>
            <dd className="truncate font-medium text-navy">{player.academy}</dd>
          </div>
          <div>
            <dt className="text-navy-400">Location</dt>
            <dd className="truncate font-medium text-navy">{player.location}</dd>
          </div>
          <div>
            <dt className="text-navy-400">Last assessed</dt>
            <dd className="nums font-medium text-navy">{player.lastAssessed}</dd>
          </div>
        </dl>
        {player.score !== undefined ? <ScoreRing value={player.score} /> : null}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3">
        <StatusBadge status={player.verification} />
        {player.observations !== undefined ? (
          <span className="text-xs text-navy-500">
            <span className="nums font-semibold text-navy">{player.observations}</span> observations
          </span>
        ) : null}
      </div>
    </div>
  );
}
