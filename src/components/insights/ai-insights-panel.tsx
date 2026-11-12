"use client";

import { useFormState, useFormStatus } from "react-dom";
import { analyzeCohort } from "@/lib/insights/actions";
import type { InsightsState } from "@/lib/insights/types";
import { Button } from "@/components/ui/button";

const EMPTY: InsightsState = {};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Analysing…" : "Generate AI analysis"}
    </Button>
  );
}

/** Renders AI text with minimal markdown (## headings, - bullets). */
function Rendered({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`} className="ml-4 list-disc space-y-1 text-sm text-navy-600">
          {list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flush(i);
      return;
    }
    if (line.startsWith("## ") || line.startsWith("# ")) {
      flush(i);
      out.push(
        <h4 key={i} className="mt-3 text-sm font-semibold text-navy">
          {line.replace(/^#+\s*/, "")}
        </h4>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      list.push(line.replace(/^[-*]\s*/, ""));
    } else {
      flush(i);
      out.push(
        <p key={i} className="text-sm text-navy-600">
          {line}
        </p>,
      );
    }
  });
  flush(lines.length);
  return <div className="space-y-1.5">{out}</div>;
}

export function AiInsightsPanel({
  available,
  academyId,
}: {
  available: boolean;
  academyId?: string;
}) {
  const [state, action] = useFormState(analyzeCohort, EMPTY);

  if (!available) {
    return (
      <p className="text-sm text-navy-400">
        AI analysis is off. Add an Anthropic API key to turn computed trends into a written
        analysis. The metrics above work without it.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-risk-100 bg-risk-50 px-3 py-2 text-sm text-risk-600">
          {state.error}
        </p>
      ) : null}
      {state.text ? (
        <div className="rounded-lg border border-navy-100 bg-surface-muted/50 p-4">
          <Rendered text={state.text} />
        </div>
      ) : (
        <p className="text-sm text-navy-400">
          Generate a plain-language analysis of the trends and growth above. The AI only uses the
          computed numbers — it does not invent data.
        </p>
      )}
      <form action={action}>
        {academyId ? <input type="hidden" name="academyId" value={academyId} /> : null}
        <GenerateButton />
      </form>
    </div>
  );
}
