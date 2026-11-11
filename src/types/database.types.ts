/**
 * Supabase-generated database types.
 *
 * This is a PLACEHOLDER. Regenerate from the live/local schema with:
 *   npm run db:types
 * (wraps `supabase gen types typescript`). Until then the client is typed as a
 * generic database so the app compiles.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: Record<
      string,
      { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }
    >;
    Views: Record<string, { Row: Record<string, Json> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
  };
};
