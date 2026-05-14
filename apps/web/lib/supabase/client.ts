import { getSupabaseBrowserConfig } from "./config";

/**
 * Browser-side Supabase config placeholder.
 *
 * Safe Maps does not create a browser Supabase client yet. UI code should not
 * import Supabase directly; repository access stays server-side until RLS and
 * the feature flag rollout are ready.
 */
export const supabaseBrowserConfig = getSupabaseBrowserConfig();
