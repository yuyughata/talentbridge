"use client";

import { useFormState } from "react-dom";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { FEET, POSITIONS } from "@/lib/players/constants";
import type { PlayerFormState } from "@/lib/players/types";
import type { PlayerRow } from "@/lib/players/queries";

const EMPTY: PlayerFormState = {};

type Action = (prev: PlayerFormState, formData: FormData) => Promise<PlayerFormState>;

export function PlayerForm({
  action,
  player,
  submitLabel = "Save player",
  restrictedPii = true,
}: {
  action: Action;
  player?: PlayerRow;
  submitLabel?: string;
  restrictedPii?: boolean;
}) {
  const [state, formAction] = useFormState(action, EMPTY);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          name="displayName"
          defaultValue={player?.display_name}
          placeholder="Amara Okonkwo"
        />
        <TextField
          label="Preferred name"
          name="preferredName"
          required={false}
          defaultValue={player?.preferred_name ?? ""}
          placeholder="Amara"
        />
      </div>

      {restrictedPii ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Date of birth (restricted)"
            name="dateOfBirth"
            type="date"
            required={false}
            defaultValue={player?.date_of_birth ?? ""}
          />
          <TextField
            label="Nationality"
            name="nationality"
            required={false}
            defaultValue={player?.nationality ?? ""}
            placeholder="Nigerian"
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Primary position"
          name="primaryPosition"
          defaultValue={player?.primary_position ?? ""}
          options={[
            { value: "", label: "— Select —" },
            ...POSITIONS.map((p) => ({ value: p, label: p })),
          ]}
        />
        <SelectField
          label="Dominant foot"
          name="dominantFoot"
          defaultValue={player?.dominant_foot ?? ""}
          options={[
            { value: "", label: "— Select —" },
            ...FEET.map((f) => ({ value: f, label: f })),
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Height (cm)"
          name="heightCm"
          type="number"
          required={false}
          defaultValue={player?.height_cm ? String(player.height_cm) : ""}
          placeholder="178"
        />
        <TextField
          label="Location"
          name="location"
          required={false}
          defaultValue={player?.location ?? ""}
          placeholder="Abuja, NG"
        />
      </div>

      <TextField
        label="Secondary positions (comma-separated)"
        name="secondaryPositions"
        required={false}
        defaultValue={(player?.secondary_positions ?? []).join(", ")}
        placeholder="Attacking Midfielder, Left Winger"
      />
      <TextField
        label="Languages (comma-separated)"
        name="languages"
        required={false}
        defaultValue={(player?.languages ?? []).join(", ")}
        placeholder="English, Hausa"
      />
      <TextField
        label="Portrait photo URL"
        name="portraitUrl"
        required={false}
        defaultValue={player?.portrait_url ?? ""}
        placeholder="https://… (permission-cleared photo)"
      />

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
