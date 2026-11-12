# 13 — AI note transcription (optional)

Transcribe **assessment and training notes** from an **image** (handwritten or
printed) or **voice** (recorded audio) straight into the text fields.

> **Opt-in & privacy.** The feature is OFF unless the organisation sets a
> provider API key. Content is sent to the configured AI provider **only when a
> user explicitly clicks transcribe** (scan or record). No account identity is
> sent — only the note the user chose to transcribe. This is a deliberate,
> per-use external call; treat it accordingly under §2/§12.

## How it works

| Mode | Provider | Env key |
| --- | --- | --- |
| Image → text (Claude vision) | Anthropic | `ANTHROPIC_API_KEY` (model: `ANTHROPIC_TRANSCRIBE_MODEL`, default `claude-haiku-5-5`) |
| Voice → text (audio transcription) | OpenAI | `OPENAI_API_KEY` (model: `OPENAI_TRANSCRIBE_MODEL`, default `whisper-1`) |

- No new npm dependencies — plain `fetch` to the provider REST APIs server-side.
- Voice is captured in the browser with `MediaRecorder` (no plugin) and posted
  as an audio clip.
- Each mode appears only when its key is configured; with neither set, the UI
  shows a quiet "AI transcription is off" hint and everything else works as
  normal (type the note by hand).

## Pieces

- `src/lib/ai/transcribe.ts` — `transcriptionCapabilities()`, `transcribeImage()`,
  `transcribeAudio()` (server-only).
- `POST /api/transcribe` — auth-gated route (multipart `file` + `kind`), 15 MB
  cap, returns `{ text }`; `GET` returns the capability flags.
- `src/components/ai/transcribe-widget.tsx` — the client control (Scan notes /
  Record voice), with status and errors.
- `src/components/ai/transcribable-textarea.tsx` — a textarea that the widget
  fills (appends), submitting normally with the form.

## Where it's wired

- **Scouting report form** — Observed strengths, Development areas, Narrative.
- **Training session page** — "Session notes" (saved to the session, marks it
  delivered).

Drop `TranscribableTextarea` (passing `caps={transcriptionCapabilities()}` from a
server component) anywhere else notes are typed to extend it.

## Enabling it

Set `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` in the environment (e.g. Vercel
project env). If the account uses different model IDs, override with the
`*_TRANSCRIBE_MODEL` vars. No redeploy of data is needed — it's runtime config.
