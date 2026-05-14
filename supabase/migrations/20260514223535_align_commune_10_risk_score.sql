-- Align Comuna 10 risk profile with the expected Safe Maps local profile.
-- The app currently reads Supabase in local development, so the remote profile
-- must match apps/web/public/data/comunas-risk.json for C10.

update public.commune_risk_profiles as p
set
  criminalidad = 44,
  seguridad = 58,
  vigilancia = 54,
  iluminacion = 57,
  flujo_personas = 52,
  risk_score = 47,
  risk_level = 'medium'
from public.communes as c
where p.commune_id = c.id
  and c.comuna_numero = 10;
