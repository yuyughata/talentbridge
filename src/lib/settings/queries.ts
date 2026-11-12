import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, SETTINGS_ID, type Confidence, type PlatformSettings } from "./types";

/**
 * Read the single platform-settings row. Readable by any authenticated user
 * (select policy `using (true)`); falls back to defaults if the row is missing.
 */
export async function getSettings(): Promise<PlatformSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select(
      "platform_name, support_email, default_timezone, default_country, season_label, minor_age_threshold, require_guardian_consent_for_minors, require_verification_for_active, restrict_pii_to_staff, default_confidence, min_observations, show_score_to_recruiters",
    )
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (!data) return { ...DEFAULT_SETTINGS };

  return {
    platform_name: data.platform_name ?? DEFAULT_SETTINGS.platform_name,
    support_email: data.support_email ?? null,
    default_timezone: data.default_timezone ?? DEFAULT_SETTINGS.default_timezone,
    default_country: data.default_country ?? DEFAULT_SETTINGS.default_country,
    season_label: data.season_label ?? DEFAULT_SETTINGS.season_label,
    minor_age_threshold: data.minor_age_threshold ?? DEFAULT_SETTINGS.minor_age_threshold,
    require_guardian_consent_for_minors:
      data.require_guardian_consent_for_minors ??
      DEFAULT_SETTINGS.require_guardian_consent_for_minors,
    require_verification_for_active:
      data.require_verification_for_active ?? DEFAULT_SETTINGS.require_verification_for_active,
    restrict_pii_to_staff: data.restrict_pii_to_staff ?? DEFAULT_SETTINGS.restrict_pii_to_staff,
    default_confidence: (data.default_confidence as Confidence) ?? DEFAULT_SETTINGS.default_confidence,
    min_observations: data.min_observations ?? DEFAULT_SETTINGS.min_observations,
    show_score_to_recruiters:
      data.show_score_to_recruiters ?? DEFAULT_SETTINGS.show_score_to_recruiters,
  };
}

/**
 * The minor-age threshold, used by player registration to decide whether a
 * guardian/consent is required. Cheap helper for non-settings callers.
 */
export async function getMinorAgeThreshold(): Promise<number> {
  try {
    const s = await getSettings();
    return s.minor_age_threshold;
  } catch {
    return DEFAULT_SETTINGS.minor_age_threshold;
  }
}
