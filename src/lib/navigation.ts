/** Primary navigation per workspace (§3 Information architecture). */

/** Icon keys resolved to components in the workspace shell. */
export type IconKey =
  | "grid"
  | "ball"
  | "user"
  | "video"
  | "clipboard"
  | "chart"
  | "gauge"
  | "calendar"
  | "search"
  | "target"
  | "shield"
  | "lock"
  | "users"
  | "whistle"
  | "badge"
  | "bolt";

export interface NavItem {
  label: string;
  href: string;
  icon: IconKey;
}

export interface WorkspaceNav {
  key: string;
  title: string;
  purpose: string;
  basePath: string;
  items: NavItem[];
}

export const WORKSPACES = {
  player: {
    key: "player",
    title: "Player portal",
    purpose: "Maintain approved information and see development feedback.",
    basePath: "/player",
    items: [
      { label: "Overview", href: "/player", icon: "grid" },
      { label: "My Profile", href: "/player/profile", icon: "user" },
      { label: "Videos", href: "/player/videos", icon: "video" },
      { label: "Assessments", href: "/player/assessments", icon: "chart" },
      { label: "Development Plan", href: "/player/development", icon: "target" },
      { label: "Consent & Privacy", href: "/player/consent", icon: "lock" },
    ],
  },
  scout: {
    key: "scout",
    title: "Scout workspace",
    purpose: "Make field scouting fast, structured and auditable.",
    basePath: "/scout",
    items: [
      { label: "Dashboard", href: "/scout", icon: "grid" },
      { label: "Assignments", href: "/scout/assignments", icon: "target" },
      { label: "Players", href: "/scout/players", icon: "users" },
      { label: "Match Reports", href: "/scout/reports", icon: "clipboard" },
      { label: "Scorecards", href: "/scout/scorecards", icon: "chart" },
      { label: "Submissions", href: "/scout/submissions", icon: "badge" },
    ],
  },
  academy: {
    key: "academy",
    title: "Academy workspace",
    purpose: "Maintain records and collaborate with TBA.",
    basePath: "/academy",
    items: [
      { label: "Overview", href: "/academy", icon: "grid" },
      { label: "Squad", href: "/academy/squad", icon: "users" },
      { label: "Player Development", href: "/academy/development", icon: "target" },
      { label: "Training Calendar", href: "/academy/calendar", icon: "calendar" },
      { label: "Attendance", href: "/academy/attendance", icon: "clipboard" },
      { label: "Reports", href: "/academy/reports", icon: "chart" },
      { label: "Invitations", href: "/academy/invitations", icon: "badge" },
    ],
  },
  recruiter: {
    key: "recruiter",
    title: "Recruiter workspace",
    purpose: "Controlled access to relevant, well-documented talent.",
    basePath: "/recruiter",
    items: [
      { label: "Discover", href: "/recruiter", icon: "search" },
      { label: "Shortlists", href: "/recruiter/shortlists", icon: "clipboard" },
      { label: "Player Portfolios", href: "/recruiter/portfolios", icon: "user" },
      { label: "Enquiries", href: "/recruiter/enquiries", icon: "badge" },
    ],
  },
  admin: {
    key: "admin",
    title: "TBA operations",
    purpose: "Operate the platform, enforce quality and manage partnerships.",
    basePath: "/admin",
    items: [
      { label: "Command Centre", href: "/admin", icon: "gauge" },
      { label: "Verification", href: "/admin/verification", icon: "shield" },
      { label: "Review Queue", href: "/admin/review", icon: "clipboard" },
      { label: "Assignments", href: "/admin/assignments", icon: "target" },
      { label: "Talent Pool", href: "/admin/talent-pool", icon: "users" },
      { label: "Partnerships", href: "/admin/partnerships", icon: "badge" },
      { label: "Analytics", href: "/admin/analytics", icon: "chart" },
      { label: "Insights", href: "/admin/insights", icon: "bolt" },
      { label: "Users & Roles", href: "/admin/users", icon: "user" },
      { label: "Audit", href: "/admin/audit", icon: "lock" },
      { label: "Settings", href: "/admin/settings", icon: "bolt" },
    ],
  },
} satisfies Record<string, WorkspaceNav>;
