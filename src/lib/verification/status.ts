import type { StatusKind } from "@/components/ui/status-badge";

export function verificationBadge(status: string): StatusKind {
  const map: Record<string, StatusKind> = {
    unverified: "draft",
    pending: "submitted",
    verified: "verified",
    rejected: "rejected",
    expired: "needs_evidence",
  };
  return map[status] ?? "draft";
}

export const VERIFICATION_TYPE_LABEL: Record<string, string> = {
  identity: "Identity",
  age: "Age",
  registration: "Registration",
  playing_history: "Playing history",
};

/** Expiring within the given window (default 60 days)? */
export function isExpiringSoon(expiresAt: string | null, days = 60): boolean {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  return t > Date.now() && t < Date.now() + days * 24 * 3600 * 1000;
}
