/**
 * Illustrative sample data for scaffolded screens ONLY. Not real players.
 * Replace with live Supabase queries during MVP engineering. Values are shaped
 * to the data model (position codes, age bands, verification states).
 */
import type { PlayerCardData } from "@/components/player/player-card";
import type { RadarAxis } from "@/components/scoring/radar-chart";

/**
 * Abstract silhouette avatar as an inline SVG data URI — NOT a real person's
 * photo (the blueprint avoids generic stock imagery, §4). Real deployments store
 * permission-cleared portraits; these only demonstrate the portrait render path.
 */
function avatar(bg: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${bg}'/><stop offset='1' stop-color='#0A1D30'/></linearGradient></defs><rect width='100' height='100' fill='url(#g)'/><circle cx='50' cy='40' r='17' fill='#fff' opacity='0.92'/><path d='M22 92c0-16 12-27 28-27s28 11 28 27z' fill='#fff' opacity='0.92'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const DEMO_PLAYERS: PlayerCardData[] = [
  {
    name: "Amara Okonkwo",
    ageBand: "19–23",
    position: "Central Midfielder",
    positionCode: "CM",
    foot: "Right",
    academy: "Abuja City FA",
    location: "Abuja, NG",
    lastAssessed: "12 Oct 2026",
    verification: "verified",
    portrait: avatar("#167D8D"),
    score: 78,
    observations: 4,
  },
  {
    name: "Ibrahim Sule",
    ageBand: "18–20",
    position: "Right Winger",
    positionCode: "RW",
    foot: "Left",
    academy: "Kano Elite",
    location: "Kano, NG",
    lastAssessed: "03 Nov 2026",
    verification: "under_review",
    portrait: avatar("#243B53"),
    score: 71,
    observations: 2,
  },
  {
    name: "Chidi Eze",
    ageBand: "18–20",
    position: "Centre Back",
    positionCode: "CB",
    foot: "Right",
    academy: "Enugu Rangers Dev",
    location: "Enugu, NG",
    lastAssessed: "28 Oct 2026",
    verification: "needs_evidence",
    portrait: avatar("#1B3350"),
    score: 66,
    observations: 1,
  },
];

export const DEMO_RADAR: RadarAxis[] = [
  { label: "Technical", short: "TEC", value: 8 },
  { label: "Tactical", short: "TAC", value: 7 },
  { label: "Physical", short: "PHY", value: 6 },
  { label: "Speed", short: "SPD", value: 8 },
  { label: "Decision", short: "DEC", value: 7 },
  { label: "Mental", short: "MEN", value: 7 },
  { label: "Consistency", short: "CON", value: 6 },
];
