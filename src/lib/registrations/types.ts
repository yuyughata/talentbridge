/** Shared types for player registration history (FIFA RSTP passport / EPP). */

export type RegistrationPlayerStatus = "amateur" | "professional";
export type RegistrationKind = "permanent" | "loan";
export type RegistrationState = "confirmed" | "terminated" | "pending";

export interface RegistrationRow {
  id: string;
  player_id: string;
  club_id: string | null;
  club_name: string | null;
  association_id: string | null;
  season_year: number | null;
  registered_from: string | null;
  registered_to: string | null;
  player_status: RegistrationPlayerStatus;
  registration_kind: RegistrationKind;
  training_category: string | null;
  state: RegistrationState;
  note: string | null;
  /** Joined, read side only. */
  club?: string | null;
  association?: string | null;
}

export interface AssociationRow {
  id: string;
  name: string;
  short_code: string | null;
  country: string | null;
  fifa_connect_id: string | null;
}

export interface RegistrationFormState {
  error?: string;
  message?: string;
}
