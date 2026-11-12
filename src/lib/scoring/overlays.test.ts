import { describe, expect, it } from "vitest";
import { OVERLAY_GROUPS, positionOverlayGroup } from "./model";

describe("positionOverlayGroup", () => {
  it("maps goalkeeper positions to the goalkeeper overlay", () => {
    expect(positionOverlayGroup("Goalkeeper").key).toBe("goalkeeper");
    expect(positionOverlayGroup("GK").key).toBe("goalkeeper");
    expect(positionOverlayGroup("goal keeper").key).toBe("goalkeeper");
  });

  it("maps outfield positions to their groups", () => {
    expect(positionOverlayGroup("Centre Back").key).toBe("defender");
    expect(positionOverlayGroup("Right Back").key).toBe("defender");
    expect(positionOverlayGroup("Left Winger").key).toBe("winger");
    expect(positionOverlayGroup("Striker").key).toBe("striker");
    expect(positionOverlayGroup("Second Striker").key).toBe("striker");
    expect(positionOverlayGroup("Central Midfielder").key).toBe("midfielder");
  });

  it("defaults unknown or empty positions to midfield", () => {
    expect(positionOverlayGroup(null).key).toBe("midfielder");
    expect(positionOverlayGroup("").key).toBe("midfielder");
    expect(positionOverlayGroup("Utility").key).toBe("midfielder");
  });

  it("gives goalkeepers a distinct parameter set from outfield players", () => {
    const gk = OVERLAY_GROUPS.goalkeeper.attributes.map((a) => a.key as string);
    const striker = OVERLAY_GROUPS.striker.attributes.map((a) => a.key as string);
    expect(gk).toContain("shot_stopping");
    expect(gk).toContain("handling");
    expect(gk).toContain("distribution_feet");
    // No overlap between the goalkeeping and striker parameter sets.
    expect(gk.some((k) => striker.includes(k))).toBe(false);
  });

  it("every overlay attribute has a unique key within its group", () => {
    for (const group of Object.values(OVERLAY_GROUPS)) {
      const keys = group.attributes.map((a) => a.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
