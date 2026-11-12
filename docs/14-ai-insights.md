# 14 — Player insights (trends, growth & AI analysis)

An analytics layer that highlights **trends and growth across players**, plus an
optional **AI narrative** on top. Trends are computed deterministically in code
(trustworthy numbers); the AI only interprets those numbers.

## Deterministic engine — `src/lib/insights/trends.ts`

- **`cohortInsights({ academyId? })`** — across players visible to the caller
  (RLS-scoped; optional academy filter):
  - players assessed, players *tracked* (2+ reports), average latest weighted
    index, average growth (first → latest);
  - **biggest improvers** and a **watch list** of decliners (name, first,
    latest, delta, # assessments);
  - **attribute strengths & gaps** — cohort average of the latest rating per
    scorecard category;
  - **by-position-line** average latest index.
- **`playerWeightedHistory(playerId)`** — a cheap per-player score series for a
  growth **sparkline**.

Growth = latest weighted score − first weighted score, per player, from their
scouting-report history.

## AI narrative — `src/lib/insights/ai.ts` (optional)

`generateCohortAnalysis(data)` sends the **already-computed aggregates** (never
raw records) to Claude and returns a grounded, plain-language analysis:
headline, trends, players to watch, attribute strengths/gaps, and 2–3
development-first recommendations. It is instructed to use only the provided
numbers and to treat scores as screening aids, not verdicts.

- Off unless `ANTHROPIC_API_KEY` is set (reuses the transcription key). Model via
  `ANTHROPIC_INSIGHTS_MODEL` (falls back to `ANTHROPIC_TRANSCRIBE_MODEL`, default
  `claude-haiku-5-5`).
- Triggered on demand by a button (server action `analyzeCohort`), not on every
  page load, so it only spends tokens when asked.

## Where it shows

- **Admin → Insights** (`/admin/insights`) — KPIs, improvers/watch-list tables,
  attribute and position bars, and the AI analysis panel. New nav item.
- **Player profile** — a growth **sparkline** and "+N since first assessment" in
  the Performance & analysis card (shown with 2+ assessments).

## Privacy

Only aggregated performance metrics and player display names/scores are used —
no restricted PII (DOB, nationality, documents). The AI call sends computed
aggregates only, and only when a user clicks *Generate AI analysis*.
