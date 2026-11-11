# 11 — Demo accounts & test data

This document lists the demo accounts and seed data loaded into the live
`talentbridge` Supabase project for evaluation and QA. It lets a reviewer sign
in as every role and exercise the full workflow (registry → scouting → review →
development → recruiter access).

> **Demo data only.** These are fictional people and academies created for
> testing. The portraits are abstract SVG silhouettes, not real players. Do not
> treat any record here as a real individual. Rotate or remove these accounts
> before any production launch.

## Signing in

All demo accounts share one password:

```
Password: DemoPass123!
```

Sign in at `/login`. Each account lands in the workspace for its role (§3).

| Email | Role | Workspace | What it can do |
| --- | --- | --- | --- |
| `admin@demo.tba.africa` | Super admin | `/admin` | Full platform: users, assignments, verification, audit, analytics, talent pool |
| `reviewer@demo.tba.africa` | TBA reviewer | `/admin/review` | Review queue, verification & document control (§5 M08) |
| `scout@demo.tba.africa` | Scout | `/scout` | Assignments, scoped player access, match reports with Speed (§6) |
| `coach@demo.tba.africa` | Academy staff — *Lagos Future Stars Academy* | `/academy` | Squad, player create/edit, development plans, training sessions & attendance (§5A) |
| `recruiter@demo.tba.africa` | Recruiter — *Demo FC* | `/recruiter` | Consent-gated talent pool access via granted recruiter access |
| `player@demo.tba.africa` | Player (portal) | `/player` | Own profile, media, consent — linked to a seeded player record |
| `guardian@demo.tba.africa` | Guardian | `/player` | Guardian view for a minor player (safeguarding, §3/§12) |

Roles are modelled as `organisation_members.role` (per-organisation) plus the
`users.is_super_admin` flag — see `docs/03-roles-and-permissions.md`.

## Seeded players (11)

Eleven Nigerian players, ages 13–19, across goalkeeper, defence, midfield and
attack. Seven are minors (restricted PII and extra safeguarding), the rest are
18+. Profile statuses span the lifecycle so the review queue, "needs evidence"
and "active" states are all populated.

| Player | Position | Age | Status |
| --- | --- | --- | --- |
| Victor Balogun | Second Striker | 13 | draft |
| Blessing Adeyemi | Central Midfielder | 14 | draft |
| Samuel Eze | Attacking Midfielder | 15 | submitted |
| Ifeanyi Okafor | Defensive Midfielder | 16 | needs evidence |
| Kelechi Umeh | Striker | 16 | needs evidence |
| Tunde Bakare | Right Back | 17 | submitted |
| Daniel Okoro | **Goalkeeper** | 18 | active |
| Musa Abdullahi | Central Midfielder | 18 | active |
| Emeka Obi | Centre Back | 18 | active |
| Chinedu Nwosu | Left Back | 18 | active |
| David Okonkwo | Striker | 19 | active |

**By line:** Goalkeeper — Okoro (GK). Defenders — Bakare (RB), Obi (CB), Nwosu
(LB). Midfielders — Adeyemi (CM), Eze (AM), Okafor (DM), Abdullahi (CM).
Strikers — Balogun (SS), Umeh (ST), Okonkwo (ST).

**Goalkeeper assessment.** Daniel Okoro has a submitted scouting report that
uses the **goalkeeper overlay** (`docs/04-scoring-model.md`) — shot-stopping,
handling, command of area, 1v1, positioning/sweeping, distribution with feet and
hands, and communication — rather than the outfield parameters. Sign in as the
scout or reviewer and open his report to see the position-specific assessment
alongside the seven weighted categories.

## Other seeded records

So the dashboards and queues are not empty:

- **Academies / clubs** — Lagos Future Stars Academy, Talent Bridge Africa
  (reviewing org), Demo FC (recruiter).
- **Scouting reports** — 3 reports (incl. the goalkeeper report), two sitting in
  the reviewer queue.
- **Recruiter access** — 1 consent-based grant to Demo FC.
- **Verification** — 3 verification records (identity / age / registration).
- **Media** — 2 linked footage items (private by default, §2/§5 M06).
- **Development** — 1 plan with 2 goals (§5 M07 / §5A).
- **Training** — 1 session with 3 attendance records (§5A E).
- **Notifications** — 2 unread, to exercise the bell and `/notifications`.

## Environment

The browser client needs the project URL and publishable key. Copy
`.env.example` to `.env.local` and fill in the values from Supabase →
Project Settings → API Keys (the publishable `sb_publishable_…` key). The
invitation-acceptance and verification server actions additionally need
`SUPABASE_SERVICE_ROLE_KEY` (server-only — never exposed to the browser).

## Re-seeding

The demo data was applied directly to the live project. To reproduce it on a
fresh database, run the migrations in `supabase/migrations/` (0001–0014) and
then re-insert the accounts and records above. Auth users are created with
`insert into auth.users (…, encrypted_password, email_confirmed_at)` using
`crypt('DemoPass123!', gen_salt('bf'))`; the `handle_new_user` trigger mirrors
each into `public.users`.
