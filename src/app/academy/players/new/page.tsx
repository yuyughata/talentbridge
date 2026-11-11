import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeading, ScaffoldNote, WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PlayerForm } from "@/components/players/player-form";
import { requireWorkspace } from "@/lib/auth/session";
import { createPlayer } from "@/lib/players/actions";
import { UserIcon } from "@/components/ui/icons";

export const metadata = { title: "Add player" };

export default async function NewPlayerPage() {
  const ctx = await requireWorkspace("academy");

  return (
    <WorkspaceShell
      workspace="academy"
      activeHref="/academy/squad"
      user={{ displayName: ctx.displayName, email: ctx.email }}
    >
      <PageHeading
        title="Add player"
        description="Create a player record (§5 M02)."
        action={
          <Link
            href="/academy/squad"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Back to squad
          </Link>
        }
      />
      <div className="max-w-2xl">
        <Card>
          <CardHeader title="Player details" icon={<UserIcon />} />
          <CardBody>
            <PlayerForm action={createPlayer} submitLabel="Create player" />
            <div className="mt-4">
              <ScaffoldNote>
                Date of birth is restricted PII and never appears on recruiter-facing profiles (§2,
                §12). Record consent on the player&apos;s profile before any external share.
              </ScaffoldNote>
            </div>
          </CardBody>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
