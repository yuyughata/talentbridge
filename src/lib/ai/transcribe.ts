import "server-only";

/**
 * Optional AI transcription for notes (§5A / §6 field notes).
 *
 * Privacy: this sends the uploaded image or recorded audio to the configured
 * third-party AI provider ONLY when a user explicitly triggers it. It is off
 * unless the organisation sets the relevant API key. No account identity is
 * sent — only the note content the user chose to transcribe.
 *
 *  - Image (handwritten/printed notes) → Anthropic Claude vision (ANTHROPIC_API_KEY)
 *  - Voice (recorded audio)            → OpenAI transcription (OPENAI_API_KEY)
 */

import type { TranscribeCaps } from "./types";
export type { TranscribeCaps };

export function transcriptionCapabilities(): TranscribeCaps {
  return {
    image: !!process.env.ANTHROPIC_API_KEY,
    audio: !!process.env.OPENAI_API_KEY,
  };
}

const IMAGE_PROMPT =
  "You are transcribing a coach's or scout's football notes. Read the handwritten or " +
  "printed notes in this image and output them as clean plain text. Preserve meaning, " +
  "line breaks and any bullet/list structure. Do not add headings, commentary, analysis " +
  "or interpretation. If some words are unclear, transcribe your best reading. Output only " +
  "the transcribed notes.";

/** Transcribe notes from an image via Claude vision. Returns plain text. */
export async function transcribeImage(base64: string, mediaType: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("not_configured");
  const model = process.env.ANTHROPIC_TRANSCRIBE_MODEL || "claude-haiku-5-5";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: IMAGE_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`anthropic_${res.status}`);
  }
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
  return text;
}

/** Transcribe recorded audio via OpenAI transcription. Returns plain text. */
export async function transcribeAudio(
  bytes: Uint8Array,
  filename: string,
  mimeType: string,
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("not_configured");
  const model = process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1";

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType || "audio/webm" }), filename);
  form.append("model", model);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`openai_${res.status}`);
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}
