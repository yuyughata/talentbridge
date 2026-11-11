/** Primary navigation per workspace (§3 Information architecture). */

export interface NavItem {
  label: string;
  href: string;
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
      { label: "Overview", href: "/player" },
      { label: "My Profile", href: "/player/profile" },
      { label: "Videos", href: "/player/videos" },
      { label: "Assessments", href: "/player/assessments" },
      { label: "Development Plan", href: "/player/development" },
      { label: "Consent & Privacy", href: "/player/consent" },
    ],
  },
  scout: {
    key: "scout",
    title: "Scout workspace",
    purpose: "Make field scouting fast, structured and auditable.",
    basePath: "/scout",
    items: [
      { label: "Dashboard", href: "/scout" },
      { label: "Assignments", href: "/scout/assignments" },
      { label: "Players", href: "/scout/players" },
      { label: "Match Reports", href: "/scout/reports" },
      { label: "Scorecards", href: "/scout/scorecards" },
      { label: "Submissions", href: "/scout/submissions" },
    ],
  },
  academy: {
    key: "academy",
    title: "Academy workspace",
    purpose: "Maintain records and collaborate with TBA.",
    basePath: "/academy",
    items: [
      { label: "Overview", href: "/academy" },
      { label: "Squad", href: "/academy/squad" },
      { label: "Player Development", href: "/academy/development" },
      { label: "Training Calendar", href: "/academy/calendar" },
      { label: "Attendance", href: "/academy/attendance" },
      { label: "Reports", href: "/academy/reports" },
      { label: "Invitations", href: "/academy/invitations" },
    ],
  },
  recruiter: {
    key: "recruiter",
    title: "Recruiter workspace",
    purpose: "Controlled access to relevant, well-documented talent.",
    basePath: "/recruiter",
    items: [
      { label: "Discover", href: "/recruiter" },
      { label: "Shortlists", href: "/recruiter/shortlists" },
      { label: "Player Portfolios", href: "/recruiter/portfolios" },
      { label: "Enquiries", href: "/recruiter/enquiries" },
    ],
  },
  admin: {
    key: "admin",
    title: "TBA operations",
    purpose: "Operate the platform, enforce quality and manage partnerships.",
    basePath: "/admin",
    items: [
      { label: "Command Centre", href: "/admin" },
      { label: "Verification", href: "/admin/verification" },
      { label: "Review Queue", href: "/admin/review" },
      { label: "Talent Pool", href: "/admin/talent-pool" },
      { label: "Partnerships", href: "/admin/partnerships" },
      { label: "Users & Roles", href: "/admin/users" },
      { label: "Audit", href: "/admin/audit" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
} satisfies Record<string, WorkspaceNav>;
