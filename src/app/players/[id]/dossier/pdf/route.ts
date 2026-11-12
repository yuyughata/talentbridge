import { createElement } from "react";
import { requireUser } from "@/lib/auth/session";
import { getPlayerDossier } from "@/lib/passport/dossier";
import { DossierDocument } from "@/lib/pdf/documents";
import { pdfResponse, slug } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** NFF registration dossier PDF. Restricted to staff / own academy / the player. */
export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const ctx = await requireUser(`/players/${params.id}`);
  const dossier = await getPlayerDossier(params.id);
  if (!dossier) return new Response("Not found", { status: 404 });

  const p = dossier.player;
  const isStaff = ctx.roles.includes("super_admin") || ctx.roles.includes("tba_reviewer");
  const isSelf = p.user_id === ctx.userId;
  const isAcademyStaff = ctx.memberships.some(
    (m) => m.role === "academy_staff" && m.organisationId === p.primary_academy_id,
  );
  if (!(isStaff || isSelf || isAcademyStaff)) {
    return new Response("Forbidden — the registration dossier contains restricted data.", { status: 403 });
  }

  const name = slug(p.legal_last_name || p.display_name);
  return pdfResponse(
    createElement(DossierDocument, { dossier }),
    `TBA-registration-dossier-${name}.pdf`,
  );
}
