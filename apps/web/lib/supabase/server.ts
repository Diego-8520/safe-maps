/**
 * Server-side Supabase client factory — NOT ACTIVE.
 *
 * TODO: Install @supabase/ssr, then replace this file with:
 *
 *   import { createServerClient } from "@supabase/ssr";
 *   import { cookies } from "next/headers";
 *   import type { Database } from "./types";
 *   import { SUPABASE_CONFIG } from "./config";
 *
 *   export function createSupabaseServerClient() {
 *     const cookieStore = cookies();
 *     return createServerClient<Database>(
 *       SUPABASE_CONFIG.url,
 *       SUPABASE_CONFIG.secretKey,  // service role key — bypasses RLS
 *       {
 *         cookies: {
 *           getAll: () => cookieStore.getAll(),
 *           setAll: (values) =>
 *             values.forEach(({ name, value, options }) =>
 *               cookieStore.set(name, value, options)
 *             ),
 *         },
 *       },
 *     );
 *   }
 *
 * SECURITY RULES for server.ts:
 *   - Uses SUPABASE_SECRET_KEY — never expose to the browser.
 *   - This file is server-side only: API Routes, Server Components, Server Actions.
 *   - Never import this file from a client component or a file marked "use client".
 *   - The secret key bypasses Row Level Security — use it only for trusted server operations.
 *   - Future: consider whether RLS-scoped access (publishable key) is sufficient
 *     for server operations before defaulting to the secret key.
 */

/** Placeholder — throws on call. Replace with real createServerClient() factory. */
export function createSupabaseServerClient(): never {
  throw new Error(
    "Supabase server client not configured. Install @supabase/ssr and update lib/supabase/server.ts.",
  );
}
