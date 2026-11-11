# 03 — Roles & permissions matrix

_Source: blueprint §5 M01, §5A I, §10. Implemented in `src/lib/auth/roles.ts` (UI layer) and
`supabase/migrations/0008_rls_helpers_and_policies.sql` (enforcement layer)._

> **RLS is the real boundary.** The application permission map drives UI affordances and routing.
> It must never be the only gate on sensitive data — every access path is also enforced by Postgres
> Row Level Security.

## Roles (§5 M01)

`player`, `guardian`, `scout`, `academy_staff`, `tba_reviewer`, `recruiter`, `super_admin`.

A user may hold **different roles in different organisations** (`organisation_members.role`).

## Permission matrix

| Permission | player | guardian | scout | academy_staff | tba_reviewer | recruiter | super_admin |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| View public player fields | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View sensitive data (DOB, docs) | — | — | — | ✓¹ | ✓ | — | ✓ |
| Edit player | own | — | — | ✓¹ | ✓ | — | ✓ |
| Manage consent | own | linked | — | ✓¹ | — | — | ✓ |
| Create scouting assignment | — | — | — | — | ✓ | — | ✓ |
| Create scouting report | — | — | ✓ | — | — | — | ✓ |
| Review report (approve/return) | — | — | — | — | ✓ | — | ✓ |
| Manage verification | — | — | — | — | ✓ | — | ✓ |
| Upload media | — | — | ✓ | ✓¹ | — | — | ✓ |
| Manage development / training | — | — | — | ✓¹ | — | — | ✓ |
| View welfare / workload notes | — | — | — | ✓¹ | ✓ | **✗** | ✓ |
| Discovery search | — | — | ✓ | ✓ | ✓ | ✓² | ✓ |
| Request recruiter access | — | — | — | — | — | ✓ | ✓ |
| Decide recruiter access | — | — | — | — | ✓ | — | ✓ |
| Manage shortlists | — | — | — | ✓ | ✓ | ✓ | ✓ |
| Manage users & roles | — | — | — | — | — | — | ✓ |
| View audit log | — | — | — | — | ✓ | — | ✓ |
| Platform settings | — | — | — | — | — | — | ✓ |

¹ Scoped to the staff member's own academy (enforced by `tba_academy_can_access_player`).
² Recruiters can search, but can only open a player **portfolio** after TBA grants time-limited,
logged access (`recruitment_enquiries`). No unrestricted browse of the database.

**Recruiters never receive** training attendance, private welfare notes or internal coaching
records by default (§5A I).

## RLS helper functions (`0008_...sql`)

| Function | Meaning |
| --- | --- |
| `tba_is_super_admin()` | Platform operator |
| `tba_is_staff()` | Super admin or an active TBA-org reviewer/admin |
| `tba_is_org_member(org)` | Active member of an organisation |
| `tba_is_self_player(player)` | The signed-in user **is** this player |
| `tba_is_guardian_of(player)` | Guardian linked to this player |
| `tba_academy_can_access_player(player)` | Active academy staff for the player's academy |
| `tba_recruiter_has_player_access(player)` | Approved, non-expired recruiter grant for the player |
| `tba_can_view_player(player)` | Combined read rule (staff ∨ self ∨ guardian ∨ academy ∨ recruiter-access) |
| `tba_can_write_report(report)` | Owner scout or staff |

## Access rules worth highlighting (acceptance criteria §10)

- A player profile can be shared only with a **permitted audience and active consent**.
- An academy user **cannot** view another academy's private records unless explicitly authorised.
- A recruiter **cannot** browse the full database without approval.
- An admin can see **who accessed or changed** sensitive records (`audit_logs`).
- Player search filters return **only** records the current user is authorised to view.

## Before pilot

The RLS policies are a reviewed baseline. §12 requires a dedicated **RLS test suite** and security
review before pilot launch — see [`docs/06-security-and-governance.md`](./06-security-and-governance.md).
The `src/lib/auth/roles.test.ts` tests assert the UI-layer grants; the database policies need their
own integration tests against a live Supabase instance (one signed-in user per role).
