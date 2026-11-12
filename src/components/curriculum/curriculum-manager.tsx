"use client";

import { useFormState } from "react-dom";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/auth/form";
import { addCurriculumModule, deleteCurriculumModule } from "@/lib/curriculum/actions";
import { AGE_BANDS, type CurriculumFormState, type CurriculumModule } from "@/lib/curriculum/types";
import type { AgeBand } from "@/lib/curriculum/types";

const EMPTY: CurriculumFormState = {};

export function CurriculumManager({
  academyId,
  groups,
  canManage,
}: {
  academyId: string;
  groups: { band: AgeBand; label: string; modules: CurriculumModule[] }[];
  canManage: boolean;
}) {
  const [state, action] = useFormState(addCurriculumModule.bind(null, academyId), EMPTY);
  const total = groups.reduce((n, g) => n + g.modules.length, 0);

  return (
    <div className="space-y-6">
      {total === 0 ? (
        <p className="rounded-lg border border-navy-100 bg-surface-muted/60 px-4 py-6 text-center text-sm text-navy-400">
          No curriculum modules yet. Build the pathway module-by-module for each age band below.
        </p>
      ) : (
        <div className="space-y-5">
          {groups
            .filter((g) => g.modules.length > 0)
            .map((g) => (
              <div key={g.band}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-navy px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {g.label}
                  </span>
                  <span className="text-xs text-navy-400">
                    {g.modules.length} module{g.modules.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ol className="space-y-2">
                  {g.modules.map((m, i) => (
                    <li
                      key={m.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-navy-100 bg-surface px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          <span className="nums mr-2 text-navy-300">{i + 1}.</span>
                          {m.title}
                        </p>
                        {m.focus ? <p className="mt-0.5 text-sm text-navy-500">{m.focus}</p> : null}
                        {m.detail ? (
                          <p className="mt-1 text-xs text-navy-400">{m.detail}</p>
                        ) : null}
                        {m.video_url ? (
                          <a
                            href={m.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs font-medium text-amber-700 hover:text-amber-800"
                          >
                            Drill video ↗
                          </a>
                        ) : null}
                      </div>
                      {canManage ? (
                        <form action={deleteCurriculumModule.bind(null, academyId, m.id)}>
                          <button
                            type="submit"
                            className="flex-none text-xs font-medium text-risk-600 hover:text-risk"
                          >
                            Remove
                          </button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
        </div>
      )}

      {canManage ? (
        <form
          action={action}
          className="space-y-4 rounded-lg border border-navy-100 bg-surface-muted/60 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Add a curriculum module
          </p>
          <FormMessage error={state.error} message={state.message} />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Age band"
              name="ageBand"
              defaultValue="u13_15"
              options={AGE_BANDS.map((b) => ({ value: b.value, label: b.label }))}
            />
            <TextField label="Module title" name="title" placeholder="Receiving under pressure" />
            <TextField label="Order" name="position" type="number" required={false} placeholder="1" />
          </div>
          <TextField
            label="Focus (one line)"
            name="focus"
            required={false}
            placeholder="Body shape, first-touch direction, scanning"
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">Detail (optional)</span>
            <textarea
              name="detail"
              rows={2}
              placeholder="Coaching points, progressions, success criteria…"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <TextField
            label="Drill video link (optional)"
            name="videoUrl"
            required={false}
            placeholder="https://… (YouTube / Vimeo / drive)"
          />
          <SubmitButton className="w-auto">Add module</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
