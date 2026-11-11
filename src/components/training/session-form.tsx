"use client";

import { useFormState } from "react-dom";
import { createSession } from "@/lib/training/actions";
import { FormMessage, SubmitButton, TextField } from "@/components/auth/form";
import type { SessionFormState } from "@/lib/training/types";

const EMPTY: SessionFormState = {};

export function SessionForm() {
  const [state, action] = useFormState(createSession, EMPTY);
  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} message={state.message} />
      <TextField label="Session title" name="title" placeholder="Technical & passing" />
      <TextField
        label="Objective"
        name="objective"
        required={false}
        placeholder="Receiving on the half-turn under pressure"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Date & time" name="scheduledAt" type="datetime-local" required={false} />
        <TextField
          label="Duration (min)"
          name="durationMin"
          type="number"
          required={false}
          placeholder="90"
        />
        <TextField
          label="Intensity intent"
          name="intensityIntent"
          required={false}
          placeholder="Moderate"
        />
      </div>
      <SubmitButton>Create session</SubmitButton>
    </form>
  );
}
