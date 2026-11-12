import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listPlayers } from "@/lib/players/queries";
import { academyKpis, type AcademyKpis } from "@/lib/dashboard/queries";
import { positionCode, ageBandFromDob } from "@/lib/players/constants";
import type { Bar } from "./queries";

export interface AcademyRosterRow {
  name: string;
  position: string;
  ageBand: string;
  status: string;
  completeness: number;
}

export interface AcademySummary {
  academyName: string;
  generatedAt: string;
  kpis: AcademyKpis;
  totalPlayers: number;
  avgCompleteness: number;
  positionDistribution: Bar[];
  statusDistribution: Bar[];
  roster: AcademyRosterRow[];
}

function bars(counts: Record<string, number>): Bar[] {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Academy-scoped operational summary for academy staff (RLS-scoped). */
export async function getAcademySummary(academyId: string): Promise<AcademySummary> {
  const supabase = createClient();
  const [players, kpis, orgRes] = await Promise.all([
    listPlayers({ academyId, limit: 200 }),
    academyKpis(academyId),
    supabase.from("organisations").select("name").eq("id", academyId).maybeSingle(),
  ]);

  const posCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  let compSum = 0;
  for (const p of players) {
    const pos = positionCode(p.primary_position);
    posCounts[pos] = (posCounts[pos] ?? 0) + 1;
    const st = p.profile_status.replace("_", " ");
    statusCounts[st] = (statusCounts[st] ?? 0) + 1;
    compSum += p.completeness_percent ?? 0;
  }

  const roster: AcademyRosterRow[] = players.map((p) => ({
    name: p.preferred_name || p.display_name,
    position: p.primary_position ?? "—",
    ageBand: ageBandFromDob(p.date_of_birth),
    status: p.profile_status.replace("_", " "),
    completeness: p.completeness_percent ?? 0,
  }));

  const orgName = (orgRes.data as { name: string } | null)?.name;

  return {
    academyName: orgName ?? players[0]?.academy_name ?? "Academy",
    generatedAt: new Date().toISOString(),
    kpis,
    totalPlayers: players.length,
    avgCompleteness: players.length ? Math.round(compSum / players.length) : 0,
    positionDistribution: bars(posCounts),
    statusDistribution: bars(statusCounts),
    roster,
  };
}
