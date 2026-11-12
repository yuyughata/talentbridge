import "server-only";
import { createClient } from "@/lib/supabase/server";
import { positionCode } from "@/lib/players/constants";

export interface Bar {
  label: string;
  value: number;
}

export interface AnalyticsData {
  totals: { players: number; reports: number; approvedReports: number; academies: number };
  positionDistribution: Bar[];
  reportStatus: Bar[];
  enquiryStatus: Bar[];
  avgCompleteness: number;
  evidenceRate: number; // % of submitted/approved reports with recorded strengths
  sessions: number;
}

function tally(rows: { k: string | null }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = r.k ?? "Unknown";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function toBars(counts: Record<string, number>): Bar[] {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Aggregate reporting metrics for TBA operations (§5 M12). RLS-scoped (staff see all). */
export async function getAnalytics(): Promise<AnalyticsData> {
  const supabase = createClient();

  const [
    playersCount,
    reportsCount,
    approvedCount,
    academiesCount,
    sessionsCount,
    { data: positions },
    { data: reportRows },
    { data: enquiries },
    { data: completeness },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .then((r) => r.count ?? 0),
    supabase
      .from("scouting_reports")
      .select("id", { count: "exact", head: true })
      .then((r) => r.count ?? 0),
    supabase
      .from("scouting_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .then((r) => r.count ?? 0),
    supabase
      .from("organisations")
      .select("id", { count: "exact", head: true })
      .eq("type", "academy")
      .then((r) => r.count ?? 0),
    supabase
      .from("training_sessions")
      .select("id", { count: "exact", head: true })
      .then((r) => r.count ?? 0),
    supabase.from("players").select("primary_position"),
    supabase.from("scouting_reports").select("status, strengths"),
    supabase.from("recruitment_enquiries").select("status"),
    supabase.from("players").select("completeness_percent"),
  ]);

  const positionBars = toBars(
    tally(
      (positions ?? []).map((p) => ({
        k: positionCode((p as { primary_position: string | null }).primary_position),
      })),
    ),
  );

  const statusCounts = tally(
    (reportRows ?? []).map((r) => ({ k: (r as { status: string }).status })),
  );
  const reportStatus = Object.entries(statusCounts)
    .map(([k, v]) => ({ label: k.replace("_", " "), value: v }))
    .sort((a, b) => b.value - a.value);

  const enquiryStatus = toBars(
    tally((enquiries ?? []).map((e) => ({ k: (e as { status: string }).status }))),
  );

  const completenessVals = (completeness ?? []).map(
    (c) => (c as { completeness_percent: number }).completeness_percent ?? 0,
  );
  const avgCompleteness = completenessVals.length
    ? Math.round(completenessVals.reduce((a, b) => a + b, 0) / completenessVals.length)
    : 0;

  const relevantReports = (reportRows ?? []).filter((r) => {
    const s = (r as { status: string }).status;
    return s === "submitted" || s === "approved" || s === "needs_clarification";
  });
  const withEvidence = relevantReports.filter(
    (r) => !!(r as { strengths: string | null }).strengths,
  );
  const evidenceRate = relevantReports.length
    ? Math.round((withEvidence.length / relevantReports.length) * 100)
    : 0;

  return {
    totals: {
      players: playersCount,
      reports: reportsCount,
      approvedReports: approvedCount,
      academies: academiesCount,
    },
    positionDistribution: positionBars,
    reportStatus,
    enquiryStatus,
    avgCompleteness,
    evidenceRate,
    sessions: sessionsCount,
  };
}
