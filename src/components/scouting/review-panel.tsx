"use client";

import { useFormState } from "react-dom";
import { reviewReport } from "@/lib/scouting/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form";
import type { ReviewState } from "@/lib/scouting/types";

const EMPTY: ReviewState = {};

export function ReviewPanel({ reportId }: { reportId: string }) {
  const [state, action] = useFormState(reviewReport.bind(null, reportId), EMPTY);

  return (
    <form action={action} className="space-y-3">
      <FormMessage error={state.error} message={state.message} />
      <textarea
        name="comment"
        rows={3}
        placeholder="Reviewer comment (required to return or reject)…"
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="approve" size="sm">
          Approve
        </Button>
        <Button type="submit" name="decision" value="return" variant="outline" size="sm">
          Return for clarification
        </Button>
        <Button type="submit" name="decision" value="reject" variant="danger" size="sm">
          Reject
        </Button>
      </div>
      <p className="text-xs text-navy-400">
        Approval updates the player&apos;s assessment history. It does not mark the player verified.
      </p>
    </form>
  );
}
