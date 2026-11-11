# 04 — Scouting scorecard model (incl. Speed)

_Source: blueprint §6. Implemented in `src/lib/scoring/` and unit-tested in
`src/lib/scoring/calculate.test.ts`._

Ratings use a **1–10 scale** per attribute, each supported by a written definition and match
evidence. The weighted score is a **screening aid** — interpret it alongside position, competition
level, age, match context, role, physical maturity and number of observations.

## The seven weighted categories

| Category | Weight | What the scout evaluates |
| --- | :-: | --- |
| Technical | 20% | First touch, passing, receiving under pressure, ball carrying, dribbling, finishing or position-specific technique |
| Tactical | 15% | Positioning, scanning, movement, role understanding, pressing, decisions, game awareness |
| Physical — strength & endurance | 15% | Strength in duels, balance, mobility, stamina, repeat-effort capacity, robustness |
| **Speed** | **15%** | Acceleration, top speed, recovery speed, repeated sprint capacity, speed in football actions |
| Decision-making | 15% | Choice quality, speed of decision, risk management, awareness of options, execution under pressure |
| Mental & behavioural | 10% | Composure, resilience, concentration, coachability, discipline, communication |
| Consistency & impact | 10% | Repeatability, influence on team, execution across phases, reliability across observations |
| **TOTAL** | **100%** | |

> **Important change (Rev 1.1):** Speed is a **distinct scored category at 15%**, assessed through
> acceleration, top speed, repeated sprint ability and speed in football actions — not a stopwatch
> result.

Weights live in `src/lib/scoring/model.ts` (`CATEGORY_DEFINITIONS`). The model version is
`SCORING_MODEL_VERSION`.

## Weighted score calculation (§6)

For each category: `rating ÷ 10 × weight`. Sum all contributions → score out of 100.

> Example: Technical 8/10 at 20% → **16** points. Speed 7/10 at 15% → **10.5** points.

Implemented in `calculateWeightedScore()`. A unit test asserts exactly this worked example.

### Weight snapshots

Each `scorecard_ratings` row stores the `weight_snapshot` in force when it was recorded, so a
historical report's score stays stable even if the default weights later change.
`buildRatingSnapshots()` stamps the current defaults onto a new report's ratings.

## Speed sub-score (§6)

A separate overlay capturing four dimensions (`speed_subscores` table): **Acceleration**,
**Top speed**, **Repeated sprint ability**, **Football speed** — each 1–10.

## Rating scale (§6)

| Score | Descriptor |
| --- | --- |
| 1–2 | Major development need |
| 3–4 | Below current level |
| 5–6 | Functional / average |
| 7–8 | Strong |
| 9 | Outstanding |
| 10 | Exceptional / rare |

`ratingDescriptor(n)` returns the band label.

## Position-specific overlays (§6)

Keep the seven-category base model for comparison, then add position-specific attributes as a
**separate overlay** that never changes the weighted 0–100 score. Overlays are defined in
`src/lib/scoring/model.ts` as `OVERLAY_GROUPS` (goalkeeper, defender, midfielder, winger, striker);
`positionOverlayGroup(primaryPosition)` resolves a player's position to the right group, and the
scouting report form renders that group's parameters as extra 1–10 rows. Each overlay rating is
stored per report in `report_position_notes` (`group_key`, `attribute_key`, `attribute`,
`rating_1_to_10`, `note`).

**Goalkeepers are assessed differently.** Their game does not map onto dribbling, finishing or raw
sprinting, so the goalkeeper overlay replaces the outfield parameters with: shot-stopping &
reflexes, handling & catching, command of area (crosses), 1v1 & shot blocking, positioning &
sweeping, distribution with feet, distribution with hands, and communication & organisation. The
seven base categories still apply, read for the position — "Technical" as handling and footwork,
"Speed" as reactions and recovery off the line.

## Mandatory context fields (§6, Appendix A)

Every report must record: player ID; assessor ID; assessment date; match/competition; opponent;
venue; player's team; position and role observed; minutes observed and watch scope (full / half /
clips); footedness and verification status (shown **separately** from the performance score); at
least three evidence notes (one strength, one development area, one decisive action); and assessor
confidence (Low / Medium / High) with a reason.

> A **low-confidence** report must not be treated as a final recommendation.

## Scoring safeguards (§6)

- Do not compare raw scores from materially different competition levels without context.
- Do not make a final recruitment decision from one match or one report; target at least two
  full-match observations where feasible.
- Do not use height, speed or physical maturity as a proxy for overall talent.
- Use a separate medical/fitness assessment by qualified professionals; scouts do not diagnose.
- Retain original reports and reviewer changes so score adjustments are auditable.
