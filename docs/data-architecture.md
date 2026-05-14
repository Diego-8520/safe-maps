# Safe Maps — Arquitectura de datos

Describe la capa de acceso a datos actual: archivos locales, loaders, repositories y la preparación para migración a Supabase/PostGIS.

---

## Estado actual

Safe Maps opera completamente sobre archivos estáticos locales. No hay base de datos activa. No existe conexión a Supabase.

| Fuente de datos | Formato | Ubicación | Propósito |
|----------------|---------|-----------|-----------|
| `comunas-cali.geojson` | GeoJSON | `public/data/` | Geometría oficial de comunas de Cali |
| `comunas-risk.json` | JSON | `public/data/` | Perfiles de riesgo simulados por comuna |

Ambos archivos se leen en tiempo de ejecución del servidor (server-side) y se mantienen en caché en memoria durante la vida del proceso.

---

## Flujo de datos

```
public/data/comunas-cali.geojson
public/data/comunas-risk.json
        │
        ▼
lib/geo/load-communes-geojson.ts     lib/risk/load-communes-risk.ts
(loader con caché en módulo)         (loader con caché en módulo)
        │                                     │
        ▼                                     ▼
lib/repositories/local-commune-repository.ts
lib/repositories/local-commune-risk-repository.ts
        │
        ▼
lib/routes/normalize-openroute-route.ts
(pipeline principal: segmentación + commune lookup + riesgo)
        │
        ▼
lib/risk/euler-accumulated-route-risk.ts
(integrador Euler)
        │
        ▼
RouteAnalysis → cliente
```

---

## Por qué se introdujo el Repository Pattern

El pipeline original llamaba a `loadCommunesGeoJSON()` y `loadCommunesRisk()` directamente desde `normalize-openroute-route.ts`. Esto acoplaba el pipeline a la implementación de lectura de archivos locales.

El Repository Pattern introduce una interfaz entre el pipeline y la fuente de datos. El pipeline declara qué necesita (`getFeatures()`, `getAll()`), sin importar de dónde vienen los datos. Para migrar a Supabase, solo se reemplaza la implementación — el pipeline no cambia.

Beneficios concretos en esta fase:
- El pipeline no sabe si los datos vienen de un archivo, una DB o un mock de test.
- Los tests futuros pueden inyectar implementaciones en memoria sin tocar el sistema de archivos.
- La migración a Supabase queda localizada en `lib/repositories/`.

---

## Qué sigue usando JSON/GeoJSON local

| Componente | Fuente | Notas |
|-----------|--------|-------|
| `LocalCommuneRepository` | `comunas-cali.geojson` | Delega a `loadCommunesGeoJSON()` |
| `LocalCommuneRiskRepository` | `comunas-risk.json` | Delega a `loadCommunesRisk()` |
| `lib/geo/load-communes-geojson.ts` | Sistema de archivos local | Mantiene caché de módulo |
| `lib/risk/load-communes-risk.ts` | Sistema de archivos local | Mantiene caché de módulo |

Los loaders siguen existiendo como implementación interna. No se exponen al pipeline directamente.

---

## Qué queda preparado para Supabase/PostGIS

| Interfaz | Método | Migración futura |
|---------|--------|-----------------|
| `CommuneRepository` | `getFeatures()` | `SupabaseCommuneRepository` ejecuta `ST_AsGeoJSON` o devuelve features desde tabla `communes` |
| `CommuneRiskRepository` | `getAll()` | `SupabaseCommuneRiskRepository` ejecuta `SELECT * FROM commune_risk_profiles` |

Para activar Supabase:
1. Crear `SupabaseCommuneRepository implements CommuneRepository`
2. Crear `SupabaseCommuneRiskRepository implements CommuneRiskRepository`
3. Sustituir los singletons exportados en `local-commune-repository.ts` y `local-commune-risk-repository.ts`
4. El pipeline no cambia.

La función `findCommuneForPoint()` (ray-casting en JS) puede migrarse a una query `ST_Within` sin cambiar las interfaces de repository — solo el contenido de `getFeatures()` o, alternativamente, un método nuevo `findByPoint(lat, lng)` en la interfaz.

---

## Capas y límites

```
pipeline (normalize-openroute-route.ts)
    │  importa
    ▼
repositories/  (interfaces + implementaciones)
    │  importa
    ▼
loaders / geo /  (acceso a sistema de archivos o red)
    │  lee
    ▼
public/data/  (fuentes de datos locales)
```

**Regla:** el pipeline no importa loaders directamente. Los components del cliente no importan loaders ni repositories.

---

## Limitaciones actuales de la capa de datos

| Limitación | Impacto |
|-----------|---------|
| Sin base de datos | No hay persistencia de análisis ni histórico |
| Dataset de riesgo simulado | Valores no calibrados con datos reales |
| Caché en memoria de proceso | Se pierde en cada deploy o reinicio |
| Join espacial en JS | Correcto, pero no escalable a datasets grandes |
| Sin connection pooling | No aplica hoy; crítico cuando llegue Supabase |

---

## No hay conexión a Supabase

El scaffold de Supabase no está creado todavía. No existe `SUPABASE_URL` ni `SUPABASE_ANON_KEY` en el proyecto. Los archivos `lib/repositories/` actuales no dependen de ningún cliente de Supabase.
