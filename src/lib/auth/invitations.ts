"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getUserContext } from "./session";
import { APP_ROLES, primaryWorkspace, type AppRole } from "./roles";
import type { InviteState, InvitationPreview } from "./types";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

/** Roles that must be attached to an organisation. */
const ORG_ROLES: AppRole[] = ["scout", "academy_staff", "tba_reviewer", "recruiter"];
/** Roles only TBA staff / admins may issue. */
const PRIVILEGED_ROLES: AppRole[] = ["tba_reviewer", "super_admin"];

const createSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(APP_ROLES as unknown as [AppRole, ...AppRole[]]),
  organisationId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: z.string().max(500).optional(),
});

/**
 * Create an invitation (invite-first onboarding, §5 M01). Runs as the signed-in
 * inviter; RLS requires them to be TBA staff or a member of the target org.
 * Returns a shareable acceptance link.
 */
export async function createInvitation(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const ctx = await getUserContext();
  if (!ctx) return { error: "You must be signed in to send invitations." };

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    organisationId: formData.get("organisationId") ?? "",
    message: formData.get("message") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid invitation." };
  }
  const { email, role, organisationId, message } = parsed.data;

  if (ORG_ROLES.includes(role) && !organisationId) {
    return { error: `A ${role.replace("_", " ")} invitation needs an organisation.` };
  }
  if (PRIVILEGED_ROLES.includes(role) && !ctx.isSuperAdmin && !ctx.roles.includes("tba_reviewer")) {
    return { error: "Only TBA staff can issue that role." };
  }

  const token = newToken();
  const supabase = createClient();
  const { error } = await supabase.from("invitations").insert({
    email: email.toLowerCase(),
    role,
    organisation_id: organisationId ?? null,
    token,
    message: message ?? null,
    invited_by: ctx.userId,
  });
  if (error) {
    return {
      error: "Could not create the invitation. Check your permissions for this organisation.",
    };
  }

  revalidatePath("/admin/users");
  return {
    message: `Invitation created for ${email}.`,
    inviteUrl: `${siteUrl()}/accept-invite?token=${token}`,
  };
}

/**
 * Read a limited preview of an invitation by token. Trusted server operation
 * (service role) — the token is a bearer secret. Returns `invalid` when unknown.
 */
export async function previewInvitation(token: string): Promise<InvitationPreview> {
  if (!token) return invalidPreview();
  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    // Service role not configured in this environment.
    return {
      email: "",
      role: "player",
      organisationName: null,
      status: "unavailable",
      expired: false,
    };
  }

  const { data } = await admin
    .from("invitations")
    .select("email, role, status, expires_at, organisations(name)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return invalidPreview();
  const org = data.organisations as { name: string | null } | { name: string | null }[] | null;
  const organisationName = Array.isArray(org) ? (org[0]?.name ?? null) : (org?.name ?? null);
  return {
    email: data.email as string,
    role: data.role as AppRole,
    organisationName,
    status: data.status as string,
    expired: new Date(data.expires_at as string).getTime() < Date.now(),
  };
}

function invalidPreview(): InvitationPreview {
  return {
    email: "",
    role: "player",
    organisationName: null,
    status: "invalid",
    expired: false,
    invalid: true,
  };
}

const acceptSchema = z.object({
  token: z.string().min(10),
  displayName: z.string().min(2, "Enter your name."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/**
 * Accept an invitation: create the confirmed auth user, grant the invited role,
 * mark the invite accepted, then sign the user in. Trusted operation (service
 * role, §7). Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export async function acceptInvitation(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const parsed = acceptSchema.safeParse({
    token: formData.get("token"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const { token, displayName, password } = parsed.data;

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return { error: "Invitation acceptance is not configured (missing service role key)." };
  }

  const { data: invite } = await admin
    .from("invitations")
    .select("id, email, role, organisation_id, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { error: "This invitation link is not valid." };
  if (invite.status !== "pending")
    return { error: "This invitation has already been used or revoked." };
  if (new Date(invite.expires_at as string).getTime() < Date.now()) {
    await admin.from("invitations").update({ status: "expired" }).eq("id", invite.id);
    return { error: "This invitation has expired. Ask for a new one." };
  }

  const email = invite.email as string;
  const role = invite.role as AppRole;
  const organisationId = invite.organisation_id as string | null;

  // Create a confirmed user (invited users skip email confirmation).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (createErr || !created.user) {
    return {
      error:
        createErr?.message ??
        "Could not create the account. It may already exist — try signing in.",
    };
  }
  const userId = created.user.id;

  // Grant the invited role.
  if (role === "super_admin") {
    await admin.from("users").update({ is_super_admin: true }).eq("id", userId);
  } else if (role === "player") {
    await admin.from("players").insert({
      user_id: userId,
      display_name: displayName,
      primary_academy_id: organisationId,
      profile_status: "draft",
    });
  } else if (organisationId) {
    await admin.from("organisation_members").insert({
      organisation_id: organisationId,
      user_id: userId,
      role,
      membership_status: "active",
      invited_by: null,
    });
  }

  await admin
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), accepted_by: userId })
    .eq("id", invite.id);

  // Sign the new user in on this session.
  const supabase = createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    return { message: "Account created. Please sign in." };
  }

  const ctx = await getUserContext();
  redirect(ctx ? primaryWorkspace(ctx.roles) : "/player");
}

/** Revoke a pending invitation (inviter / staff / org member — enforced by RLS). */
export async function revokeInvitation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createClient();
  await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
  revalidatePath("/admin/users");
}
