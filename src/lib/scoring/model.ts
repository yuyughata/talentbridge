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

/**
 * Position-specific overlay attributes (§6 Position-specific overlays).
 *
 * These sit ALONGSIDE the seven weighted categories and do NOT change the 0–100
 * weighted score — they capture the signal that differs by position. They matter
 * most for goalkeepers, whose game is assessed on a fundamentally different set
 * of parameters from outfield players (shot-stopping, handling, command of the
 * area, distribution) rather than on dribbling, finishing or raw sprinting.
 */
export interface OverlayAttribute {
  key: string;
  label: string;
  description: string;
}

export interface OverlayGroup {
  key: string;
  label: string;
  /** How to read the core seven categories for this position. */
  note: string;
  attributes: OverlayAttribute[];
}

export const OVERLAY_GROUPS = {
  goalkeeper: {
    key: "goalkeeper",
    label: "Goalkeeper",
    note: "Goalkeepers are assessed on a distinct parameter set. The seven core categories still apply — read 'Technical' as handling and footwork, and 'Speed' as reactions and recovery off the line — but these overlay parameters carry the real goalkeeping signal.",
    attributes: [
      {
        key: "shot_stopping",
        label: "Shot-stopping & reflexes",
        description:
          "Reaction saves, shot anticipation, set/strong hands, saves from distance, deflections and rebounds.",
      },
      {
        key: "handling",
        label: "Handling & catching",
        description:
          "Secure catching and parrying under pressure, high and low balls, wet-ball control, rebound management.",
      },
      {
        key: "aerial_command",
        label: "Command of area (crosses)",
        description:
          "Judging flight, claiming crosses and set pieces, punch-vs-catch decisions, dominating the six-yard box.",
      },
      {
        key: "one_v_one",
        label: "1v1 & shot blocking",
        description:
          "Narrowing the angle, timing of the spread, blocking in breakaways, staying big and patient.",
      },
      {
        key: "positioning",
        label: "Positioning & sweeping",
        description:
          "Starting position relative to ball and goal, depth off the line, sweeping behind a high line, angles.",
      },
      {
        key: "distribution_feet",
        label: "Distribution — feet",
        description:
          "Build-up under pressure, range and accuracy of kicking, playing through a press, decision speed.",
      },
      {
        key: "distribution_hands",
        label: "Distribution — hands",
        description:
          "Throw and rollout accuracy and range, launching transitions, choosing the right outlet.",
      },
      {
        key: "communication",
        label: "Communication & organisation",
        description:
          "Organising the back line and set-piece marking, timely commands, leadership and composure.",
      },
    ],
  },
  defender: {
    key: "defender",
    label: "Defender",
    note: "Outfield defensive overlay — read alongside the seven core categories.",
    attributes: [
      { key: "one_v_one_defending", label: "1v1 defending", description: "Containing, jockeying and winning the ball cleanly in isolation." },
      { key: "aerial_ability", label: "Aerial ability", description: "Duels, timing and dominance in defensive and attacking set pieces." },
      { key: "recovery_runs", label: "Recovery runs", description: "Tracking back, covering space and recovery pace under threat." },
      { key: "line_management", label: "Line management", description: "Holding the line, stepping, offside discipline and compactness." },
      { key: "defensive_timing", label: "Defensive timing", description: "Tackle and interception timing, reading the next pass." },
      { key: "build_up_passing", label: "Build-up passing", description: "Composure and range playing out from the back under pressure." },
    ],
  },
  midfielder: {
    key: "midfielder",
    label: "Midfielder",
    note: "Central midfield overlay — read alongside the seven core categories.",
    attributes: [
      { key: "scanning", label: "Scanning", description: "Pre-reception checks, picture-building and awareness of pressure." },
      { key: "receiving_orientation", label: "Receiving orientation", description: "Body shape on receiving, opening out and first-touch direction." },
      { key: "press_resistance", label: "Press resistance", description: "Keeping the ball and finding solutions under tight pressure." },
      { key: "progression", label: "Progression", description: "Breaking lines by pass or carry, advancing play with purpose." },
      { key: "tempo_control", label: "Tempo control", description: "Setting and changing rhythm, when to accelerate or hold." },
      { key: "defensive_coverage", label: "Defensive coverage", description: "Screening, counter-pressing and covering for teammates." },
    ],
  },
  winger: {
    key: "winger",
    label: "Winger / wide attacker",
    note: "Wide attacking overlay — read alongside the seven core categories.",
    attributes: [
      { key: "one_v_one_threat", label: "1v1 threat", description: "Beating a full-back, change of pace and direction in isolation." },
      { key: "chance_creation", label: "Chance creation", description: "Final-ball quality and assists from wide areas." },
      { key: "movement_between_lines", label: "Movement between lines", description: "Finding pockets, inside runs and off-ball timing." },
      { key: "crossing_cutbacks", label: "Crossing & cutbacks", description: "Delivery variety, cutbacks and early balls under pressure." },
      { key: "transition_decisions", label: "Transition decisions", description: "Decision quality in attacking and defensive transitions." },
    ],
  },
  striker: {
    key: "striker",
    label: "Striker / centre-forward",
    note: "Centre-forward overlay — read alongside the seven core categories.",
    attributes: [
      { key: "movement", label: "Movement", description: "Runs in behind, timing and variety of off-ball movement." },
      { key: "separation", label: "Separation", description: "Creating a yard from markers in the box and build-up." },
      { key: "finishing_variety", label: "Finishing variety", description: "Range of finishes under pressure, both feet and head." },
      { key: "link_play", label: "Link play", description: "Hold-up, lay-offs and combining to bring others in." },
      { key: "pressing", label: "Pressing", description: "Leading the press, cutting passing lanes and setting traps." },
      { key: "box_positioning", label: "Box positioning", description: "Attacking the right spaces to meet deliveries." },
    ],
  },
} as const satisfies Record<string, OverlayGroup>;

export type OverlayGroupKey = keyof typeof OVERLAY_GROUPS;

/**
 * Resolve a player's primary position (free text like "Goalkeeper", "Centre
 * Back", "Second Striker") to the overlay group whose parameters should be
 * assessed. Goalkeepers get their own parameter set; everything else maps to the
 * nearest outfield group, defaulting to midfield.
 */
export function positionOverlayGroup(position: string | null | undefined): OverlayGroup {
  const p = (position ?? "").toLowerCase();
  if (p.includes("keeper") || p === "gk") return OVERLAY_GROUPS.goalkeeper;
  if (p.includes("wing")) return OVERLAY_GROUPS.winger;
  if (p.includes("strik") || p.includes("forward")) return OVERLAY_GROUPS.striker;
  if (p.includes("back") || p.includes("defen")) return OVERLAY_GROUPS.defender;
  return OVERLAY_GROUPS.midfielder;
}
