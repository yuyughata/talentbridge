import { createElement } from "react";
import { requireWorkspace } from "@/lib/auth/session";
import { getAcademySummary } from "@/lib/analytics/academy";
import { AcademyDocument } from "@/lib/pdf/documents";
import { pdfResponse, slug } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Academy-level summary PDF for academy staff (scoped to their own academy). */
export async function GET(): Promise<Response> {
  const ctx = await requireWorkspace("academy");
  const membership = ctx.memberships.find((m) => m.role === "academy_staff");
  if (!membership) {
    return new Response("No academy is linked to your account.", { status: 400 });
  }
  const summary = await getAcademySummary(membership.organisationId);
  const date = new Date().toISOString().slice(0, 10);
  return pdfResponse(
    createElement(AcademyDocument, { summary }),
    `TBA-academy-summary-${slug(summary.academyName)}-${date}.pdf`,
  );
}
