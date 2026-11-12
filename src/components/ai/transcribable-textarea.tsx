"use client";

import { useState } from "react";
import { TranscribeWidget } from "./transcribe-widget";
import type { TranscribeCaps } from "@/lib/ai/types";

/** A textarea that can be filled by AI transcription (scan an image or dictate). */
export function TranscribableTextarea({
  label,
  name,
  placeholder,
  caps,
  required = true,
  defaultValue = "",
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  caps: TranscribeCaps;
  required?: boolean;
  defaultValue?: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  const append = (text: string) =>
    setValue((v) => (v.trim() ? `${v.replace(/\s+$/, "")}\n${text}` : text));

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
      <div className="mt-1.5">
        <TranscribeWidget caps={caps} onText={append} />
      </div>
    </label>
  );
}
