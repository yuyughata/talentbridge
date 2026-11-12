"use client";

import { TranscribableTextarea } from "@/components/ai/transcribable-textarea";
import { Button } from "@/components/ui/button";
import { markSessionDelivered } from "@/lib/training/actions";
import type { TranscribeCaps } from "@/lib/ai/types";

/** Session delivery notes, with optional AI transcription (scan or dictate). */
export function SessionNotesForm({
  sessionId,
  defaultValue,
  caps,
}: {
  sessionId: string;
  defaultValue?: string | null;
  caps: TranscribeCaps;
}) {
  return (
    <form action={markSessionDelivered.bind(null, sessionId)} className="space-y-3">
      <TranscribableTextarea
        label="Session delivery notes"
        name="deliveredNote"
        caps={caps}
        required={false}
        defaultValue={defaultValue ?? ""}
        rows={4}
        placeholder="What was delivered, how it went, next steps…"
      />
      <Button type="submit" size="sm" variant="secondary">
        Save &amp; mark delivered
      </Button>
    </form>
  );
}
