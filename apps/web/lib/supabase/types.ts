/**
 * Supabase database type stubs.
 *
 * NOT ACTIVE — replace this file with generated types once the first migration runs:
 *   npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 *
 * Expected tables when migrations are written:
 *   - communes              → geometry of commune polygons (PostGIS)
 *   - commune_risk_profiles → risk indicators per commune per dataset period
 *   - risk_datasets         → registry of annual/semi-annual dataset snapshots
 *   - route_analyses        → stored RouteAnalysis results (future persistence layer)
 *
 * See docs/database-schema.md for the proposed schema.
 */

export interface Database {
  public: {
    Tables: {
      // TODO: communes
      // communes: {
      //   Row: { id: number; nombre: string; geometry: string; ... };
      //   Insert: { ... };
      //   Update: { ... };
      // };

      // TODO: commune_risk_profiles
      // commune_risk_profiles: {
      //   Row: { id: number; commune_id: number; dataset_id: number; criminalidad: number; ... };
      //   Insert: { ... };
      //   Update: { ... };
      // };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
