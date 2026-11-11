/**
 * Weighted score calculation (§6 Weighted score calculation).
 *
 *   For each category: (rating ÷ 10) × category weight.
 *   Add all category contributions → score out of 100.
 *
 * Example (§6): Technical 8/10 at 20% → 16 points; Speed 7/10 at 15% → 10.5.
 */

import {
  CATEGORY_DEFINITIONS,
  DEFAULT_WEIGHTS,
  SCORECARD_CATEGORIES,
  type ScorecardCategory,
} from "./model";

export interface CategoryRating {
  category: ScorecardCategory;
  /** Integer 1–10. */
  rating: number;
  /** Weight in force when the rating was recorded (fraction of 1). */
  weightSnapshot: number;
}

export interface CategoryContribution {
  category: ScorecardCategory;
  rating: number;
  weight: number;
  /** points out of 100 contributed by this category. */
  contribution: number;
}

export interface WeightedScoreResult {
  /** Overall weighted score out of 100 (rounded to 1 dp). */
  total: number;
  contributions: CategoryContribution[];
  /** Sum of weights actually applied; 1 when every category is present. */
  weightCoverage: number;
  complete: boolean;
}

export class ScoringError extends Error {}

function assertValidRating(category: string, rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new ScoringError(
      `Rating for "${category}" must be an integer between 1 and 10 (got ${rating}).`,
    );
  }
}

/** Round to a fixed number of decimal places, avoiding float noise. */
function round(value: number, dp = 1): number {
  const factor = 10 ** dp;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Compute the weighted overall score from a set of category ratings.
 * Uses each rating's own weight snapshot so historical scores stay stable.
 */
export function calculateWeightedScore(ratings: CategoryRating[]): WeightedScoreResult {
  const seen = new Set<ScorecardCategory>();
  const contributions: CategoryContribution[] = [];
  let total = 0;
  let weightCoverage = 0;

  for (const r of ratings) {
    assertValidRating(r.category, r.rating);
    if (seen.has(r.category)) {
      throw new ScoringError(`Duplicate rating for category "${r.category}".`);
    }
    seen.add(r.category);

    const contribution = (r.rating / 10) * r.weightSnapshot * 100;
    total += contribution;
    weightCoverage += r.weightSnapshot;
    contributions.push({
      category: r.category,
      rating: r.rating,
      weight: r.weightSnapshot,
      contribution: round(contribution, 2),
    });
  }

  return {
    total: round(total, 1),
    contributions,
    weightCoverage: round(weightCoverage, 3),
    complete: SCORECARD_CATEGORIES.every((c) => seen.has(c)),
  };
}

/**
 * Build the rating rows to persist for a new report, snapshotting the current
 * default weights. `ratings` maps category → 1–10 value.
 */
export function buildRatingSnapshots(
  ratings: Partial<Record<ScorecardCategory, number>>,
): CategoryRating[] {
  const rows: CategoryRating[] = [];
  for (const category of SCORECARD_CATEGORIES) {
    const rating = ratings[category];
    if (rating === undefined) continue;
    assertValidRating(category, rating);
    rows.push({ category, rating, weightSnapshot: DEFAULT_WEIGHTS[category] });
  }
  return rows;
}

/** Sanity check: the default model weights must sum to exactly 1 (100%). */
export function defaultWeightsSumToOne(): boolean {
  const sum = SCORECARD_CATEGORIES.reduce((acc, c) => acc + CATEGORY_DEFINITIONS[c].weight, 0);
  return round(sum, 5) === 1;
}
