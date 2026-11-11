/**
 * Role and permission model (§5 M01, §5A I, §10 MVP acceptance criteria).
 *
 * This is the application-layer mirror of the database RLS policies
 * (supabase/migrations/0008_rls_helpers_and_policies.sql). RLS is the source of
 * truth for access control (§7 "enforce permissions in database policies, not
 * only by hiding buttons"); these helpers drive UI affordances and should never
 * be the only gate on sensitive data.
 */

export const APP_ROLES = [
  "player",
  "guardian",
  "scout",
  "academy_staff",
  "tba_reviewer",
  "recruiter",
  "super_admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** The workspace each role lands in (§3 Information architecture). */
export const ROLE_WORKSPACE: Record<AppRole, string> = {
  player: "/player",
  guardian: "/player",
  scout: "/scout",
  academy_staff: "/academy",
  tba_reviewer: "/admin",
  recruiter: "/recruiter",
  super_admin: "/admin",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  player: "Player",
  guardian: "Parent / guardian",
  scout: "Scout",
  academy_staff: "Academy / coach",
  tba_reviewer: "TBA reviewer",
  recruiter: "Club / recruiter",
  super_admin: "Platform administrator",
};

/**
 * Capability catalogue. Keep in sync with the permission matrix in
 * docs/03-roles-and-permissions.md.
 */
export const PERMISSIONS = [
  "player.view_public", // view consented, non-sensitive profile fields
  "player.view_sensitive", // DOB, documents, verification evidence
  "player.edit",
  "consent.manage",
  "scouting.assign",
  "scouting.report.create",
  "scouting.report.review", // approve / return
  "verification.manage",
  "media.upload",
  "development.manage", // IDPs, training sessions, attendance
  "welfare.view", // workload / welfare notes (restricted)
  "discovery.search",
  "recruiter.request_access",
  "recruiter.decide_access",
  "shortlist.manage",
  "admin.users", // roles & memberships
  "admin.audit",
  "admin.settings",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Base role → permission grants. These are coarse defaults; row-level scope
 * (e.g. "only this academy's players") is enforced by RLS, not here.
 *
 * Recruiters deliberately do NOT get welfare.view or player.view_sensitive, and
 * never receive training attendance or coaching records by default (§5A I).
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  player: ["player.view_public", "player.edit", "consent.manage"],
  guardian: ["player.view_public", "consent.manage"],
  scout: ["player.view_public", "scouting.report.create", "media.upload", "discovery.search"],
  academy_staff: [
    "player.view_public",
    "player.view_sensitive",
    "player.edit",
    "consent.manage",
    "media.upload",
    "development.manage",
    "welfare.view",
    "discovery.search",
    "shortlist.manage",
  ],
  tba_reviewer: [
    "player.view_public",
    "player.view_sensitive",
    "player.edit",
    "scouting.assign",
    "scouting.report.review",
    "verification.manage",
    "discovery.search",
    "recruiter.decide_access",
    "shortlist.manage",
    "admin.audit",
  ],
  recruiter: ["discovery.search", "recruiter.request_access", "shortlist.manage"],
  super_admin: [...PERMISSIONS],
};

/** Does any of the user's roles grant this permission? */
export function hasPermission(roles: AppRole[], permission: Permission): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

/** Highest-priority workspace for a user holding several roles. */
const WORKSPACE_PRIORITY: AppRole[] = [
  "super_admin",
  "tba_reviewer",
  "academy_staff",
  "scout",
  "recruiter",
  "guardian",
  "player",
];

export function primaryWorkspace(roles: AppRole[]): string {
  const role = WORKSPACE_PRIORITY.find((r) => roles.includes(r)) ?? "player";
  return ROLE_WORKSPACE[role];
}
