/**
 * Illustrative sample data for scaffolded screens ONLY. Not real players.
 * Replace with live Supabase queries during MVP engineering. Values are shaped
 * to the data model (position codes, age bands, verification states).
 */
import type { PlayerCardData } from "@/components/player/player-card";
import type { RadarAxis } from "@/components/scoring/radar-chart";

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
