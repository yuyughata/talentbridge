import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Create an in-app notification for another user (§5 M13). Uses the service role
 * because RLS restricts notifications to the owner; a user cannot insert a
 * notification addressed to someone else. Best-effort: if the service role key is
 * not configured, the notification is silently skipped (the action still succeeds).
 * Email delivery is layered on top of these rows by a transactional provider (§7).
 */
export async function notifyUser(
  userId: string,
  type: string,
  title: string,
  body?: string | null,
  link?: string | null,
): Promise<void> {
  if (!userId) return;
  try {
    const admin = createServiceRoleClient();
    await admin.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    });
  } catch {
    // service role not configured — skip (notifications are best-effort)
  }
}
