"use client";

import { useFormState } from "react-dom";
import { createInvitation } from "@/lib/auth/invitations";
import type { InviteState } from "@/lib/auth/types";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { APP_ROLES, ROLE_LABEL } from "@/lib/auth/roles";

const EMPTY: InviteState = {};

export function InviteForm({ organisations }: { organisations: { id: string; name: string }[] }) {
  const [state, action] = useFormState(createInvitation, EMPTY);

  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />

      {state.inviteUrl ? (
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-3">
          <p className="text-xs font-medium text-navy-500">Shareable invitation link</p>
          <code className="mt-1 block break-all text-xs text-amber-700">{state.inviteUrl}</code>
          <p className="mt-2 text-xs text-navy-400">
            Send this link to the invitee. It expires in 14 days.
          </p>
        </div>
      ) : null}

      <TextField label="Email" name="email" type="email" placeholder="person@organisation.com" />
      <SelectField
        label="Role"
        name="role"
        defaultValue="scout"
        options={APP_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
      />
      <SelectField
        label="Organisation (required for scout / academy / recruiter / reviewer)"
        name="organisationId"
        defaultValue=""
        options={[
          { value: "", label: "— None (player / platform) —" },
          ...organisations.map((o) => ({ value: o.id, label: o.name })),
        ]}
      />
      <TextField
        label="Message (optional)"
        name="message"
        required={false}
        placeholder="A short note"
      />
      <SubmitButton>Create invitation</SubmitButton>
    </form>
  );
}
