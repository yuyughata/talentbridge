# 12 — FIFA EPP alignment & PDF exports

This covers the data model additions that make a player profile **EPP-ready** (so
it can be registered through an academy and the NFF toward a FIFA Electronic
Player Passport) and the **PDF export** features across the platform.

> **Scope & disclaimer.** The platform does **not** issue an EPP — FIFA generates
> it via the FIFA Connect Interface / Clearing House, using data held by the
> member association (the NFF). This feature makes the data *passport-grade and
> exportable*: the academy captures clean registration data and submits a dossier
> to the NFF, which registers the player and assigns the FIFA Connect ID. See
> FIFA RSTP and the FIFA Clearing House Regulations for the authoritative rules.

## Data model (migration `0016_fifa_epp_alignment.sql`)

**FIFA Connect IDs** (nullable until assigned by the association):
- `players.fifa_connect_id`
- `organisations.fifa_connect_id` (club/academy) + `organisations.association_id`
- `associations.fifa_connect_id`

**`associations`** — member associations (seeded with the **Nigeria Football
Federation**). Readable by any signed-in user; only super admins write.

**Passport identity fields on `players`:** `gender`, `legal_first_name`,
`legal_last_name`, `place_of_birth`, `country_of_birth` (date of birth and
nationality already existed and remain restricted PII).

**`player_registrations`** — the passport "spine", one row per registration
spell (FIFA passports list clubs from the calendar year of the player's 12th
birthday):
`club_id`/`club_name`, `association_id`, `season_year`, `registered_from`,
`registered_to`, `player_status` (amateur/professional), `registration_kind`
(permanent/loan), `training_category`, `state` (confirmed/terminated/pending),
`note`. RLS mirrors player visibility; writes limited to staff and the player's
own academy.

Captured in the UI on the player profile → **Registration & FIFA passport**
card (`RegistrationManager`), and the identity fields in the player form's
restricted "Passport identity" block.

## Registration dossier (NFF submission)

`getPlayerDossier(playerId)` (`src/lib/passport/dossier.ts`) assembles identity,
academy/association + FIFA IDs, the full registration history and verification
records into one `PlayerDossier`, RLS-scoped.

## PDF exports (role-scoped)

Real PDFs are generated server-side with `@react-pdf/renderer` (built-in fonts,
no network). Documents live in `src/lib/pdf/documents.tsx`; route handlers stream
them. Access is enforced by the route guard **and** RLS, so each role can only
export what it may see.

| Export | Route | Who |
| --- | --- | --- |
| **NFF registration dossier** | `/players/[id]/dossier/pdf` | Staff · own academy · the player (contains restricted PII) |
| **Player profile summary** | `/players/[id]/pdf` | Any viewer (restricted PII masked for non-privileged roles) |
| **Scouting match report** | `/scout/reports/[id]/pdf` | Any role that can view the report (scout/reviewer/admin) |

Buttons: the player profile has **Profile PDF** and (for staff/academy/self)
**NFF dossier PDF**; the report page has **Download PDF**.

## What still needs the NFF

Before finalizing, confirm the **exact field set and submission channel** with
the NFF's registration system (e.g. COMET/FIFA Connect provider). Direct FIFA
Connect write-access runs through the association, not a private app — this
platform *feeds* that process and stores the FIFA Connect ID the NFF returns.
