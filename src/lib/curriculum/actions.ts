"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import type { AgeBand, CurriculumFormState } from "./types";

const BANDS: AgeBand[] = ["u6_9", "u10_12", "u13_15", "u16_18", "u19_23"];

function clean(v: FormDataEntryValue | null): string | null {
  const s = (v as string)?.trim();
  return s ? s : null;
}

/** Add a curriculum module to an academy's age-band pathway (§5A). */
export async function addCurriculumModule(
  academyId: string,
  _prev: CurriculumFormState,
  formData: FormData,
): Promise<CurriculumFormState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in." };

  const title = clean(formData.get("title"));
  if (!title) return { error: "Give the module a title." };
  const ageBand = String(formData.get("ageBand") ?? "");
  if (!BANDS.includes(ageBand as AgeBand)) return { error: "Choose an age band." };

  const position = Number(formData.get("position") ?? "");
  const supabase = createClient();
  const { error } = await supabase.from("curriculum_modules").insert({
    academy_id: academyId,
    age_band: ageBand as AgeBand,
    title,
    focus: clean(formData.get("focus")),
    detail: clean(formData.get("detail")),
    video_url: clean(formData.get("videoUrl")),
    position: Number.isInteger(position) ? position : 0,
    created_by: ctx.userId,
  });
  if (error) {
    return { error: "Could not add the module. Check your permission for this academy." };
  }
  await logAudit("curriculum.add", "academy", academyId, { title, ageBand });
  revalidatePath("/academy/development");
  return { message: "Module added." };
}

/** Remove a curriculum module. */
export async function deleteCurriculumModule(academyId: string, moduleId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("curriculum_modules").delete().eq("id", moduleId);
  await logAudit("curriculum.delete", "academy", academyId, { moduleId });
  revalidatePath("/academy/development");
}
