"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { SETTINGS_ID } from "./types";
import type { SettingsState } from "./types";

const schema = z.object({
  platform_name: z.string().trim().min(2, "Enter a platform name.").max(120),
  support_email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  default_timezone: z.string().trim().min(1).max(64),
  default_country: z.string().trim().min(1).max(64),
  season_label: z.string().trim().min(1).max(32),
  minor_age_threshold: z.coerce.number().int().min(13).max(21),
  default_confidence: z.enum(["low", "medium", "high"]),
  min_observations: z.coerce.number().int().min(1).max(10),
  require_guardian_consent_for_minors: z.boolean(),
  require_verification_for_active: z.boolean(),
  restrict_pii_to_staff: z.boolean(),
  show_score_to_recruiters: z.boolean(),
});

const asBool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "Please sign in again." };
  if (!ctx.isSuperAdmin) {
    return { error: "Only platform administrators can change these settings." };
  }

  const parsed = schema.safeParse({
    platform_name: formData.get("platform_name") ?? "",
    support_email: formData.get("support_email") ?? "",
    default_timezone: formData.get("default_timezone") ?? "",
    default_country: formData.get("default_country") ?? "",
    season_label: formData.get("season_label") ?? "",
    minor_age_threshold: formData.get("minor_age_threshold") ?? "",
    default_confidence: formData.get("default_confidence") ?? "medium",
    min_observations: formData.get("min_observations") ?? "",
    require_guardian_consent_for_minors: asBool(
      formData.get("require_guardian_consent_for_minors"),
    ),
    require_verification_for_active: asBool(formData.get("require_verification_for_active")),
    restrict_pii_to_staff: asBool(formData.get("restrict_pii_to_staff")),
    show_score_to_recruiters: asBool(formData.get("show_score_to_recruiters")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the values and try again." };
  }

  const v = parsed.data;
  const supabase = createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update({
      platform_name: v.platform_name,
      support_email: v.support_email ?? null,
      default_timezone: v.default_timezone,
      default_country: v.default_country,
      season_label: v.season_label,
      minor_age_threshold: v.minor_age_threshold,
      require_guardian_consent_for_minors: v.require_guardian_consent_for_minors,
      require_verification_for_active: v.require_verification_for_active,
      restrict_pii_to_staff: v.restrict_pii_to_staff,
      default_confidence: v.default_confidence,
      min_observations: v.min_observations,
      show_score_to_recruiters: v.show_score_to_recruiters,
      updated_by: ctx.userId,
    })
    .eq("id", SETTINGS_ID);

  if (error) {
    return { error: "Could not save settings. Please try again." };
  }

  await logAudit("platform_settings.update", "platform_settings", SETTINGS_ID, {
    minor_age_threshold: v.minor_age_threshold,
    default_confidence: v.default_confidence,
    min_observations: v.min_observations,
  });

  revalidatePath("/admin/settings");
  return { message: "Settings saved." };
}
