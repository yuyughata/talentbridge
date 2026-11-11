/** Video / media providers (§5 M06). Large video lives with the provider, not in the DB. */
export const MEDIA_PROVIDERS = [
  { value: "xbotgo", label: "XbotGo (cloud link)" },
  { value: "veo", label: "Veo" },
  { value: "trace", label: "Trace" },
  { value: "hudl", label: "Hudl" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "mux", label: "Mux (re-hosted)" },
  { value: "other", label: "Other link" },
] as const;

export const PROVIDER_LABEL: Record<string, string> = Object.fromEntries(
  MEDIA_PROVIDERS.map((p) => [p.value, p.label]),
);

export const MEDIA_KINDS = [
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
  { value: "document", label: "Document (restricted)" },
] as const;

export const MEDIA_VISIBILITIES = [
  { value: "private", label: "Private (staff & academy only)" },
  { value: "internal", label: "Internal (TBA review)" },
  { value: "shared", label: "Shared (approved recruiters)" },
  { value: "public", label: "Public" },
] as const;

/** Visibility levels that may be shown externally and therefore require consent (§2). */
export const EXTERNAL_VISIBILITIES = ["shared", "public"];
