import "server-only";
import { createClient } from "@/lib/supabase/server";
import { AGE_BANDS, type AgeBand, type CurriculumModule } from "./types";

/** Curriculum modules for an academy (RLS-scoped), ordered by band then position. */
export async function listCurriculumModules(academyId: string): Promise<CurriculumModule[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("curriculum_modules")
    .select("id, academy_id, age_band, title, focus, detail, video_url, position")
    .eq("academy_id", academyId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return (data as CurriculumModule[] | null) ?? [];
}

/** Group modules by age band in canonical band order. */
export function groupByBand(
  modules: CurriculumModule[],
): { band: AgeBand; label: string; modules: CurriculumModule[] }[] {
  return AGE_BANDS.map((b) => ({
    band: b.value,
    label: b.label,
    modules: modules.filter((m) => m.age_band === b.value),
  }));
}
