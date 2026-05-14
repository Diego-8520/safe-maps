export type SafeMapsDataSource = "local" | "supabase";

export const SAFE_MAPS_DATA_SOURCE_ENV = "SAFE_MAPS_DATA_SOURCE";

export function getSafeMapsDataSource(): SafeMapsDataSource {
  return process.env[SAFE_MAPS_DATA_SOURCE_ENV] === "supabase"
    ? "supabase"
    : "local";
}

export function isSupabaseDataSourceEnabled(): boolean {
  return getSafeMapsDataSource() === "supabase";
}

export interface SupabaseServerConfig {
  url: string;
  secretKey: string;
}

export interface SupabaseBrowserConfig {
  url: string;
  publishableKey: string;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  const url = process.env.SAFE_MAPS_SUPABASE_URL ?? "";
  const secretKey = process.env.SAFE_MAPS_SUPABASE_SECRET_KEY ?? "";

  if (!url || !secretKey) {
    throw new Error(
      "Supabase data source is enabled, but SAFE_MAPS_SUPABASE_URL or SAFE_MAPS_SUPABASE_SECRET_KEY is missing.",
    );
  }

  return { url, secretKey };
}

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  return {
    url: process.env.SAFE_MAPS_SUPABASE_URL ?? "",
    publishableKey: process.env.SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY ?? "",
  };
}
