import { PageHeading, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireWorkspace } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings/queries";
import { transcriptionCapabilities } from "@/lib/ai/transcribe";
import { insightsAiAvailable } from "@/lib/insights/ai";
import { SCORING_MODEL_VERSION } from "@/lib/scoring/model";

export const metadata = { title: "Settings" };

function StatusRow({ label, on, detail }: { label: string; on: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy-50 py-2.5 last:border-0">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        {detail ? <p className="text-xs text-navy-400">{detail}</p> : null}
      </div>
      <span
        className={
          on
            ? "rounded-full border border-lime-200 bg-lime-50 px-2.5 py-0.5 text-xs font-semibold text-lime-800"
            : "rounded-full border border-navy-100 bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-400"
        }
      >
        {on ? "Enabled" : "Off"}
      </span>
    </div>
  );
}

export default async function Page() {
  const ctx = await requireWorkspace("admin");
  const canEdit = ctx.isSuperAdmin;

  const [settings, caps] = await Promise.all([getSettings(), Promise.resolve(transcriptionCapabilities())]);
  const insightsAi = insightsAiAvailable();

  return (
    <WorkspaceShell
      workspace="admin"
      activeHref="/admin/settings"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Settings"
        description="Platform-wide configuration, safeguarding rules, and scouting defaults."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SettingsForm settings={settings} canEdit={canEdit} />

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Integrations"
              subtitle="Optional AI features, controlled by environment keys."
            />
            <CardBody>
              <StatusRow
                label="Note transcription — image"
                on={caps.image}
                detail="Scan handwritten notes (Anthropic vision)."
              />
              <StatusRow
                label="Note transcription — voice"
                on={caps.audio}
                detail="Dictate notes (OpenAI Whisper)."
              />
              <StatusRow
                label="AI player insights"
                on={insightsAi}
                detail="Written analysis of computed trends."
              />
              <p className="mt-3 text-xs text-navy-400">
                These turn on when the relevant API key is configured for the deployment. They
                send only note content or computed aggregates — never restricted personal data.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Platform info" subtitle="Read-only." />
            <CardBody>
              <StatusRow label="Scoring model" on detail={`Version ${SCORING_MODEL_VERSION}`} />
              <StatusRow label="Data residency" on detail="Supabase (managed Postgres)" />
            </CardBody>
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
