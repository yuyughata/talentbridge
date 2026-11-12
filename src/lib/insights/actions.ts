"use server";

import { cohortInsights } from "./trends";
import { generateCohortAnalysis } from "./ai";
import type { InsightsState } from "./types";

/** Generate the AI cohort analysis (admin scope). RLS-scoped to the caller. */
export async function analyzeCohort(
  _prev: InsightsState,
  formData: FormData,
): Promise<InsightsState> {
  const academyId = (formData.get("academyId") as string) || undefined;
  try {
    const data = await cohortInsights(academyId ? { academyId } : {});
    const text = await generateCohortAnalysis(data);
    return { text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "not_configured") return { error: "AI analysis is not configured." };
    return { error: "Could not generate the analysis. Please try again." };
  }
}
