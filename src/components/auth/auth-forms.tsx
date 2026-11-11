"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signIn, signUp, requestPasswordReset, updatePassword } from "@/lib/auth/actions";
import { acceptInvitation } from "@/lib/auth/invitations";
import type { AuthState, InviteState } from "@/lib/auth/types";
import { FormMessage, SubmitButton, TextField } from "./form";

const EMPTY: AuthState = {};
const EMPTY_INVITE: InviteState = {};

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useFormState(signIn, EMPTY);
  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormMessage error={state.error} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@club.com"
      />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" />
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-lime-700 hover:text-lime-800"
        >
          Forgot password?
        </Link>
      </div>
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useFormState(signUp, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <TextField
        label="Full name"
        name="displayName"
        autoComplete="name"
        placeholder="Amara Okonkwo"
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@club.com"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useFormState(requestPasswordReset, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@club.com"
      />
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useFormState(updatePassword, EMPTY);
  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [state, action] = useFormState(acceptInvitation, EMPTY_INVITE);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage error={state.error} message={state.message} />
      <TextField
        label="Email"
        name="emailDisplay"
        type="email"
        defaultValue={email}
        readOnly
        required={false}
      />
      <TextField label="Full name" name="displayName" autoComplete="name" placeholder="Your name" />
      <TextField
        label="Set a password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <SubmitButton>Accept &amp; create account</SubmitButton>
    </form>
  );
}
