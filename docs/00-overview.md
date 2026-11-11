# 00 — Overview & product boundaries

_Source: blueprint §1 Executive product definition, §2 Product boundaries._

## What TBA is

Talent Bridge Africa (TBA) is a football **talent intelligence and development** platform. It gives
the organisation, partner academies and authorised scouts a consistent way to:

- identify players,
- capture evidence,
- assess performance,
- track development, and
- prepare credible player portfolios for clubs and properly authorised recruitment partners.

## Primary users (§1)

| User type | Main need | Platform capability |
| --- | --- | --- |
| Player | Create a credible profile and understand development priorities | Profile, consent, media portfolio, development plan |
| Parent / guardian | Safeguard and authorise participation where required | Guardian-linked consent and controlled access |
| Scout | Record repeatable, evidence-based observations | Fixtures, scouting reports, scorecards, video timestamps |
| Academy / coach | Manage player records and development | Academy workspace, squad list, attendance, development plans |
| TBA technical team | Quality-control assessments and shortlist talent | Review queue, verification, moderation, comparison |
| Club / authorised recruiter | Find relevant, well-documented players | Restricted search, shortlist, enquiry and portfolio export |
| Platform administrator | Control access, compliance and operations | Roles, audit logs, approvals, reporting and configuration |

## Product outcomes (§1)

1. Reliable player identity, age and playing-history records with verification status.
2. Consistent scouting reports that distinguish observed evidence from opinion.
3. Player development tracked over time rather than relying on one-off ratings.
4. Controlled, consent-based sharing of player profiles and media.
5. Recruitment workflows that **support — not replace** — licensed agents, clubs and federation
   processes.

## Operating rules / boundaries (§2)

- **Initial cohort:** adult players aged **18–23** for international recruitment workflows. Younger
  players may be supported for **local development only**, with safeguarding, guardian consent and
  legal review.
- Do **not** publish passport scans, birth certificates, medical records, private contact details
  or contract documents in public profiles.
- Do **not** claim a player is verified, eligible, available or transferable unless the relevant
  evidence has been checked and the status is explicit.
- Do **not** sell guaranteed trials, contracts, visas or transfers. Regulated representation and
  agent services must be handled by appropriately licensed individuals.
- Scouting scores are **structured professional opinions**, not objective truth, FIFA ratings or
  guarantees of future performance.
- Every player-facing media upload and external profile share must have a recorded **lawful basis
  and appropriate consent**.

## Decisions locked before development (§15)

| Decision | Default |
| --- | --- |
| Initial player cohort | Adults aged 18–23 for international recruitment |
| Initial pilot geography | Abuja-based operations with partner academies/scouts in selected Nigerian cities |
| External access | Invite-only, organisation-verified and time-limited |
| Scoring model | Seven weighted categories; Speed is 15%; keep evidence + confidence fields |
| Player visibility | Private by default; consent-based sharing |
| Technology | Next.js + TypeScript + Supabase + Vercel; dedicated video provider |
| Commercial model | Academy tools, scouting assignments and recruitment intelligence; no dependence on transfer commissions |
| AI | Deferred until a sufficient, consented, quality-controlled dataset and clear use case exist |

## Information architecture (§3)

| Workspace | Primary navigation | Route group |
| --- | --- | --- |
| Public website | Home · About · For Players · For Academies · For Clubs · Contact | `/`, `/about` |
| Player portal | Overview · My Profile · Videos · Assessments · Development Plan · Consent & Privacy | `/player` |
| Scout workspace | Dashboard · Assignments · Players · Match Reports · Scorecards · Submissions | `/scout` |
| Academy workspace | Overview · Squad · Player Development · Attendance · Reports · Invitations | `/academy` |
| Recruiter workspace | Discover · Filters · Shortlists · Player Portfolios · Enquiries | `/recruiter` |
| TBA operations | Command Centre · Verification · Review Queue · Talent Pool · Partnerships · Users & Roles · Audit · Settings | `/admin` |

Navigation is defined in `src/lib/navigation.ts`.
