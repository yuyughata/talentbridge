import {
  CATEGORY_DEFINITIONS,
  SCORECARD_CATEGORIES,
  SCORING_MODEL_VERSION,
} from "@/lib/scoring/model";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GaugeIcon } from "@/components/ui/icons";

/**
 * Renders the live seven-category weighting model (§6) straight from the
 * scoring config, so the UI and the engine can never drift apart.
 */
export function ScorecardModelPreview() {
  const maxWeight = Math.max(...SCORECARD_CATEGORIES.map((c) => CATEGORY_DEFINITIONS[c].weight));

  return (
    <Card>
      <CardHeader
        title="Scorecard model"
        subtitle={`Seven weighted categories · Speed 15% · v${SCORING_MODEL_VERSION}`}
        icon={<GaugeIcon />}
      />
      <CardBody>
        <ul className="space-y-2.5">
          {SCORECARD_CATEGORIES.map((c) => {
            const def = CATEGORY_DEFINITIONS[c];
            const pct = Math.round(def.weight * 100);
            const isSpeed = c === "speed";
            return (
              <li key={c} className="flex items-center gap-3">
                <span className="w-28 flex-none text-sm text-navy">
                  {def.label.split(" — ")[0]}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                  <span
                    className={
                      isSpeed
                        ? "absolute inset-y-0 left-0 rounded-full bg-amber-sheen"
                        : "absolute inset-y-0 left-0 rounded-full bg-teal-sheen"
                    }
                    style={{ width: `${(def.weight / maxWeight) * 100}%` }}
                  />
                </span>
                <span className="nums w-9 flex-none text-right text-sm font-semibold text-navy">
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-navy-400">
          A weighted score is a screening aid, not objective truth or a FIFA rating. Read alongside
          position, competition level, age, match context and number of observations (§6).
        </p>
      </CardBody>
    </Card>
  );
}
