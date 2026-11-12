# 09 — Authentication & invitation onboarding

_Source: blueprint §5 M01, §9 (player onboarding), §15 (invite-only external access).
Implemented across `src/lib/auth`, `src/app/(auth pages)`, `src/middleware.ts` and
`supabase/migrations/0011_auth_and_invitations.sql`._

## Overview

- **Auth provider:** Supabase Auth (email + password). Sessions are cookie-based via
  `@supabase/ssr`; `src/middleware.ts` refreshes the session on every request.
- **Profile bootstrap:** a `handle_new_user` trigger on `auth.users` automatically creates
  the matching `public.users` row (id, email, display name) on sign-up.
- **Route protection:** middleware gates `/player`, `/scout`, `/academy`, `/recruiter`,
  `/admin` — unauthenticated requests redirect to `/login?next=…`. Fine-grained role access
  is enforced in each workspace via `requireWorkspace()`, and ultimately by RLS (§7).
- **Onboarding is invite-first (§15):** staff and organisation members create invitations;
  invitees accept via a tokenised link. Players may also self-register.

## Pages

| Route | Purpose |
| --- | --- |
| `/login` | Email + password sign in |
| `/signup` | Self-service account creation (players / access requests) |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password (recovery session) |
| `/accept-invite?token=…` | Accept an invitation and create an account |
| `/auth/callback` | Exchanges email-confirmation / recovery codes for a session |

All auth screens use the premium split-screen `AuthShell` (pitch motif + form panel).

## Server actions (`src/lib/auth`)

| Action | File | Notes |
| --- | --- | --- |
| `signIn`, `signUp`, `signOut` | `actions.ts` | Standard Supabase Auth; redirect to the user's primary workspace |
| `requestPasswordReset`, `updatePassword` | `actions.ts` | Reset email + recovery update; no account enumeration |
| `createInvitation` | `invitations.ts` | Runs as the inviter; RLS requires TBA staff or target-org membership; returns a shareable link |
| `previewInvitation`, `acceptInvitation` | `invitations.ts` | **Trusted operations (service role, §7)** — see below |
| `revokeInvitation` | `invitations.ts` | Inviter / staff / org member (RLS) |
| `getUserContext`, `requireUser`, `requireWorkspace` | `session.ts` | Resolve roles and gate pages |

### Role resolution (`getUserContext`)

A user's roles are derived from: `users.is_super_admin` → `super_admin`; active
`organisation_members.role` rows; a linked `players` row → `player`; a linked
`player_guardians` row → `guardian`. `primaryWorkspace()` picks the landing workspace for
multi-role users.

## Invitation flow

```
Staff/academy  ──createInvitation──►  invitations row (token, role, org, 14-day expiry)
                                      returns /accept-invite?token=…  (share with invitee)
Invitee opens link ──previewInvitation──►  shows role + organisation
          submits name + password ──acceptInvitation──►
              creates confirmed auth user (admin.createUser)
              grants the role:
                super_admin → users.is_super_admin = true
                player      → players row (linked to academy if provided)
                org roles   → organisation_members row
              marks invite accepted, signs the user in → workspace
```

Invited users are created **email-confirmed** (they proved ownership via the invite link),
so they skip the confirmation email.

## Configuration requirements

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for all auth.
- `NEXT_PUBLIC_SITE_URL` — used for email redirect links.
- **`SUPABASE_SERVICE_ROLE_KEY` — required for `previewInvitation` / `acceptInvitation`**
  (trusted server operations that bypass RLS, §7). Without it the accept-invite page shows an
  "unavailable" message; sign-in, sign-up and invitation *creation* still work. Set it from
  Supabase → Project Settings → API Keys. **Server-only — never expose it to the browser.**
- In Supabase Auth settings, configure the **Site URL** and redirect URLs, and connect an
  SMTP/transactional email provider so confirmation and reset emails are delivered (§7).

## Bootstrapping the first admin

There is no admin until one exists. For the first `super_admin`, either:

1. Sign up normally, then run once against the project:
   `update public.users set is_super_admin = true where email = 'you@tba.africa';`
2. Or set it via the Supabase dashboard. Thereafter, that admin invites everyone else from
   **TBA operations → Users & Roles**.

## Testing note (cloud dev environment)

This repo's cloud session can reach the Supabase **Management API** (migrations, SQL) but not
the project's runtime `*.supabase.co` auth/data endpoint, so the live auth round-trip can't be
exercised from here — it works when the app runs locally or on Vercel. Verified in-session:
the auth UI, middleware redirects, the `handle_new_user` trigger (DB-level), build, typecheck,
lint and unit tests. The per-role RLS integration suite (§12) remains the pre-pilot task.
