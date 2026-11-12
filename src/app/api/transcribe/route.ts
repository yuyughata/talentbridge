import { getUserContext } from "@/lib/auth/session";
import {
  transcribeAudio,
  transcribeImage,
  transcriptionCapabilities,
} from "@/lib/ai/transcribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Transcribe an uploaded image or recorded audio clip to text. Auth required. */
export async function POST(req: Request): Promise<Response> {
  const ctx = await getUserContext();
  if (!ctx) return json({ error: "You must be signed in." }, 401);

  const caps = transcriptionCapabilities();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Expected a file upload." }, 400);
  }

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  if (!(file instanceof File)) return json({ error: "No file provided." }, 400);
  if (file.size === 0) return json({ error: "Empty file." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "File too large (max 15 MB)." }, 413);

  try {
    if (kind === "image") {
      if (!caps.image) return json({ error: "Image transcription is not configured." }, 501);
      const buf = Buffer.from(await file.arrayBuffer());
      const mediaType = file.type || "image/png";
      const text = await transcribeImage(buf.toString("base64"), mediaType);
      return json({ text });
    }
    if (kind === "audio") {
      if (!caps.audio) return json({ error: "Voice transcription is not configured." }, 501);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const text = await transcribeAudio(bytes, file.name || "clip.webm", file.type || "audio/webm");
      return json({ text });
    }
    return json({ error: "Unknown transcription kind." }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "not_configured") return json({ error: "Transcription is not configured." }, 501);
    return json({ error: "Transcription failed. Please try again or type the note." }, 502);
  }
}

/** Report which transcription modes are available. */
export async function GET(): Promise<Response> {
  const ctx = await getUserContext();
  if (!ctx) return json({ error: "You must be signed in." }, 401);
  return json(transcriptionCapabilities());
}
