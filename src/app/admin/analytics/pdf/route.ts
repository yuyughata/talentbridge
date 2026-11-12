import { createElement } from "react";
import { requireWorkspace } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/analytics/queries";
import { AnalyticsDocument } from "@/lib/pdf/documents";
import { pdfResponse } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Operations summary PDF. Admin workspace only (super admin / reviewer). */
export async function GET(): Promise<Response> {
  const ctx = await requireWorkspace("admin");
  const data = await getAnalytics();
  const date = new Date().toISOString().slice(0, 10);
  return pdfResponse(
    createElement(AnalyticsDocument, { data, preparedBy: ctx.displayName }),
    `TBA-operations-summary-${date}.pdf`,
  );
}
