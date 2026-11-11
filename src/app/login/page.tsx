import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/auth-forms";
import { getUserContext } from "@/lib/auth/session";
import { primaryWorkspace } from "@/lib/auth/roles";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const ctx = await getUserContext();
  if (ctx) redirect(primaryWorkspace(ctx.roles));

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Talent Bridge Africa workspace."
      footer={
        <>
          New to the platform?{" "}
          <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-700">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm next={searchParams.next} />
    </AuthShell>
  );
}
