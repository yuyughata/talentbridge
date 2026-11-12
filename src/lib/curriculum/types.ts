export type AgeBand = "u6_9" | "u10_12" | "u13_15" | "u16_18" | "u19_23";

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: "u6_9", label: "U6–9" },
  { value: "u10_12", label: "U10–12" },
  { value: "u13_15", label: "U13–15" },
  { value: "u16_18", label: "U16–18" },
  { value: "u19_23", label: "U19–23" },
];

export const AGE_BAND_LABEL: Record<AgeBand, string> = Object.fromEntries(
  AGE_BANDS.map((b) => [b.value, b.label]),
) as Record<AgeBand, string>;

export interface CurriculumModule {
  id: string;
  academy_id: string;
  age_band: AgeBand;
  title: string;
  focus: string | null;
  detail: string | null;
  video_url: string | null;
  position: number;
}

export interface CurriculumFormState {
  error?: string;
  message?: string;
}
