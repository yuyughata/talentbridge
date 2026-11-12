import { createElement } from "react";
import { requireUser } from "@/lib/auth/session";
import { getReport } from "@/lib/scouting/queries";
import { ReportDocument } from "@/lib/pdf/documents";
import { pdfResponse, slug } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Scouting match report PDF. RLS-scoped — any role that can view the report. */
export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
  await requireUser(`/scout/reports/${params.id}`);
  const report = await getReport(params.id);
  if (!report) return new Response("Not found", { status: 404 });

  return pdfResponse(
    createElement(ReportDocument, { report }),
    `TBA-scouting-report-${slug(report.player_name ?? "player")}.pdf`,
  );
}
