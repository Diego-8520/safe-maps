/**
 * Browser-side Supabase client — NOT ACTIVE.
 *
 * TODO: Install @supabase/ssr, then replace this file with:
 *
 *   import { createBrowserClient } from "@supabase/ssr";
 *   import type { Database } from "./types";
 *   import { SUPABASE_CONFIG } from "./config";
 *
 *   export const supabaseBrowserClient = createBrowserClient<Database>(
 *     SUPABASE_CONFIG.url,
 *     SUPABASE_CONFIG.publishableKey,  // anon key — scoped by RLS
 *   );
 *
 * Use this client in React components and client-side hooks.
 * RLS policies on each table determine what data the anon key can access.
 *
 * NEVER use the secret key here. NEVER import server.ts into client components.
 */

/** Placeholder — not connected. Replace with real createBrowserClient() call. */
export const supabaseBrowserClient: unknown = null;
