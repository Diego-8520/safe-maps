import "server-only";

import { getSupabaseServerConfig } from "./config";

type SupabaseRestValue =
  | string
  | number
  | boolean
  | null
  | SupabaseRestValue[]
  | { [key: string]: SupabaseRestValue };

export interface SupabaseRestClient {
  get<T>(table: string, params: Record<string, string>): Promise<T[]>;
}

function buildRestUrl(baseUrl: string, table: string, params: Record<string, string>): URL {
  const url = new URL(`/rest/v1/${table}`, baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

function createErrorMessage(table: string, status: number, body: string): string {
  const detail = body.trim() ? `: ${body}` : "";
  return `Supabase query failed for ${table} (${status})${detail}`;
}

/**
 * Create a Supabase REST client using publishable key when available.
 * 
 * With RLS enabled, the publishable key is sufficient for SELECT operations.
 * Falls back to secretKey if publishable key is not configured.
 * 
 * @param options.useSecretKey - If true, use secretKey instead of publishableKey
 */
export function createSupabaseServerClient(options?: { useSecretKey?: boolean }): SupabaseRestClient {
  const config = getSupabaseServerConfig();
  const url = config.url;

  // Prefer publishable key for RLS-protected SELECT operations
  let apiKey = config.publishableKey;
  let authHeader = `Bearer ${config.publishableKey}`;

  // Fallback to secretKey if publishableKey is not available or explicitly requested
  if (!config.publishableKey || options?.useSecretKey) {
    if (!config.secretKey) {
      throw new Error(
        "No Supabase API key available: neither SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY nor SAFE_MAPS_SUPABASE_SECRET_KEY is set.",
      );
    }
    apiKey = config.secretKey;
    authHeader = `Bearer ${config.secretKey}`;
  }

  return {
    async get<T>(table: string, params: Record<string, string>): Promise<T[]> {
      const response = await fetch(buildRestUrl(url, table, params), {
        headers: {
          apikey: apiKey,
          authorization: authHeader,
          accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          createErrorMessage(table, response.status, await response.text()),
        );
      }

      return (await response.json()) as T[];
    },
  };
}

export type { SupabaseRestValue };
