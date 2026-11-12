import { createElement } from "react";
import { requireUser } from "@/lib/auth/session";
import { getPlayer } from "@/lib/players/queries";
import { ProfileDocument } from "@/lib/pdf/documents";
import { pdfResponse, slug } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Player profile summary PDF. Any viewer (RLS-scoped); restricted PII masked. */
export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const ctx = await requireUser(`/players/${params.id}`);
  const player = await getPlayer(params.id);
  if (!player) return new Response("Not found", { status: 404 });

  const isStaff = ctx.roles.includes("super_admin") || ctx.roles.includes("tba_reviewer");
  const isSelf = player.user_id === ctx.userId;
  const isAcademyStaff = ctx.memberships.some(
    (m) => m.role === "academy_staff" && m.organisationId === player.primary_academy_id,
  );
  const canSeeSensitive = isStaff || isSelf || isAcademyStaff;

  return pdfResponse(
    createElement(ProfileDocument, { player, canSeeSensitive }),
    `TBA-profile-${slug(player.preferred_name || player.display_name)}.pdf`,
  );
}
