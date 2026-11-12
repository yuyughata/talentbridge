import type { AppRole } from "./roles";

export interface AuthState {
  error?: string;
  message?: string;
}

export interface InviteState {
  error?: string;
  message?: string;
  inviteUrl?: string;
}

export interface InvitationPreview {
  email: string;
  role: AppRole;
  organisationName: string | null;
  status: string;
  expired: boolean;
  invalid?: boolean;
}
