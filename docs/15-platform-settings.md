# 15 — Platform settings

A single, super-admin–editable configuration row that drives platform-wide
defaults and safeguarding rules. Replaces the old "coming soon" placeholder at
**Admin → Settings** (`/admin/settings`).

## Storage — migration `0018_platform_settings.sql`

One row (`platform_settings`, fixed id `ffffffff-ffff-4fff-8fff-ffffffffff01`).

- **RLS**: `select using (true)` — any authenticated user may read the config;
  `update using (private.tba_is_super_admin())` — only super admins may change
  it. `updated_at`/`updated_by` are stamped on every save.

## Settings

**General** — `platform_name`, `support_email`, `default_country`,
`default_timezone` (IANA), `season_label`.

**Governance & safeguarding** —
- `minor_age_threshold` (13–21, default 18): players under this age are flagged
  `is_minor`. **Wired live**: `src/lib/players/actions.ts` reads it via
  `getMinorAgeThreshold()` when creating/updating a player.
- `require_guardian_consent_for_minors`, `require_verification_for_active`,
  `restrict_pii_to_staff` — policy toggles surfaced to staff.

**Scouting defaults** — `default_confidence` (low/medium/high),
`min_observations` (1–10), `show_score_to_recruiters`.

## Code

- `src/lib/settings/types.ts` — `PlatformSettings`, `DEFAULT_SETTINGS`,
  `SETTINGS_ID`, `SettingsState`.
- `src/lib/settings/queries.ts` — `getSettings()` (singleton, falls back to
  defaults), `getMinorAgeThreshold()`.
- `src/lib/settings/actions.ts` — `updateSettings` server action; super-admin
  gated, Zod-validated, audited (`platform_settings.update`).
- `src/components/settings/settings-form.tsx` — grouped form; read-only for
  reviewers (non-super-admins), editable for super admins.
- `src/app/admin/settings/page.tsx` — form + read-only **Integrations** panel
  (`transcriptionCapabilities()`, `insightsAiAvailable()`) and platform info
  (scoring model version).

## Access

`requireWorkspace("admin")` lets super admins and reviewers *view* the page;
only `ctx.isSuperAdmin` can save. The action re-checks on the server, so a
reviewer cannot write even by replaying the form.
