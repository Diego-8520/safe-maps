/**
 * Supabase environment variable references.
 *
 * NOT ACTIVE — Supabase is not yet integrated into the pipeline.
 * These references are placeholders for when @supabase/supabase-js is installed
 * and the database connection is configured.
 *
 * Key distinction:
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — anon/public key, safe for browser.
 *     Its access is scoped by Row Level Security (RLS) policies on each table.
 *     Use this in createBrowserClient().
 *
 *   SUPABASE_SECRET_KEY — service role key, bypasses RLS entirely.
 *     Server-side only. Never expose to the browser. Never use NEXT_PUBLIC_.
 *     Use this in createServerClient() for admin operations.
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  secretKey: process.env.SUPABASE_SECRET_KEY ?? "",
} as const;
