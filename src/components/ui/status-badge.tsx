import { cn } from "@/lib/utils";

/**
 * Plain-language status states (§4 Status design).
 * IMPORTANT: "Verified" is NOT green — a green badge must never imply FIFA or
 * transfer approval. Verified uses the neutral navy/teal family instead.
 */
export type StatusKind =
  | "draft"
  | "submitted"
  | "under_review"
  | "verified"
  | "needs_evidence"
  | "restricted"
  | "archived"
  | "active"
  | "approved"
  | "rejected";

const STATUS_STYLES: Record<StatusKind, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-navy-50 text-navy-600 ring-navy-100" },
  submitted: { label: "Submitted", className: "bg-teal-50 text-teal-700 ring-teal-100" },
  under_review: { label: "Under Review", className: "bg-amber-50 text-amber-600 ring-amber-50" },
  // Deliberately NOT green (§4): neutral teal/navy, communicates "evidence checked" only.
  verified: { label: "Verified", className: "bg-navy text-white ring-navy" },
  needs_evidence: {
    label: "Needs Evidence",
    className: "bg-amber-50 text-amber-600 ring-amber-50",
  },
  restricted: { label: "Restricted", className: "bg-navy-100 text-navy-700 ring-navy-100" },
  archived: { label: "Archived", className: "bg-navy-50 text-navy-600 ring-navy-100" },
  active: { label: "Active", className: "bg-teal-50 text-teal-700 ring-teal-100" },
  approved: { label: "Approved", className: "bg-navy text-white ring-navy" },
  rejected: { label: "Rejected", className: "bg-risk-50 text-risk-600 ring-risk-50" },
};

export function StatusBadge({ status, className }: { status: StatusKind; className?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
