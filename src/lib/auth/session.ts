import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WORKSPACES } from "@/lib/navigation";
import { primaryWorkspace, ROLE_WORKSPACE, type AppRole } from "./roles";

export interface Membership {
  organisationId: string;
  organisationName: string | null;
  role: AppRole;
}

export interface UserContext {
  userId: string;
  email: string;
  displayName: string;
  isSuperAdmin: boolean;
  roles: AppRole[];
  memberships: Membership[];
}

/** The authenticated auth user, or null. */
export async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Full application context for the signed-in user: profile, org memberships and
 * the derived set of roles used for routing and UI gating. Returns null when not
 * signed in. All queries run under RLS as the user (self-readable rows).
 */
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: members }, { data: playerRows }, { data: guardianRows }] =
    await Promise.all([
      supabase
        .from("users")
        .select("display_name, email, is_super_admin")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("organisation_members")
        .select("organisation_id, role, organisations(name)")
        .eq("user_id", user.id)
        .eq("membership_status", "active"),
      supabase.from("players").select("id").eq("user_id", user.id).limit(1),
      supabase.from("player_guardians").select("id").eq("guardian_user_id", user.id).limit(1),
    ]);

  const roles = new Set<AppRole>();
  const memberships: Membership[] = [];

  if (profile?.is_super_admin) roles.add("super_admin");

  for (const m of members ?? []) {
    const role = m.role as AppRole;
    roles.add(role);
    const org = m.organisations as { name: string | null } | { name: string | null }[] | null;
    const organisationName = Array.isArray(org) ? (org[0]?.name ?? null) : (org?.name ?? null);
    memberships.push({ organisationId: m.organisation_id, organisationName, role });
  }

  if (playerRows && playerRows.length > 0) roles.add("player");
  if (guardianRows && guardianRows.length > 0) roles.add("guardian");

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? "",
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Account",
    isSuperAdmin: Boolean(profile?.is_super_admin),
    roles: [...roles],
    memberships,
  };
}

/** Require an authenticated user; redirect to /login otherwise. */
export async function requireUser(nextPath?: string): Promise<UserContext> {
  const ctx = await getUserContext();
  if (!ctx) {
    redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  }
  return ctx;
}

/**
 * Require that the user may use a given workspace. If signed out, go to /login.
 * If signed in but lacking the role, send them to their own primary workspace.
 */
export async function requireWorkspace(workspace: keyof typeof WORKSPACES): Promise<UserContext> {
  const base = WORKSPACES[workspace].basePath;
  const ctx = await requireUser(base);
  const allowed = ctx.roles.some((r) => ROLE_WORKSPACE[r] === base);
  if (!allowed) {
    redirect(primaryWorkspace(ctx.roles));
  }
  return ctx;
}
