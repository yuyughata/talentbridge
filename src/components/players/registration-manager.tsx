"use client";

import { useFormState } from "react-dom";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { addRegistration, deleteRegistration } from "@/lib/registrations/actions";
import type { AssociationRow, RegistrationFormState, RegistrationRow } from "@/lib/registrations/types";

const EMPTY: RegistrationFormState = {};

const DATE = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function RegistrationManager({
  playerId,
  registrations,
  associations,
  canManage,
}: {
  playerId: string;
  registrations: RegistrationRow[];
  associations: AssociationRow[];
  canManage: boolean;
}) {
  const [state, action] = useFormState(addRegistration.bind(null, playerId), EMPTY);

  return (
    <div className="space-y-5">
      {registrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400">
                <th className="py-2 pr-3 font-medium">Club</th>
                <th className="py-2 pr-3 font-medium">Association</th>
                <th className="py-2 pr-3 font-medium">Season</th>
                <th className="py-2 pr-3 font-medium">From</th>
                <th className="py-2 pr-3 font-medium">To</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">State</th>
                {canManage ? <th className="py-2" /> : null}
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-b border-navy-50 last:border-0">
                  <td className="py-2 pr-3 font-medium text-navy">{r.club ?? "—"}</td>
                  <td className="py-2 pr-3 text-navy-600">{r.association ?? "—"}</td>
                  <td className="nums py-2 pr-3 text-navy-600">{r.season_year ?? "—"}</td>
                  <td className="py-2 pr-3 text-navy-600">{DATE(r.registered_from)}</td>
                  <td className="py-2 pr-3 text-navy-600">{r.registered_to ? DATE(r.registered_to) : "current"}</td>
                  <td className="py-2 pr-3 text-navy-600">{r.player_status}</td>
                  <td className="py-2 pr-3 text-navy-600">{r.state}</td>
                  {canManage ? (
                    <td className="py-2 text-right">
                      <form action={deleteRegistration.bind(null, playerId, r.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-risk-600 hover:text-risk"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-navy-400">
          No registration history yet. Add each club spell from the calendar year of the player’s 12th
          birthday (FIFA RSTP).
        </p>
      )}

      {canManage ? (
        <form action={action} className="space-y-4 rounded-lg border border-navy-100 bg-surface-muted/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Add a registration</p>
          <FormMessage error={state.error} message={state.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Club / academy" name="clubName" placeholder="Lagos Future Stars Academy" />
            <SelectField
              label="Member association"
              name="associationId"
              defaultValue={associations[0]?.id ?? ""}
              options={[
                { value: "", label: "— None —" },
                ...associations.map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Season (year)" name="seasonYear" type="number" required={false} placeholder="2026" />
            <TextField label="Registered from" name="registeredFrom" type="date" required={false} />
            <TextField label="Registered to" name="registeredTo" type="date" required={false} />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <SelectField
              label="Status"
              name="playerStatus"
              defaultValue="amateur"
              options={[
                { value: "amateur", label: "Amateur" },
                { value: "professional", label: "Professional" },
              ]}
            />
            <SelectField
              label="Type"
              name="registrationKind"
              defaultValue="permanent"
              options={[
                { value: "permanent", label: "Permanent" },
                { value: "loan", label: "Loan" },
              ]}
            />
            <TextField label="Training cat." name="trainingCategory" required={false} placeholder="III" />
            <SelectField
              label="State"
              name="state"
              defaultValue="confirmed"
              options={[
                { value: "confirmed", label: "Confirmed" },
                { value: "terminated", label: "Terminated" },
                { value: "pending", label: "Pending" },
              ]}
            />
          </div>
          <SubmitButton className="w-auto">Add registration</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
