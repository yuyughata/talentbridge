"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateSettings } from "@/lib/settings/actions";
import type { PlatformSettings, SettingsState } from "@/lib/settings/types";

const EMPTY: SettingsState = {};

const inputCls = cn(
  "w-full rounded-lg border border-navy-200 bg-surface px-3 py-2 text-sm text-navy shadow-sm",
  "placeholder:text-navy-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100",
  "disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-500",
);

function Text({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  disabled,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? undefined}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint ? <span className="mt-1 block text-xs text-navy-400">{hint}</span> : null}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className={inputCls}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-1 block text-xs text-navy-400">{hint}</span> : null}
    </label>
  );
}

function Toggle({
  label,
  name,
  defaultChecked,
  hint,
  disabled,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-navy-100 bg-surface px-3 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-300 text-teal-600 focus:ring-teal-200 disabled:cursor-not-allowed"
      />
      <span className="block">
        <span className="block text-sm font-medium text-navy">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-navy-400">{hint}</span> : null}
      </span>
    </label>
  );
}

function SaveBar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </Button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={description} />
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  );
}

export function SettingsForm({
  settings,
  canEdit,
}: {
  settings: PlatformSettings;
  canEdit: boolean;
}) {
  const [state, action] = useFormState(updateSettings, EMPTY);
  const disabled = !canEdit;

  return (
    <form action={action} className="space-y-6">
      {state.error ? (
        <p className="rounded-lg border border-risk-100 bg-risk-50 px-3 py-2 text-sm text-risk-600">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-sm text-lime-800">
          {state.message}
        </p>
      ) : null}

      {!canEdit ? (
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You can view these settings. Only a platform administrator can change them.
        </p>
      ) : null}

      <Section title="General" description="Identity and defaults shown across the platform.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Platform name"
            name="platform_name"
            defaultValue={settings.platform_name}
            disabled={disabled}
            required
          />
          <Text
            label="Support email"
            name="support_email"
            type="email"
            defaultValue={settings.support_email}
            placeholder="support@example.org"
            hint="Shown to users who need help."
            disabled={disabled}
            required={false}
          />
          <Text
            label="Default country"
            name="default_country"
            defaultValue={settings.default_country}
            disabled={disabled}
          />
          <Text
            label="Default timezone"
            name="default_timezone"
            defaultValue={settings.default_timezone}
            hint="IANA name, e.g. Africa/Lagos."
            disabled={disabled}
          />
          <Text
            label="Season label"
            name="season_label"
            defaultValue={settings.season_label}
            hint="Shown on reports and dossiers."
            disabled={disabled}
          />
        </div>
      </Section>

      <Section
        title="Governance & safeguarding"
        description="Protections for minors and personal data (§FIFA RSTP, child safeguarding)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Minor age threshold"
            name="minor_age_threshold"
            type="number"
            defaultValue={settings.minor_age_threshold}
            hint="Players under this age are flagged as minors (13–21)."
            disabled={disabled}
          />
        </div>
        <Toggle
          label="Require guardian consent for minors"
          name="require_guardian_consent_for_minors"
          defaultChecked={settings.require_guardian_consent_for_minors}
          hint="A guardian consent record is expected before a minor's profile is activated."
          disabled={disabled}
        />
        <Toggle
          label="Require verification before a profile goes active"
          name="require_verification_for_active"
          defaultChecked={settings.require_verification_for_active}
          hint="Profiles must pass document/identity verification to reach active status."
          disabled={disabled}
        />
        <Toggle
          label="Restrict personal data to staff"
          name="restrict_pii_to_staff"
          defaultChecked={settings.restrict_pii_to_staff}
          hint="Passport identity fields (DOB, legal names, documents) are hidden from recruiters."
          disabled={disabled}
        />
      </Section>

      <Section
        title="Scouting defaults"
        description="Defaults applied to new assessments and what recruiters can see."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Default confidence"
            name="default_confidence"
            defaultValue={settings.default_confidence}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            hint="Pre-selected confidence on a new report."
            disabled={disabled}
          />
          <Text
            label="Minimum observations"
            name="min_observations"
            type="number"
            defaultValue={settings.min_observations}
            hint="Assessments below this count are marked provisional (1–10)."
            disabled={disabled}
          />
        </div>
        <Toggle
          label="Show scores to recruiters"
          name="show_score_to_recruiters"
          defaultChecked={settings.show_score_to_recruiters}
          hint="When off, recruiters see attributes and notes but not the composite index."
          disabled={disabled}
        />
      </Section>

      {canEdit ? (
        <div className="flex justify-end">
          <SaveBar />
        </div>
      ) : null}
    </form>
  );
}
