import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AcceptInviteForm } from "@/components/auth/auth-forms";
import { previewInvitation } from "@/lib/auth/invitations";
import { ROLE_LABEL } from "@/lib/auth/roles";

export const metadata = { title: "Accept invitation" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const preview = await previewInvitation(token);

  if (preview.invalid || preview.status === "invalid") {
    return (
      <AuthShell
        title="Invitation not found"
        subtitle="This link is invalid or has been removed."
        footer={
          <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800">
            Go to sign in
          </Link>
        }
      >
        <p className="text-sm text-navy-500">
          Ask whoever invited you to send a fresh invitation link.
        </p>
      </AuthShell>
    );
  }

  if (preview.status === "unavailable") {
    return (
      <AuthShell title="Invitations unavailable" subtitle="Acceptance isn't configured yet.">
        <p className="text-sm text-navy-500">
          The server is missing its service role key, so invitations can&apos;t be accepted right
          now. Please contact the administrator who invited you.
        </p>
      </AuthShell>
    );
  }

  if (preview.status !== "pending" || preview.expired) {
    const reason = preview.expired ? "has expired" : `was already ${preview.status}`;
    return (
      <AuthShell
        title="Invitation unavailable"
        subtitle={`This invitation ${reason}.`}
        footer={
          <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800">
            Go to sign in
          </Link>
        }
      >
        <p className="text-sm text-navy-500">Ask for a new invitation link to continue.</p>
      </AuthShell>
    );
  }

  const roleLabel = ROLE_LABEL[preview.role];
  const where = preview.organisationName ? ` at ${preview.organisationName}` : "";

  return (
    <AuthShell
      title="Accept your invitation"
      subtitle={`You've been invited to join as ${roleLabel}${where}.`}
      footer={
        <Link href="/login" className="font-medium text-lime-700 hover:text-lime-800">
          Already have an account? Sign in
        </Link>
      }
    >
      <AcceptInviteForm token={token} email={preview.email} />
    </AuthShell>
  );
}
