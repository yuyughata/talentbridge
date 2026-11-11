"use client";

import { useFormState } from "react-dom";
import { createVerification } from "@/lib/verification/actions";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import type { VerificationFormState } from "@/lib/verification/types";

const EMPTY: VerificationFormState = {};

export function VerificationForm({ players }: { players: { id: string; name: string }[] }) {
  const [state, action] = useFormState(createVerification, EMPTY);
  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} message={state.message} />
      <SelectField
        label="Player"
        name="playerId"
        options={[
          { value: "", label: "— Select player —" },
          ...players.map((p) => ({ value: p.id, label: p.name })),
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Evidence type"
          name="verificationType"
          defaultValue="identity"
          options={[
            { value: "identity", label: "Identity" },
            { value: "age", label: "Age" },
            { value: "registration", label: "Registration" },
            { value: "playing_history", label: "Playing history" },
          ]}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue="pending"
          options={[
            { value: "pending", label: "Pending" },
            { value: "verified", label: "Verified" },
            { value: "rejected", label: "Rejected" },
            { value: "expired", label: "Expired" },
          ]}
        />
      </div>
      <TextField label="Document expiry (optional)" name="expiresAt" type="date" required={false} />
      <TextField
        label="Private document reference (optional)"
        name="documentReference"
        required={false}
        placeholder="storage path / provider id — never the file itself"
      />
      <TextField label="Notes (optional)" name="notes" required={false} />
      <SubmitButton>Save record</SubmitButton>
    </form>
  );
}
