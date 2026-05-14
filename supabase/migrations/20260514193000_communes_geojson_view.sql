create or replace view public.communes_geojson as
select
  id,
  zona_id,
  comuna_numero,
  name,
  city,
  department,
  country,
  geometry_source,
  st_asgeojson(geometry)::jsonb as geometry_geojson,
  created_at,
  updated_at
from public.communes
where geometry is not null;

comment on view public.communes_geojson is
'Read-only view exposing communes.geometry as GeoJSON for app repositories.';
