"use client";

import { useFormState } from "react-dom";
import { createReport } from "@/lib/scouting/actions";
import { FormMessage, SelectField, TextField } from "@/components/auth/form";
import { Button } from "@/components/ui/button";
import { CardBody, CardHeader, Card } from "@/components/ui/card";
import { CATEGORY_DEFINITIONS, SCORECARD_CATEGORIES, SPEED_SUBSCORES } from "@/lib/scoring/model";
import type { ReportFormState } from "@/lib/scouting/types";

const EMPTY: ReportFormState = {};

function RatingRow({ name, label, hint }: { name: string; label: string; hint?: string }) {
  return (
    <div className="grid grid-cols-[1fr_72px] items-center gap-3 border-b border-navy-50 py-2.5 last:border-0">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        {hint ? <p className="text-xs text-navy-400">{hint}</p> : null}
      </div>
      <input
        name={name}
        type="number"
        min={1}
        max={10}
        placeholder="1–10"
        className="w-[72px] rounded-lg border border-navy-200 px-2 py-1.5 text-center text-sm text-navy focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

export function ReportForm({ players }: { players: { id: string; name: string }[] }) {
  const [state, action] = useFormState(createReport, EMPTY);

  return (
    <form action={action} className="space-y-6">
      <FormMessage error={state.error} message={state.message} />

      <Card>
        <CardHeader title="Match context" subtitle="Required context for a credible report (§6)" />
        <CardBody className="space-y-4">
          <SelectField
            label="Player"
            name="playerId"
            options={[
              { value: "", label: "— Select player —" },
              ...players.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Competition"
              name="competition"
              required={false}
              placeholder="U20 League"
            />
            <TextField
              label="Opponent"
              name="opponent"
              required={false}
              placeholder="Kano Pillars U20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Match date" name="matchDate" type="date" required={false} />
            <TextField
              label="Venue"
              name="venue"
              required={false}
              placeholder="National Stadium, Abuja"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Position observed"
              name="positionObserved"
              required={false}
              placeholder="CM"
            />
            <TextField
              label="Minutes observed"
              name="minutesObserved"
              type="number"
              required={false}
              placeholder="90"
            />
            <SelectField
              label="Watched"
              name="watchedScope"
              defaultValue="full_match"
              options={[
                { value: "full_match", label: "Full match" },
                { value: "half", label: "A half" },
                { value: "clips", label: "Selected clips" },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Scorecard" subtitle="Seven weighted categories, 1–10 (§6)" />
        <CardBody>
          {SCORECARD_CATEGORIES.map((c) => (
            <RatingRow
              key={c}
              name={`rating_${c}`}
              label={`${CATEGORY_DEFINITIONS[c].label.split(" — ")[0]} · ${Math.round(CATEGORY_DEFINITIONS[c].weight * 100)}%`}
              hint={CATEGORY_DEFINITIONS[c].description}
            />
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Speed sub-scores" subtitle="Overlay dimensions, 1–10 (§6)" />
        <CardBody>
          {SPEED_SUBSCORES.map((s) => (
            <RatingRow key={s.key} name={`speed_${s.key}`} label={s.label} />
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Evidence & judgement"
          subtitle="Distinguish observation from opinion (§1, §6)"
        />
        <CardBody className="space-y-4">
          <Textarea
            label="Observed strengths"
            name="strengths"
            placeholder="One clear strength with a decisive match action…"
          />
          <Textarea
            label="Development areas"
            name="developmentAreas"
            placeholder="One clear development area…"
          />
          <Textarea
            label="Narrative (optional)"
            name="narrative"
            required={false}
            placeholder="Overall read, context, caveats…"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Assessor confidence"
              name="confidence"
              defaultValue="medium"
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
            <SelectField
              label="Recommendation"
              name="recommendation"
              defaultValue="monitor"
              options={[
                { value: "monitor", label: "Monitor" },
                { value: "reassess", label: "Reassess" },
                { value: "development_priority", label: "Development priority" },
                { value: "technical_review", label: "Technical review" },
              ]}
            />
          </div>
          <TextField
            label="Confidence reason"
            name="confidenceReason"
            required={false}
            placeholder="One full match, clear view"
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="submit" size="lg">
          Submit for review
        </Button>
        <Button type="submit" name="intent" value="draft" variant="outline" size="lg">
          Save draft
        </Button>
      </div>
      <p className="text-xs text-navy-400">
        A low-confidence report is not a final recommendation. Scores are a screening aid, not a
        guarantee (§6).
      </p>
    </form>
  );
}

function Textarea({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <textarea
        name={name}
        rows={3}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}
