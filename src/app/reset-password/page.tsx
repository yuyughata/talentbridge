import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
