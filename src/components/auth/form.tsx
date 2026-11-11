"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  readOnly,
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        autoComplete={autoComplete}
        required={required}
        className={cn(
          "w-full rounded-lg border border-navy-200 bg-surface px-3 py-2 text-sm text-navy shadow-sm",
          "placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100",
          readOnly && "cursor-not-allowed bg-navy-50 text-navy-500",
        )}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-200 bg-surface px-3 py-2 text-sm text-navy shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={cn("w-full", className)} disabled={pending}>
      {pending ? "Please wait…" : children}
    </Button>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p className="rounded-lg border border-risk-100 bg-risk-50 px-3 py-2 text-sm text-risk-600">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-700">
        {message}
      </p>
    );
  }
  return null;
}
