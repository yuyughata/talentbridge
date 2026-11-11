import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/auth-forms";
import { getUserContext } from "@/lib/auth/session";
import { primaryWorkspace } from "@/lib/auth/roles";

export const metadata = { title: "Create account" };

export default async function SignUpPage() {
  const ctx = await getUserContext();
  if (ctx) redirect(primaryWorkspace(ctx.roles));

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join as a player or request access for your academy or club."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800">
            Sign in
          </Link>
          <p className="mt-3 text-xs text-navy-400">
            Scouts, academy staff and recruiters usually join via an invitation from TBA or their
            organisation.
          </p>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
