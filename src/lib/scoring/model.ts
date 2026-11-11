/**
 * TBA scouting scorecard model — seven weighted categories including Speed.
 * Source of truth: blueprint §6 "Player scouting scorecard — revised model
 * including SPEED".
 *
 * Guardrails (§6 Scoring safeguards, Appendix B):
 *  - A weighted score is a SCREENING AID, not objective truth or a FIFA rating.
 *  - Ratings are structured professional opinions and must be read alongside
 *    position, competition level, age, match context and number of observations.
 *  - Do not treat a low-confidence report as a final recommendation.
 */

export const SCORECARD_CATEGORIES = [
  "technical",
  "tactical",
  "physical",
  "speed",
  "decision_making",
  "mental",
  "consistency",
] as const;

export type ScorecardCategory = (typeof SCORECARD_CATEGORIES)[number];

export interface CategoryDefinition {
  key: ScorecardCategory;
  label: string;
  /** Weight as a fraction of 1 (e.g. 0.2 = 20%). Sums to 1 across all categories. */
  weight: number;
  description: string;
}

/**
 * Current weighting model (§6). Speed is a distinct category at 15%.
 * These weights are the DEFAULT. Each saved rating stores a `weight_snapshot`
 * so historical scores remain interpretable if this model later changes (§8).
 */
export const SCORING_MODEL_VERSION = "1.1";

export const CATEGORY_DEFINITIONS: Record<ScorecardCategory, CategoryDefinition> = {
  technical: {
    key: "technical",
    label: "Technical",
    weight: 0.2,
    description:
      "First touch, passing, receiving under pressure, ball carrying, dribbling, finishing or position-specific technique.",
  },
  tactical: {
    key: "tactical",
    label: "Tactical",
    weight: 0.15,
    description:
      "Positioning, scanning, movement, understanding of role, pressing, defensive/offensive decisions and game awareness.",
  },
  physical: {
    key: "physical",
    label: "Physical — strength & endurance",
    weight: 0.15,
    description:
      "Strength in duels, balance, mobility, stamina, repeat-effort capacity and robustness in match context.",
  },
  speed: {
    key: "speed",
    label: "Speed",
    weight: 0.15,
    description:
      "Acceleration over first steps, ability to reach high speed, recovery speed, repeated sprint capacity and speed while carrying/contesting the ball.",
  },
  decision_making: {
    key: "decision_making",
    label: "Decision-making",
    weight: 0.15,
    description:
      "Choice quality, speed of decision, risk management, awareness of options and execution under pressure.",
  },
  mental: {
    key: "mental",
    label: "Mental & behavioural",
    weight: 0.1,
    description:
      "Composure, resilience, concentration, coachability, discipline, communication and response to setbacks.",
  },
  consistency: {
    key: "consistency",
    label: "Consistency & impact",
    weight: 0.1,
    description:
      "Repeatability across the match, influence on team performance, execution across phases and reliability across multiple observations.",
  },
};

/** Default weight lookup used when creating a new report's rating snapshots. */
export const DEFAULT_WEIGHTS: Record<ScorecardCategory, number> = Object.fromEntries(
  SCORECARD_CATEGORIES.map((c) => [c, CATEGORY_DEFINITIONS[c].weight]),
) as Record<ScorecardCategory, number>;

/** Speed sub-dimensions (§6 Speed assessment sub-score). */
export const SPEED_SUBSCORES = [
  { key: "acceleration", label: "Acceleration" },
  { key: "top_speed", label: "Top speed" },
  { key: "repeated_sprint", label: "Repeated sprint ability" },
  { key: "football_speed", label: "Football speed" },
] as const;

export type SpeedSubscoreKey = (typeof SPEED_SUBSCORES)[number]["key"];

/** 1–10 rating scale descriptors (§6 Rating scale). */
export const RATING_SCALE: { min: number; max: number; descriptor: string }[] = [
  { min: 1, max: 2, descriptor: "Major development need" },
  { min: 3, max: 4, descriptor: "Below current level" },
  { min: 5, max: 6, descriptor: "Functional / average" },
  { min: 7, max: 8, descriptor: "Strong" },
  { min: 9, max: 9, descriptor: "Outstanding" },
  { min: 10, max: 10, descriptor: "Exceptional / rare" },
];

export function ratingDescriptor(rating: number): string {
  const band = RATING_SCALE.find((b) => rating >= b.min && rating <= b.max);
  return band?.descriptor ?? "Unrated";
}

/** Position-specific overlay attributes (§6 Position-specific overlays). */
export const POSITION_OVERLAYS: Record<string, string[]> = {
  goalkeeper: [
    "Shot-stopping",
    "Handling",
    "Command of area",
    "Distribution",
    "Starting position",
    "Communication",
  ],
  defender: [
    "1v1 defending",
    "Aerial ability",
    "Recovery runs",
    "Line management",
    "Defensive timing",
    "Build-up passing",
  ],
  midfielder: [
    "Scanning",
    "Receiving orientation",
    "Press resistance",
    "Progression",
    "Tempo control",
    "Defensive coverage",
  ],
  winger: [
    "1v1 threat",
    "Chance creation",
    "Movement between lines",
    "Crossing/cutbacks",
    "Transition decisions",
  ],
  striker: [
    "Movement",
    "Separation",
    "Finishing variety",
    "Link play",
    "Pressing",
    "Box positioning",
  ],
};
