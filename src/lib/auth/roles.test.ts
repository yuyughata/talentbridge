import { describe, expect, it } from "vitest";
import { hasPermission, primaryWorkspace, ROLE_PERMISSIONS } from "./roles";

describe("role permissions", () => {
  it("recruiters cannot view sensitive player data or welfare notes (§5A I)", () => {
    expect(hasPermission(["recruiter"], "player.view_sensitive")).toBe(false);
    expect(hasPermission(["recruiter"], "welfare.view")).toBe(false);
    expect(hasPermission(["recruiter"], "verification.manage")).toBe(false);
  });

  it("scouts can create but not review reports (§9 scout-to-review)", () => {
    expect(hasPermission(["scout"], "scouting.report.create")).toBe(true);
    expect(hasPermission(["scout"], "scouting.report.review")).toBe(false);
  });

  it("only TBA reviewers / admins can review reports and manage verification", () => {
    expect(hasPermission(["tba_reviewer"], "scouting.report.review")).toBe(true);
    expect(hasPermission(["tba_reviewer"], "verification.manage")).toBe(true);
  });

  it("super_admin holds every permission", () => {
    expect(hasPermission(["super_admin"], "admin.settings")).toBe(true);
    expect(hasPermission(["super_admin"], "welfare.view")).toBe(true);
  });

  it("academy staff manage development and welfare but cannot decide recruiter access", () => {
    expect(hasPermission(["academy_staff"], "development.manage")).toBe(true);
    expect(hasPermission(["academy_staff"], "welfare.view")).toBe(true);
    expect(hasPermission(["academy_staff"], "recruiter.decide_access")).toBe(false);
  });

  it("combines permissions across multiple roles", () => {
    expect(hasPermission(["player", "scout"], "scouting.report.create")).toBe(true);
  });
});

describe("primaryWorkspace", () => {
  it("routes a multi-role user to the highest-priority workspace", () => {
    expect(primaryWorkspace(["player", "academy_staff"])).toBe("/academy");
    expect(primaryWorkspace(["recruiter"])).toBe("/recruiter");
    expect(primaryWorkspace(["super_admin", "scout"])).toBe("/admin");
  });

  it("defaults to the player workspace", () => {
    expect(primaryWorkspace([])).toBe("/player");
  });
});

describe("permission matrix integrity", () => {
  it("every role has a defined grant list", () => {
    for (const grants of Object.values(ROLE_PERMISSIONS)) {
      expect(Array.isArray(grants)).toBe(true);
    }
  });
});
