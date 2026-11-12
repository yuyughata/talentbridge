export const SETTINGS_ID = "ffffffff-ffff-4fff-8fff-ffffffffff01";

export type Confidence = "low" | "medium" | "high";

export interface PlatformSettings {
  platform_name: string;
  support_email: string | null;
  default_timezone: string;
  default_country: string;
  season_label: string;
  minor_age_threshold: number;
  require_guardian_consent_for_minors: boolean;
  require_verification_for_active: boolean;
  restrict_pii_to_staff: boolean;
  default_confidence: Confidence;
  min_observations: number;
  show_score_to_recruiters: boolean;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  platform_name: "Talent Bridge Africa",
  support_email: null,
  default_timezone: "Africa/Lagos",
  default_country: "Nigeria",
  season_label: "2026/27",
  minor_age_threshold: 18,
  require_guardian_consent_for_minors: true,
  require_verification_for_active: true,
  restrict_pii_to_staff: true,
  default_confidence: "medium",
  min_observations: 2,
  show_score_to_recruiters: true,
};

export interface SettingsState {
  error?: string;
  message?: string;
}
