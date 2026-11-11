# 07 — Product language guardrails

_Source: blueprint Appendix B. These apply to UI copy, exports, emails, notifications and marketing._

The language the product uses must never overstate what TBA can guarantee. Scores are professional
opinions; verification is an internal evidence check; placement is never promised.

## Prefer / Avoid

| ✅ Prefer | ❌ Avoid |
| --- | --- |
| Assessed by TBA scout on \[date\] | TBA-certified world-class prospect |
| Identity evidence reviewed | FIFA verified player |
| Recruitment enquiry received | European contract secured |
| Potential fit for further evaluation | Guaranteed European placement |
| Assessment score / scout opinion | Objective talent score |
| Access granted to named recruiter until \[date\] | Public player database |

## UI implications baked into the scaffold

- **Status badges** (`src/components/ui/status-badge.tsx`) use plain-language states — Draft,
  Submitted, Under Review, Verified, Needs Evidence, Restricted, Archived. "Verified" is **not
  green** so it can never read as FIFA/transfer approval (§4 Status design).
- **Scorecard copy** (`src/components/scoring/scorecard-model-preview.tsx`) always frames the
  weighted score as a screening aid, shown with assessment date and assessor.
- **Recruiter discovery** copy states that access is controlled, consent-based, time-limited and
  logged — never an open database.

## Review rule

Any new user-facing string that implies certainty about a player's **eligibility, transferability,
placement or objective quality** must be rejected in code review. When in doubt, describe the
**evidence and the date**, not a guarantee.
