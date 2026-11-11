import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PlayerCardData } from "@/components/player/player-card";
import type { StatusKind } from "@/components/ui/status-badge";
import { ageBandFromDob, positionCode } from "./constants";

export interface PlayerRow {
  id: string;
  display_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  primary_position: string | null;
  secondary_positions: string[] | null;
  dominant_foot: string | null;
  height_cm: number | null;
  location: string | null;
  languages: string[] | null;
  profile_status: string;
  is_minor: boolean;
  completeness_percent: number;
  primary_academy_id: string | null;
  user_id: string | null;
  updated_at: string;
  academy_name?: string | null;
}

const PROFILE_TO_BADGE: Record<string, StatusKind> = {
  draft: "draft",
  submitted: "submitted",
  under_review: "under_review",
  active: "active",
  needs_evidence: "needs_evidence",
  restricted: "restricted",
  archived: "archived",
};

export function profileBadge(status: string): StatusKind {
  return PROFILE_TO_BADGE[status] ?? "draft";
}

const SELECT =
  "id, display_name, preferred_name, date_of_birth, nationality, primary_position, " +
  "secondary_positions, dominant_foot, height_cm, location, languages, profile_status, " +
  "is_minor, completeness_percent, primary_academy_id, user_id, updated_at, organisations(name)";

function normalise(row: Record<string, unknown>): PlayerRow {
  const org = row.organisations as { name: string | null } | { name: string | null }[] | null;
  const academy_name = Array.isArray(org) ? (org[0]?.name ?? null) : (org?.name ?? null);
  return { ...(row as unknown as PlayerRow), academy_name };
}

/** Map a player row to the PlayerCard view model. Never exposes raw DOB. */
export function toPlayerCard(row: PlayerRow): PlayerCardData {
  return {
    name: row.preferred_name || row.display_name,
    ageBand: ageBandFromDob(row.date_of_birth),
    position: row.primary_position ?? "Unassigned",
    positionCode: positionCode(row.primary_position),
    foot: (row.dominant_foot as "Left" | "Right" | "Both") ?? "Right",
    academy: row.academy_name ?? "—",
    location: row.location ?? "—",
    lastAssessed: new Date(row.updated_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    verification: profileBadge(row.profile_status),
  };
}

export interface ListOptions {
  academyId?: string;
  search?: string;
  limit?: number;
}

/** List players visible to the current user (RLS-scoped). */
export async function listPlayers(opts: ListOptions = {}): Promise<PlayerRow[]> {
  const supabase = createClient();
  let query = supabase.from("players").select(SELECT).order("updated_at", { ascending: false });

  if (opts.academyId) query = query.eq("primary_academy_id", opts.academyId);
  if (opts.search) query = query.ilike("display_name", `%${opts.search}%`);
  query = query.limit(opts.limit ?? 60);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((r) => normalise(r as unknown as Record<string, unknown>));
}

/** A single player by id, or null if not visible / not found. */
export async function getPlayer(id: string): Promise<PlayerRow | null> {
  const supabase = createClient();
  const { data } = await supabase.from("players").select(SELECT).eq("id", id).maybeSingle();
  return data ? normalise(data as unknown as Record<string, unknown>) : null;
}

/** The player record linked to the current user (player portal), if any. */
export async function getMyPlayer(userId: string): Promise<PlayerRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("players")
    .select(SELECT)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? normalise(data as unknown as Record<string, unknown>) : null;
}

export interface ConsentRow {
  id: string;
  consent_type: string;
  version: string;
  status: string;
  scope: string | null;
  granted_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
}

/** Consent records for a player (§5 M03), newest first. */
export async function listConsents(playerId: string): Promise<ConsentRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("player_consents")
    .select("id, consent_type, version, status, scope, granted_at, withdrawn_at, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data as ConsentRow[] | null) ?? [];
}

export interface DevelopmentPlanRow {
  id: string;
  title: string | null;
  review_date: string | null;
  status: string;
  baseline_note: string | null;
}

/** Development plans for a player (§5 M07, read side for the profile). */
export async function listDevelopmentPlans(playerId: string): Promise<DevelopmentPlanRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("development_plans")
    .select("id, title, review_date, status, baseline_note")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data as DevelopmentPlanRow[] | null) ?? [];
}
