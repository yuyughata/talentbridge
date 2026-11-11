import {
  CATEGORY_DEFINITIONS,
  SCORECARD_CATEGORIES,
  SCORING_MODEL_VERSION,
} from "@/lib/scoring/model";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

/**
 * Renders the live seven-category weighting model (§6) straight from the
 * scoring config, so the UI and the engine can never drift apart.
 */
export function ScorecardModelPreview() {
  return (
    <Card>
      <CardHeader
        title="Scorecard model"
        subtitle={`Seven weighted categories · Speed 15% · v${SCORING_MODEL_VERSION}`}
      />
      <CardBody>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-600">
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 text-right font-medium">Weight</th>
            </tr>
          </thead>
          <tbody>
            {SCORECARD_CATEGORIES.map((c) => (
              <tr key={c} className="border-b border-navy-50 last:border-0">
                <td className="py-2 text-navy">{CATEGORY_DEFINITIONS[c].label}</td>
                <td className="nums py-2 text-right font-medium text-navy">
                  {Math.round(CATEGORY_DEFINITIONS[c].weight * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-navy-600">
          A weighted score is a screening aid, not objective truth or a FIFA rating. Read alongside
          position, competition level, age, match context and number of observations (§6).
        </p>
      </CardBody>
    </Card>
  );
}
