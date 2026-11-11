/** Shared option lists and helpers for the player registry (§5 M02, §8). */

export const POSITIONS = [
  "Goalkeeper",
  "Right Back",
  "Centre Back",
  "Left Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Second Striker",
  "Striker",
] as const;

export type Position = (typeof POSITIONS)[number];

/** Short position codes for player cards. */
export const POSITION_CODES: Record<string, string> = {
  Goalkeeper: "GK",
  "Right Back": "RB",
  "Centre Back": "CB",
  "Left Back": "LB",
  "Defensive Midfielder": "DM",
  "Central Midfielder": "CM",
  "Attacking Midfielder": "AM",
  "Right Winger": "RW",
  "Left Winger": "LW",
  "Second Striker": "SS",
  Striker: "ST",
};

export function positionCode(position: string | null | undefined): string {
  if (!position) return "—";
  return POSITION_CODES[position] ?? position.slice(0, 3).toUpperCase();
}

export const FEET = ["Right", "Left", "Both"] as const;

export const PROFILE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "active",
  "needs_evidence",
  "restricted",
  "archived",
] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

/** Age band labels derived from date of birth, for cards (never shows raw DOB). */
export function ageBandFromDob(dob: string | null | undefined): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
  if (age < 18) return "U18";
  if (age <= 20) return "18–20";
  if (age <= 23) return "19–23";
  return `${age}`;
}

/** Fields that count toward profile completeness (§4, §13 "profile completeness"). */
export const COMPLETENESS_FIELDS = [
  "display_name",
  "date_of_birth",
  "nationality",
  "primary_position",
  "dominant_foot",
  "height_cm",
  "location",
] as const;

export function computeCompleteness(player: Record<string, unknown>): number {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const v = player[f];
    return v !== null && v !== undefined && v !== "";
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

/** Consent types (§5 M03). */
export const CONSENT_TYPES = [
  { value: "data_processing", label: "Data processing" },
  { value: "media_use", label: "Media use (photo/video)" },
  { value: "external_share", label: "External profile sharing" },
  { value: "development_tracking", label: "Development tracking" },
] as const;

/** Parse a comma-separated input into a trimmed string array. */
export function parseList(input: FormDataEntryValue | null): string[] {
  if (!input) return [];
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
