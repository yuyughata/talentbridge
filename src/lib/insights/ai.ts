import "server-only";
import type { CohortInsights } from "./trends";

/** AI insights are available only when an Anthropic key is configured. */
export function insightsAiAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM =
  "You are a football talent-development analyst for Talent Bridge Africa. You interpret " +
  "ALREADY-COMPUTED, aggregated metrics. Ground every statement strictly in the numbers " +
  "provided — never invent players, scores, academies or facts that are not in the data. " +
  "Weighted scores are 0–100 screening aids read with age, level and context — never a FIFA " +
  "rating or a verdict, and never a medical judgement. Be concise and plain.";

function userPrompt(data: CohortInsights): string {
  return (
    "Analyse this cohort of players and produce:\n" +
    "1) A one-sentence headline.\n" +
    "2) Trends — 2 to 4 bullets.\n" +
    "3) Players to watch — name the biggest improvers and any decliners with their point deltas.\n" +
    "4) Attribute strengths and gaps across the cohort.\n" +
    "5) Recommended actions — 2 to 3 practical, development-first suggestions.\n" +
    'Use "- " for bullet lines and short "## " headings for sections. Only use the data below.\n\n' +
    "DATA (JSON):\n" +
    JSON.stringify(data)
  );
}

/** Generate a grounded narrative analysis from computed cohort insights. */
export async function generateCohortAnalysis(data: CohortInsights): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("not_configured");
  if (data.assessedCount === 0) {
    return "No assessed players yet — once scouting reports are filed, AI analysis will summarise trends and growth here.";
  }
  const model =
    process.env.ANTHROPIC_INSIGHTS_MODEL ||
    process.env.ANTHROPIC_TRANSCRIBE_MODEL ||
    "claude-haiku-5-5";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt(data) }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic_${res.status}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (json.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
}
