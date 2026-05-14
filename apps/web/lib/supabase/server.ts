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

export function createSupabaseServerClient(): SupabaseRestClient {
  const { url, secretKey } = getSupabaseServerConfig();

  return {
    async get<T>(table: string, params: Record<string, string>): Promise<T[]> {
      const response = await fetch(buildRestUrl(url, table, params), {
        headers: {
          apikey: secretKey,
          authorization: `Bearer ${secretKey}`,
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
