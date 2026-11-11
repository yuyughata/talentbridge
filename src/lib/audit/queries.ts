import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AuditRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  actor_name: string | null;
  metadata: Record<string, unknown>;
}

/** Recent audit entries (TBA staff only, RLS-enforced). */
export async function listAuditLogs(limit = 100): Promise<AuditRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, metadata, users(display_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const u = row.users as { display_name: string | null; email: string | null } | null;
    return {
      ...(row as unknown as AuditRow),
      actor_name: u?.display_name || u?.email || null,
    };
  });
}
