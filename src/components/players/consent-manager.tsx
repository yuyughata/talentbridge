"use client";

import { useFormState } from "react-dom";
import { recordConsent, withdrawConsent } from "@/lib/consent/actions";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { CONSENT_TYPES } from "@/lib/players/constants";
import type { ConsentFormState } from "@/lib/players/types";
import type { ConsentRow } from "@/lib/players/queries";

const EMPTY: ConsentFormState = {};

const CONSENT_BADGE: Record<string, StatusKind> = {
  granted: "active",
  withdrawn: "rejected",
  expired: "needs_evidence",
  pending: "submitted",
};

const TYPE_LABEL = Object.fromEntries(CONSENT_TYPES.map((c) => [c.value, c.label]));

export function ConsentManager({
  playerId,
  consents,
  canManage,
}: {
  playerId: string;
  consents: ConsentRow[];
  canManage: boolean;
}) {
  const [state, action] = useFormState(recordConsent, EMPTY);

  return (
    <div className="space-y-5">
      {consents.length > 0 ? (
        <ul className="divide-y divide-navy-100 rounded-lg border border-navy-100">
          {consents.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy">
                  {TYPE_LABEL[c.consent_type] ?? c.consent_type}{" "}
                  <span className="text-xs font-normal text-navy-400">({c.version})</span>
                </p>
                {c.scope ? (
                  <p className="truncate text-xs text-navy-400">Scope: {c.scope}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={CONSENT_BADGE[c.status] ?? "draft"} />
                {canManage && c.status === "granted" ? (
                  <form action={withdrawConsent}>
                    <input type="hidden" name="consentId" value={c.id} />
                    <input type="hidden" name="playerId" value={playerId} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-navy-400 hover:text-risk-600"
                    >
                      Withdraw
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-navy-200 px-4 py-6 text-center text-sm text-navy-400">
          No consent recorded yet. A recorded lawful basis is required before any external share
          (§2).
        </p>
      )}

      {canManage ? (
        <form
          action={action}
          className="space-y-3 rounded-lg border border-navy-100 bg-surface-muted/40 p-4"
        >
          <p className="text-sm font-semibold text-navy">Record consent</p>
          <FormMessage error={state.error} message={state.message} />
          <input type="hidden" name="playerId" value={playerId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Type"
              name="consentType"
              defaultValue="data_processing"
              options={CONSENT_TYPES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <TextField label="Version" name="version" placeholder="v1.0" defaultValue="v1.0" />
          </div>
          <TextField
            label="Scope / permitted audience (optional)"
            name="scope"
            required={false}
            placeholder="Internal review and verified recruiters"
          />
          <SubmitButton>Record consent</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
