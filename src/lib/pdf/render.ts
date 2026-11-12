import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Render a @react-pdf document element to a downloadable PDF Response. */
export async function pdfResponse(element: ReactElement, filename: string): Promise<Response> {
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export function slug(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "player";
}
