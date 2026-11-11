import "server-only";
import { createClient } from "@/lib/supabase/server";

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

export interface AdminKpis {
  newProfiles7d: number;
  reportsDue: number;
  verificationQueue: number;
  activeAcademies: number;
}

export async function adminKpis(): Promise<AdminKpis> {
  const supabase = createClient();
  const [newProfiles7d, reportsDue, verificationQueue, activeAcademies] = await Promise.all([
    supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .gte("created_at", daysAgoIso(7))
      .then((r) => r.count ?? 0),
    supabase
      .from("scouting_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted")
      .then((r) => r.count ?? 0),
    supabase
      .from("verification_records")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then((r) => r.count ?? 0),
    supabase
      .from("organisations")
      .select("id", { count: "exact", head: true })
      .eq("type", "academy")
      .then((r) => r.count ?? 0),
  ]);
  return { newProfiles7d, reportsDue, verificationQueue, activeAcademies };
}

export interface ScoutKpis {
  openAssignments: number;
  draftReports: number;
  returned: number;
}

export async function scoutKpis(userId: string): Promise<ScoutKpis> {
  const supabase = createClient();
  const [openAssignments, draftReports, returned] = await Promise.all([
    supabase
      .from("scouting_assignments")
      .select("id", { count: "exact", head: true })
      .eq("scout_user_id", userId)
      .eq("status", "open")
      .then((r) => r.count ?? 0),
    supabase
      .from("scouting_reports")
      .select("id", { count: "exact", head: true })
      .eq("scout_user_id", userId)
      .eq("status", "draft")
      .then((r) => r.count ?? 0),
    supabase
      .from("scouting_reports")
      .select("id", { count: "exact", head: true })
      .eq("scout_user_id", userId)
      .eq("status", "needs_clarification")
      .then((r) => r.count ?? 0),
  ]);
  return { openAssignments, draftReports, returned };
}

export interface AcademyKpis {
  squadSize: number;
  sessionsThisWeek: number;
  reviewsDue: number;
}

export async function academyKpis(academyId: string): Promise<AcademyKpis> {
  const supabase = createClient();
  const weekAhead = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const [squadSize, sessionsThisWeek, reviewsDue] = await Promise.all([
    supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("primary_academy_id", academyId)
      .then((r) => r.count ?? 0),
    supabase
      .from("training_sessions")
      .select("id", { count: "exact", head: true })
      .eq("academy_id", academyId)
      .gte("scheduled_at", new Date().toISOString())
      .lte("scheduled_at", weekAhead)
      .then((r) => r.count ?? 0),
    supabase
      .from("development_plans")
      .select("id", { count: "exact", head: true })
      .eq("academy_id", academyId)
      .eq("status", "active")
      .lte("review_date", new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10))
      .then((r) => r.count ?? 0),
  ]);
  return { squadSize, sessionsThisWeek, reviewsDue };
}
