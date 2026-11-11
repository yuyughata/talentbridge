import { describe, expect, it } from "vitest";
import { CATEGORY_DEFINITIONS, DEFAULT_WEIGHTS, SCORECARD_CATEGORIES } from "./model";
import {
  ScoringError,
  buildRatingSnapshots,
  calculateWeightedScore,
  defaultWeightsSumToOne,
  type CategoryRating,
} from "./calculate";

describe("scoring model weights", () => {
  it("default weights sum to exactly 1 (100%)", () => {
    expect(defaultWeightsSumToOne()).toBe(true);
  });

  it("speed is a distinct category weighted at 15% (§6)", () => {
    expect(CATEGORY_DEFINITIONS.speed.weight).toBe(0.15);
    expect(SCORECARD_CATEGORIES).toContain("speed");
  });

  it("has exactly seven categories", () => {
    expect(SCORECARD_CATEGORIES).toHaveLength(7);
  });
});

describe("calculateWeightedScore", () => {
  it("matches the worked example from §6 (Technical 8@20% -> 16, Speed 7@15% -> 10.5)", () => {
    const ratings: CategoryRating[] = [
      { category: "technical", rating: 8, weightSnapshot: 0.2 },
      { category: "speed", rating: 7, weightSnapshot: 0.15 },
    ];
    const result = calculateWeightedScore(ratings);
    const technical = result.contributions.find((c) => c.category === "technical");
    const speed = result.contributions.find((c) => c.category === "speed");
    expect(technical?.contribution).toBe(16);
    expect(speed?.contribution).toBe(10.5);
    expect(result.total).toBe(26.5);
    expect(result.complete).toBe(false);
  });

  it("a perfect 10 across all seven categories scores 100", () => {
    const ratings = buildRatingSnapshots(
      Object.fromEntries(SCORECARD_CATEGORIES.map((c) => [c, 10])),
    );
    const result = calculateWeightedScore(ratings);
    expect(result.total).toBe(100);
    expect(result.complete).toBe(true);
    expect(result.weightCoverage).toBe(1);
  });

  it("a flat 5 across all categories scores 50", () => {
    const ratings = buildRatingSnapshots(
      Object.fromEntries(SCORECARD_CATEGORIES.map((c) => [c, 5])),
    );
    expect(calculateWeightedScore(ratings).total).toBe(50);
  });

  it("uses the stored weight snapshot, not the current default", () => {
    // Historical report scored under an old model where Speed was 0.30.
    const ratings: CategoryRating[] = [{ category: "speed", rating: 10, weightSnapshot: 0.3 }];
    expect(calculateWeightedScore(ratings).total).toBe(30);
  });

  it("rejects out-of-range ratings", () => {
    expect(() =>
      calculateWeightedScore([{ category: "technical", rating: 11, weightSnapshot: 0.2 }]),
    ).toThrow(ScoringError);
    expect(() =>
      calculateWeightedScore([{ category: "technical", rating: 0, weightSnapshot: 0.2 }]),
    ).toThrow(ScoringError);
  });

  it("rejects non-integer ratings", () => {
    expect(() =>
      calculateWeightedScore([{ category: "technical", rating: 7.5, weightSnapshot: 0.2 }]),
    ).toThrow(ScoringError);
  });

  it("rejects duplicate categories", () => {
    expect(() =>
      calculateWeightedScore([
        { category: "technical", rating: 7, weightSnapshot: 0.2 },
        { category: "technical", rating: 8, weightSnapshot: 0.2 },
      ]),
    ).toThrow(ScoringError);
  });
});

describe("buildRatingSnapshots", () => {
  it("snapshots the current default weight for each provided category", () => {
    const rows = buildRatingSnapshots({ technical: 8, speed: 6 });
    expect(rows).toHaveLength(2);
    const speed = rows.find((r) => r.category === "speed");
    expect(speed?.weightSnapshot).toBe(DEFAULT_WEIGHTS.speed);
  });

  it("skips categories that were not rated", () => {
    const rows = buildRatingSnapshots({ technical: 8 });
    expect(rows).toHaveLength(1);
  });
});
