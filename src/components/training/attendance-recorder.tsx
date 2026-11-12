"use client";

import { recordAttendance, addObservation } from "@/lib/training/actions";
import { Button } from "@/components/ui/button";

export interface SquadPlayer {
  id: string;
  name: string;
}

/**
 * Per-player attendance + a quick observation. Each control is its own
 * server-action form, so it posts independently without client state.
 */
export function AttendanceRecorder({
  sessionId,
  players,
  present,
}: {
  sessionId: string;
  players: SquadPlayer[];
  present: Record<string, boolean>;
}) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-navy-400">
        No players in this academy yet. Add players to the squad first.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-navy-100">
      {players.map((p) => {
        const state = present[p.id];
        return (
          <li key={p.id} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-navy">{p.name}</span>
              <div className="flex items-center gap-2">
                <form action={recordAttendance.bind(null, sessionId, p.id, true)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant={state === true ? "primary" : "outline"}
                    className="px-3 py-1 text-xs"
                  >
                    Present
                  </Button>
                </form>
                <form action={recordAttendance.bind(null, sessionId, p.id, false)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant={state === false ? "danger" : "outline"}
                    className="px-3 py-1 text-xs"
                  >
                    Absent
                  </Button>
                </form>
              </div>
            </div>
            <form action={addObservation.bind(null, sessionId, p.id)} className="mt-2 flex gap-2">
              <input
                name="observation"
                placeholder="Quick observation (not a diagnosis)…"
                className="flex-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm text-navy placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <Button type="submit" size="sm" variant="ghost" className="text-xs">
                Note
              </Button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
