import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Append an audit entry (§5 M14, §12). Best-effort and non-blocking: a failure
 * must never break the action it records. The actor is the signed-in user; the
 * audit_logs table has no UPDATE/DELETE policy, so entries are append-only.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor_user_id: user?.id ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata as never,
    });
  } catch {
    // swallow — auditing must not break the primary action
  }
}
