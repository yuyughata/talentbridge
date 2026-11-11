# 08 — Academy training & development module

_Source: blueprint §5A (dedicated module) and §5 M07/M11. Schema in
`supabase/migrations/0007_development_module.sql`._

**Purpose.** Turn the platform from a player-record and scouting tool into a complete talent
development operating system. Coaches plan age-appropriate training, deliver and record sessions,
set individual targets, monitor progress and reassess players using consistent evidence.

> This module supports **local development**. It does not imply guaranteed selection, contracts or
> overseas placement.

## A. Age-band development pathways (§5A A)

Editable curriculum templates (`curriculum_templates`, seeded as global templates). Age bands are
**planning guides**, adapted to maturity, experience, school demands, match schedule, health and
recovery — not rigid prescriptions.

| Band | Focus |
| --- | --- |
| 6–9 Foundation | Enjoyment, ball familiarity, coordination, balance, dribbling, simple passing, small-sided games |
| 10–12 Development | First touch, passing both feet, dribbling under pressure, scanning, basic tactics, acceleration mechanics |
| 13–15 Advanced foundation | Technical execution at speed, decision-making, positional principles, agility, safe strength foundations |
| 16–18 Performance prep | Advanced tactics, high-speed execution, position-specific demands, supervised S&C, analysis, recovery, nutrition |

## B. Calendar, weekly plan & session builder (§5A B)

Academy calendar + individual player schedules. Coaches create recurring weekly microcycles
(`training_microcycles`) and sessions (`training_sessions`) with objective, duration, intensity
intent, equipment, coach, location and linked development goals (`session_goal_links`). Example
templates (a 13–15 week; a 90-minute session) are **examples, editable, not hard-coded**.

## C. Position-specific libraries (§5A C)

`position_training_templates`, seeded for goalkeeper, defender, midfielder, winger and striker.

## D. Individual development plans (§5A D)

`development_plans` + `development_goals`. Each goal: baseline evidence; 2–4 priority goals;
attribute; specific training action; measurable success indicator; responsible coach/player; target
date; review date; status; coach comment; player reflection; links to sessions/clips. **Keep
current ability separate from rate of improvement** so late developers aren't overlooked.

## E. Session records & attendance (§5A E)

After each session the coach records attendance (`session_attendance`), delivered-vs-planned,
duration, objectives, formats, engagement, observations (`session_observations`) and follow-ups.
Workload is captured simply (duration + perceived exertion in `workload_entries`) **only where staff
are trained**. These are **not** medical diagnoses.

## F. Twelve-week reassessment cycle (§5A F)

`development_reviews` records each cycle:

| Weeks | Focus |
| --- | --- |
| 1–2 | Baseline — technical, tactical, speed/coordination, age-appropriate physical observations + goals |
| 3–5 | Technical foundation — priority ball skills, measurable practice targets |
| 6–8 | Tactical & physical application — scanning, decision-making, movement/speed work |
| 9–10 | Competitive application — transfer of learning, evidence + video timestamps where permitted |
| 11–12 | Reassessment — repeat comparable observations, review IDP targets, agree next cycle |

## G. Progress dashboard (§5A G)

Show progress **over time**, not a single headline score: baseline vs latest; technical/tactical/
speed/decision trends; goal completion; attendance; coach feedback; match observations; cycle
history; next review date. Label data dates, assessor and confidence. Do not imply a score
guarantees selection.

## H. Workload, recovery & youth welfare (§5A H)

See [`docs/06-security-and-governance.md`](./06-security-and-governance.md). Age-appropriate loads;
rest days; stop on pain/fatigue/illness; heat safety; safeguarding controls, guardian consent,
staff vetting and reporting routes linked to academy/player records; collect only necessary welfare
data and never expose it to recruiters.

## I. Roles & permissions (§5A I)

| Role | In this module |
| --- | --- |
| Academy director | Manages academy calendar, squads and staff |
| Coach | Plans sessions, records attendance, updates assigned IDPs |
| Player | Views own schedule, goals and approved feedback |
| Parent/guardian | Sees permitted information for the linked child |
| TBA technical reviewer | Audits assessment quality and methodology |
| Recruiters | Do **not** receive training attendance, welfare notes or internal coaching records by default |

Enforced by RLS: academy-scoped tables check `tba_is_org_member(academy_id)`; welfare tables are
staff/academy-only.

## K. Release sequence (§5A K)

| Release | Delivers |
| --- | --- |
| MVP / R1 | Basic development goal + review-date capability; simple baseline + next review date |
| R2 | Academy training calendar, age-band curriculum templates, weekly microcycles, session builder, attendance, coach feedback, IDPs, 12-week cycle |
| R3 | Trend dashboards, multi-coach comparisons, richer video-linked review, academy benchmarking with privacy safeguards, configurable analytics |

**Acceptance (§5A K):** a coach can create an age-appropriate session, assign a squad, record
attendance and observations, link work to an individual goal, and produce a dated progress report;
a guardian/player sees only authorised information; another academy and an external recruiter cannot
access internal training or welfare records without explicit permission.
