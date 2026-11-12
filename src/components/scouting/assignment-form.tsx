"use client";

import { useFormState } from "react-dom";
import { createAssignment } from "@/lib/assignments/actions";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { POSITIONS } from "@/lib/players/constants";
import type { AssignmentFormState } from "@/lib/assignments/types";

const EMPTY: AssignmentFormState = {};

export function AssignmentForm({
  scouts,
  players,
}: {
  scouts: { id: string; name: string }[];
  players: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(createAssignment, EMPTY);

  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />

      <SelectField
        label="Assign to scout"
        name="scoutUserId"
        options={[
          {
            value: "",
            label: scouts.length ? "— Select scout —" : "No scouts available — invite one first",
          },
          ...scouts.map((s) => ({ value: s.id, label: s.name })),
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Target player (optional)"
          name="targetPlayerId"
          defaultValue=""
          options={[
            { value: "", label: "— Any / none —" },
            ...players.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <SelectField
          label="Target position (optional)"
          name="targetPosition"
          defaultValue=""
          options={[
            { value: "", label: "— Any —" },
            ...POSITIONS.map((p) => ({ value: p, label: p })),
          ]}
        />
      </div>
      <TextField
        label="Objective"
        name="objective"
        required={false}
        placeholder="Assess press resistance and progression under pressure"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Competition (optional)"
          name="competition"
          required={false}
          placeholder="U20 League"
        />
        <TextField
          label="Opponent (optional)"
          name="opponent"
          required={false}
          placeholder="Kano Pillars U20"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Match date" name="matchDate" type="date" required={false} />
        <TextField label="Venue" name="venue" required={false} placeholder="Abuja" />
        <TextField label="Due date" name="dueDate" type="date" required={false} />
      </div>
      <SubmitButton>Create assignment</SubmitButton>
    </form>
  );
}
