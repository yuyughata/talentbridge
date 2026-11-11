# 05 — MVP scope & roadmap

_Source: blueprint §10 (MVP scope), §11 (delivery plan), §13 (metrics), §14 (first 30 days)._

## Functional modules (§5)

| ID | Module | Release |
| --- | --- | --- |
| M01 | Identity, authentication and roles | MVP |
| M02 | Player registry | MVP |
| M03 | Consent and safeguarding | MVP |
| M04 | Scouting assignments | MVP |
| M05 | Scouting reports and scorecards | MVP |
| M06 | Video and media library | MVP (basic links) → R3 (timestamps) |
| M07 | Player development & training management | MVP (basic) → R2/R3 (§5A) |
| M08 | Verification and document control | MVP |
| M09 | Talent discovery and shortlist | R2 |
| M10 | Recruiter access and enquiries | R2 |
| M11 | Academy management | R2 |
| M12 | Reporting and analytics | R3 |
| M13 | Notifications and tasks | R2 |
| M14 | Administration and audit | MVP (basic) → R2 |

## Release sequence (§10)

### MVP — Months 1–3

**Build:** Auth and roles; player registry; academy/scout onboarding; consent records; scouting
assignment; mobile scouting report; scorecard including Speed; reviewer queue; basic media links;
admin dashboard.

**Do _not_ build yet:** AI talent ranking, public open marketplace, automated transfer matching,
native mobile apps, complex payments, automated biometric or facial analysis.

### Release 2 — Months 4–6

**Build:** Academy workspace; player development plans; searchable talent pool; controlled
recruiter access; shortlists; portfolio PDF export; notifications; audit improvements.

**Do _not_ build yet:** Unsupervised recruiter access, predictive transfer-value estimates,
automated player recommendations without human review.

### Release 3 — Months 7–12

**Build:** Analytics; multi-assessor comparisons; video timestamp tools; advanced filters; partner
reporting; carefully tested integrations.

**Do _not_ build yet:** Large-scale AI video analysis until data volume, rights, consent, quality
and budget justify it.

## MVP acceptance criteria (§10)

- A scout can complete and save a report on a **mobile device**, including all seven weighted
  categories and Speed sub-scores.
- An assessor can submit a report and a reviewer can approve or return it with comments.
- A player profile can be shared only with a **permitted audience and active consent**.
- An academy user cannot view another academy's private records unless explicitly authorised.
- A recruiter cannot browse the full database without approval.
- An admin can see who accessed or changed sensitive records.
- Player search filters return only records the current user is authorised to view.

## Delivery phases (§11)

| Phase | Duration | Outputs |
| --- | --- | --- |
| Discovery & specification | 2 weeks | Interviews, workflows, screen map, field definitions, permission matrix, clickable wireframes |
| UX/UI design | 2–3 weeks | Design system, responsive screens, usability review |
| MVP engineering | 6–8 weeks | DB, auth, registry, scouting workflow, scorecard, admin review, deploy |
| Pilot | 4 weeks | 2–3 academies, 3–5 scouts; usability + data-quality feedback |
| Release 2 | 6–8 weeks | Academy tools, recruiter access, shortlists, development plans, reporting |

## First 30 days (§14)

1. Confirm product name, target users and first pilot academies.
2. Interview ≥3 scouts and ≥2 academy operators; observe current capture methods.
3. Approve the seven-category scorecard + Speed sub-score definitions with the technical lead.
4. Write the role/permission matrix and consent requirements before designing DB access.
5. Low-fidelity wireframes: player profile, scout report, reviewer queue, recruiter discovery.
6. Create the Supabase schema + RLS plan; test cross-organisation isolation.
7. Build a small clickable prototype; test with scouts on mobile.
8. Freeze MVP scope and acceptance criteria before full engineering.

> Items 3, 4 and 6 are substantially covered by this repository (scoring model, permission matrix,
> schema + RLS). The remaining items are product/discovery work.

## Success metrics (pilot hypotheses, §13)

| Metric | Target |
| --- | --- |
| Profile completeness | 80% of pilot profiles complete required fields |
| Evidence-backed reports | ≥90% of submitted reports include evidence notes |
| Report turnaround | Median < 72 hours after assignment (where footage/notes available) |
| Repeat observations | ≥2 observations before a high-priority recommendation (where feasible) |
| Consent coverage | 100% of externally shared profiles have valid permission recorded |
| Academy activity | ≥2–3 active pilot academies |
| Recruiter engagement | Qualified access requests and substantive enquiries (not raw page views) |

These are hypotheses to adjust after observing real behaviour, not guaranteed outcomes.

## Immediate engineering next steps

1. ~~Supabase Auth + invitation flows + route-level role gating~~ — **done** (docs/09).
2. ~~Player registry CRUD + consent capture (M02, M03)~~ — **done**:
   - `src/lib/players` (constants, queries, create/update actions, completeness) and
     `src/lib/consent` (record/withdraw).
   - Academy squad list + add player; cross-workspace player profile at `/players/[id]`
     (overview, development, consent, edit, submit-for-review); player self-profile at
     `/player/profile`; scout / admin / recruiter lists wired to RLS-scoped queries.
   - Restricted PII (DOB, nationality) hidden from non-authorised views (§2); consent capture
     records a lawful basis before any external share (§5 M03).
3. ~~Scouting report form + scorecard (M05)~~ — **done**:
   - `src/lib/scouting` (queries + actions). `createReport` writes `scouting_reports`,
     `scorecard_ratings` (with weight snapshots), `speed_subscores` and an optional `matches`
     row, and stores `weighted_score` from `calculateWeightedScore`.
   - `/scout/reports` (list), `/scout/reports/new` (seven weighted categories + Speed sub-scores
     + match context + evidence), `/scout/reports/[id]` (radar + score + evidence).
4. ~~Reviewer queue (approve / return / reject with comments)~~ — **done**: `/admin/review`
   queue + a reviewer panel on the report view; approval updates history but never auto-verifies
   the player (§9).
5. ~~Scouting assignments (M04)~~ — **done**: `src/lib/assignments`. TBA staff create assignments
   (scout + target player/position + objective + fixture + due date) at `/admin/assignments`;
   scouts see their list at `/scout/assignments`, mark in-progress, and **start a report from an
   assignment** (the report form prefills the player and stores `assignment_id`; submitting a
   report advances the assignment).
6. ~~Audit logging (M14)~~ — **done**: `logAudit` helper wired into report review, consent
   record/withdraw, player status and assignment creation; append-only `/admin/audit` viewer.
7. ~~Notifications (M13)~~ — **done**: `notifyUser` (service-role, best-effort) on report review
   and assignment creation; `/notifications` page + header bell with unread badge. Email delivery
   layers a transactional provider on top of these rows (§7).
8. ~~Player development & academy training (M07 / §5A)~~ — **done**:
   - IDPs at `/players/[id]/development`: plans, measurable goals (baseline/target/action/status),
     and dated 12-week reviews with trends (§5A D/F/G).
   - Academy training: `/academy/calendar` (plan sessions), `/academy/sessions/[id]` (record
     attendance + per-player coaching observations, §5A E), `/academy/development` (age-band
     curriculum reference, §5A A), `/academy/attendance`.
9. ~~Dashboard live counts~~ — **done**: `src/lib/dashboard/queries` powers the scout, admin and
   academy KPI strips with real RLS-scoped counts; admin dashboard tiles now link through.
10. ~~Verification & document control (M08)~~ — **done**: `src/lib/verification`. `/admin/verification`
    lets TBA staff add records (identity/age/registration/playing-history), set status, track expiry,
    and store a private document *pointer* (never the file); a staff-only verification section shows
    on the player profile. Evidence checks never auto-verify the profile (§9); records are staff-only
    (RLS, §12).
11. ~~Reporting & analytics (M12)~~ — **done**: `src/lib/analytics`. `/admin/analytics` shows coverage,
    report pipeline, position distribution, evidence-backed-report rate (§13 target), average profile
    completeness, training sessions and recruiter enquiries by status.
12. Remaining finishing: link training sessions to development goals in the UI; richer progress trend
    charts (§5A G Release 3); M06 external video ingestion; the pre-pilot RLS test suite (§12).
