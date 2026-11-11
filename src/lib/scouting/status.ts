import type { StatusKind } from "@/components/ui/status-badge";
import type { ScorecardCategory } from "@/lib/scoring/model";

/** Map a report_status enum to a status badge kind. */
export function reportBadge(status: string): StatusKind {
  const map: Record<string, StatusKind> = {
    draft: "draft",
    submitted: "submitted",
    needs_clarification: "needs_evidence",
    approved: "approved",
    rejected: "rejected",
  };
  return map[status] ?? "draft";
}

export const CATEGORY_SHORT: Record<ScorecardCategory, string> = {
  technical: "TEC",
  tactical: "TAC",
  physical: "PHY",
  speed: "SPD",
  decision_making: "DEC",
  mental: "MEN",
  consistency: "CON",
};

/** Map an assignment_status enum to a status badge kind. */
export function assignmentBadge(status: string): StatusKind {
  const map: Record<string, StatusKind> = {
    open: "draft",
    in_progress: "under_review",
    submitted: "submitted",
    completed: "approved",
    cancelled: "rejected",
  };
  return map[status] ?? "draft";
}

export const RECOMMENDATION_LABEL: Record<string, string> = {
  monitor: "Monitor",
  reassess: "Reassess",
  development_priority: "Development priority",
  technical_review: "Technical review",
};
