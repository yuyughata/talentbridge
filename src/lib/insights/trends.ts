import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_DEFINITIONS,
  SCORECARD_CATEGORIES,
  positionOverlayGroup,
  type ScorecardCategory,
} from "@/lib/scoring/model";

export interface TimelinePoint {
  date: string;
  score: number | null;
  categories: Partial<Record<ScorecardCategory, number>>;
}

export interface PlayerTimeline {
  points: TimelinePoint[];
  first: number | null;
  latest: number | null;
  delta: number | null;
}

export interface Mover {
  playerId: string;
  name: string;
  position: string;
  first: number;
  latest: number;
  delta: number;
  assessments: number;
}

export interface CohortInsights {
  scope: "all" | "academy";
  playerCount: number;
  assessedCount: number;
  trackedCount: number;
  avgLatestScore: number | null;
  avgGrowth: number | null;
  improvers: Mover[];
  decliners: Mover[];
  attributeAverages: { category: ScorecardCategory; label: string; avgLatest: number }[];
  positionAverages: { group: string; label: string; avgLatest: number; count: number }[];
  generatedAt: string;
}

interface ReportRow {
  id: string;
  player_id: string;
  weighted_score: number | string | null;
  created_at: string;
  players: {
    preferred_name: string | null;
    display_name: string | null;
    primary_position: string | null;
    primary_academy_id: string | null;
  } | null;
}

function num(v: number | string | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function loadReports(): Promise<{
  reports: ReportRow[];
  ratingsByReport: Map<string, Partial<Record<ScorecardCategory, number>>>;
}> {
  const supabase = createClient();
  const [{ data: reps }, { data: ratings }] = await Promise.all([
    supabase
      .from("scouting_reports")
      .select(
        "id, player_id, weighted_score, created_at, players(preferred_name, display_name, primary_position, primary_academy_id)",
      )
      .order("created_at", { ascending: true })
      .limit(2000),
    supabase.from("scorecard_ratings").select("report_id, category, rating_1_to_10").limit(12000),
  ]);

  const ratingsByReport = new Map<string, Partial<Record<ScorecardCategory, number>>>();
  for (const r of (ratings ?? []) as {
    report_id: string;
    category: ScorecardCategory;
    rating_1_to_10: number;
  }[]) {
    const m = ratingsByReport.get(r.report_id) ?? {};
    m[r.category] = r.rating_1_to_10;
    ratingsByReport.set(r.report_id, m);
  }
  return { reports: (reps as unknown as ReportRow[]) ?? [], ratingsByReport };
}

/** A single player's assessment timeline (chronological) and overall growth. */
export async function playerScoreTimeline(playerId: string): Promise<PlayerTimeline> {
  const { reports, ratingsByReport } = await loadReports();
  const mine = reports.filter((r) => r.player_id === playerId);
  const points: TimelinePoint[] = mine.map((r) => ({
    date: r.created_at,
    score: num(r.weighted_score),
    categories: ratingsByReport.get(r.id) ?? {},
  }));
  const scored = points.filter((p) => p.score !== null) as { score: number }[];
  const first = scored.length ? scored[0]!.score : null;
  const latest = scored.length ? scored[scored.length - 1]!.score : null;
  const delta = first !== null && latest !== null && scored.length >= 2 ? round(latest - first) : null;
  return { points, first, latest, delta };
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** Cheap per-player weighted-score history (for a growth sparkline). */
export async function playerWeightedHistory(
  playerId: string,
): Promise<{ date: string; score: number }[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("scouting_reports")
    .select("weighted_score, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as { weighted_score: number | string | null; created_at: string }[])
    .map((r) => ({ date: r.created_at, score: num(r.weighted_score) }))
    .filter((p): p is { date: string; score: number } => p.score !== null);
}

/** Cohort-level trends and growth across players (RLS-scoped; optional academy). */
export async function cohortInsights(opts: { academyId?: string } = {}): Promise<CohortInsights> {
  const { reports, ratingsByReport } = await loadReports();
  const scoped = opts.academyId
    ? reports.filter((r) => r.players?.primary_academy_id === opts.academyId)
    : reports;

  // Group chronological reports per player.
  const byPlayer = new Map<string, ReportRow[]>();
  for (const r of scoped) {
    const arr = byPlayer.get(r.player_id) ?? [];
    arr.push(r);
    byPlayer.set(r.player_id, arr);
  }

  const movers: Mover[] = [];
  const latestCategoryByPlayer = new Map<string, Partial<Record<ScorecardCategory, number>>>();
  const positionBuckets = new Map<string, { label: string; sum: number; count: number }>();
  let latestSum = 0;
  let latestCount = 0;

  for (const [pid, reps] of byPlayer) {
    const name = reps[0]?.players?.preferred_name || reps[0]?.players?.display_name || "Player";
    const position = reps[0]?.players?.primary_position ?? "—";
    const scored = reps.filter((r) => num(r.weighted_score) !== null);
    if (scored.length === 0) continue;

    const latestRep = scored[scored.length - 1]!;
    const latest = num(latestRep.weighted_score)!;
    latestSum += latest;
    latestCount += 1;
    latestCategoryByPlayer.set(pid, ratingsByReport.get(latestRep.id) ?? {});

    const grp = positionOverlayGroup(position);
    const b = positionBuckets.get(grp.key) ?? { label: grp.label, sum: 0, count: 0 };
    b.sum += latest;
    b.count += 1;
    positionBuckets.set(grp.key, b);

    if (scored.length >= 2) {
      const first = num(scored[0]!.weighted_score)!;
      movers.push({
        playerId: pid,
        name,
        position,
        first: round(first),
        latest: round(latest),
        delta: round(latest - first),
        assessments: scored.length,
      });
    }
  }

  movers.sort((a, b) => b.delta - a.delta);
  const improvers = movers.filter((m) => m.delta > 0).slice(0, 6);
  const decliners = movers
    .filter((m) => m.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 6);

  const avgGrowth = movers.length
    ? round(movers.reduce((s, m) => s + m.delta, 0) / movers.length)
    : null;
  const avgLatestScore = latestCount ? round(latestSum / latestCount) : null;

  const attributeAverages = SCORECARD_CATEGORIES.map((category) => {
    let sum = 0;
    let count = 0;
    for (const cats of latestCategoryByPlayer.values()) {
      const v = cats[category];
      if (typeof v === "number") {
        sum += v;
        count += 1;
      }
    }
    return {
      category,
      label: CATEGORY_DEFINITIONS[category].label.split(" — ")[0] ?? category,
      avgLatest: count ? round(sum / count, 1) : 0,
    };
  }).sort((a, b) => b.avgLatest - a.avgLatest);

  const positionAverages = [...positionBuckets.values()]
    .map((b) => ({ group: b.label, label: b.label, avgLatest: round(b.sum / b.count), count: b.count }))
    .sort((a, b) => b.avgLatest - a.avgLatest);

  return {
    scope: opts.academyId ? "academy" : "all",
    playerCount: byPlayer.size,
    assessedCount: latestCount,
    trackedCount: movers.length,
    avgLatestScore,
    avgGrowth,
    improvers,
    decliners,
    attributeAverages,
    positionAverages,
    generatedAt: new Date().toISOString(),
  };
}
