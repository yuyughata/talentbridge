"use client";

import { useFormState } from "react-dom";
import { addMedia, deleteMedia, setMediaVisibility } from "@/lib/media/actions";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import {
  MEDIA_KINDS,
  MEDIA_PROVIDERS,
  MEDIA_VISIBILITIES,
  PROVIDER_LABEL,
} from "@/lib/media/constants";
import type { MediaFormState } from "@/lib/media/types";
import type { MediaRow } from "@/lib/media/queries";

const EMPTY: MediaFormState = {};

const VISIBILITY_BADGE: Record<string, StatusKind> = {
  private: "restricted",
  internal: "draft",
  shared: "submitted",
  public: "approved",
};

export function MediaManager({
  playerId,
  media,
  consents,
  canManage,
}: {
  playerId: string;
  media: MediaRow[];
  consents: { id: string; label: string }[];
  canManage: boolean;
}) {
  const [state, action] = useFormState(addMedia, EMPTY);

  return (
    <div className="space-y-5">
      {media.length === 0 ? (
        <p className="rounded-lg border border-dashed border-navy-200 px-4 py-6 text-center text-sm text-navy-400">
          No media yet. Link authorised match footage from your camera or video provider.
        </p>
      ) : (
        <ul className="divide-y divide-navy-100 rounded-lg border border-navy-100">
          {media.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy">{m.title || "Untitled"}</p>
                  <p className="text-xs text-navy-400">
                    {PROVIDER_LABEL[m.storage_provider] ?? m.storage_provider} · {m.kind}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={VISIBILITY_BADGE[m.visibility] ?? "draft"} />
                  <a
                    href={m.asset_reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-amber-700 hover:text-amber-800"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
              {canManage ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(["private", "internal", "shared"] as const).map((v) =>
                    m.visibility !== v ? (
                      <form key={v} action={setMediaVisibility.bind(null, m.id, playerId, v)}>
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="px-2 py-1 text-xs capitalize"
                        >
                          {v}
                        </Button>
                      </form>
                    ) : null,
                  )}
                  <form action={deleteMedia.bind(null, m.id, playerId)}>
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="px-2 py-1 text-xs text-navy-400 hover:text-risk-600"
                    >
                      Remove
                    </Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <form
          action={action}
          className="space-y-3 rounded-lg border border-navy-100 bg-surface-muted/40 p-4"
        >
          <p className="text-sm font-semibold text-navy">Link footage</p>
          <FormMessage error={state.error} message={state.message} />
          <input type="hidden" name="playerId" value={playerId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Provider"
              name="provider"
              defaultValue="xbotgo"
              options={MEDIA_PROVIDERS.map((p) => ({ value: p.value, label: p.label }))}
            />
            <SelectField
              label="Type"
              name="kind"
              defaultValue="video"
              options={MEDIA_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            />
          </div>
          <TextField
            label="Link to footage"
            name="url"
            placeholder="https://… (cloud share or review link)"
          />
          <TextField
            label="Title"
            name="title"
            required={false}
            placeholder="vs Kano Pillars U20 — full match"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Visibility"
              name="visibility"
              defaultValue="private"
              options={MEDIA_VISIBILITIES.map((v) => ({ value: v.value, label: v.label }))}
            />
            <SelectField
              label="Consent (for shared / public)"
              name="consentId"
              defaultValue=""
              options={[
                { value: "", label: "— None —" },
                ...consents.map((c) => ({ value: c.id, label: c.label })),
              ]}
            />
          </div>
          <SubmitButton>Add media</SubmitButton>
          <p className="text-xs text-navy-400">
            Large video stays with the provider. Shared or public media needs a recorded consent as
            its lawful basis.
          </p>
        </form>
      ) : null}
    </div>
  );
}
