# Safe Maps — Fuentes de datos

Descripción de los datos que usa el sistema, su origen, calidad, estado actual y criterios de evolución.

---

## Tipos de datos en el proyecto

Safe Maps trabaja con cuatro categorías de datos activas:

1. **Geometría administrativa** — límites de comunas de Cali
2. **Rutas urbanas** — geometría de calles por origen y destino
3. **Variables de riesgo** — indicadores por comuna (C, S, V, I, F)
4. **Resultados de análisis** — `RouteAnalysis` generado por el pipeline (efímero, sin persistencia aún)

---

## 1. Geometría de comunas

| Campo | Detalle |
|-------|---------|
| Fuente | Infraestructura de Datos Espaciales de Santiago de Cali (IDESC) |
| Proceso | Shapefile oficial → QGIS → reproyección EPSG:4326 → GeoJSON |
| Archivo local | `apps/web/public/data/comunas-cali.geojson` |
| Tabla Supabase | `communes` (MultiPolygon PostGIS, EPSG:4326) |
| Vista Supabase | `communes_geojson` (`ST_AsGeoJSON` para PostgREST) |
| Tipo | `FeatureCollection` de `MultiPolygon` |
| Comunas | 22 comunas oficiales |
| Estado | **Geometría oficial** — no simulada |

La geometría se sirve desde Supabase (`SupabaseCommuneRepository`) cuando `SAFE_MAPS_DATA_SOURCE=supabase`. En modo local, se lee desde el GeoJSON estático en memoria.

---

## 2. Rutas urbanas

| Campo | Detalle |
|-------|---------|
| Proveedor | OpenRouteService (ORS) |
| Tipo | Geometría real de calles (perfil driving-car) |
| Geocodificación | ORS Geocode API — devuelve coordenadas y label resuelto |
| Parámetros | `boundary.country=CO`, `focus.point` centrado en Cali |
| Estado | **Operativo** |

ORS recibe pares de coordenadas y devuelve una polilínea de puntos GPS que sigue la geometría real de las calles. Esta polilínea es la base de la segmentación.

Detalles del flujo en [docs/route-risk-pipeline.md](route-risk-pipeline.md).

---

## 3. Variables de riesgo por comuna

### Fuente activa (Supabase)

```
Tabla: commune_risk_profiles
JOIN: communes (para obtener comuna_numero)
```

### Fuente alternativa (local)

```
apps/web/public/data/comunas-risk.json
```

### Variables por comuna

| Variable | Campo DB | Descripción | Efecto en riesgo |
|----------|---------|-------------|-----------------|
| Criminalidad | `criminalidad` | Índice de actividad criminal | Aumenta riesgo |
| Seguridad | `seguridad` | Presencia de seguridad formal | Reduce riesgo |
| Vigilancia | `vigilancia` | Cobertura de vigilancia | Reduce riesgo |
| Iluminación | `iluminacion` | Nivel de iluminación pública | Reduce riesgo |
| Flujo de personas | `flujo_personas` | Flujo peatonal | Aumenta riesgo (modelo actual) |
| Puntuación | `risk_score` | Score agregado (0–100) | Referencia Euler |
| Nivel | `risk_level` | Clasificación (`low` / `medium` / `high`) | Color en mapa |

### Estado actual de los datos

> **Los datos de riesgo actuales son simulados.** No provienen de fuentes oficiales de seguridad ni criminalidad.

Están marcados como `data_quality: "simulated"` en la tabla `commune_risk_profiles`. Su propósito es:
- demostrar el funcionamiento del modelo Euler,
- permitir desarrollo y pruebas sin datos reales,
- servir como estructura lista para futura integración real.

### Distribución de riesgo simulado (referencia)

| Nivel | Comunas |
|-------|---------|
| Alto (≥70) | 13, 14, 15, 16, 20, 21 |
| Medio (40–69) | 1, 3, 4, 5, 7, 8, 9, 10, 11, 18 |
| Bajo (<40) | 2, 6, 12, 17, 19, 22 |

---

## 4. Trazabilidad de datos

La tabla `data_sources` en Supabase registra el origen y calidad de cada dataset:

| Campo | Propósito |
|-------|-----------|
| `name` | Nombre identificador del dataset |
| `source_type` | `official`, `academic`, `simulated`, `estimated` |
| `url` | URL de la fuente original |
| `reliability_level` | `alta`, `media`, `baja`, `simulada` |
| `collected_at` | Fecha de recolección |

Cada perfil de `commune_risk_profiles` tiene una referencia a `source_id` en `data_sources`.

---

## 5. Consideraciones sobre calidad de datos

### Normalización

Todas las variables se normalizan al rango `[0, 1]` antes de aplicarse al modelo diferencial (`X̃ = X / 100`). Esto garantiza que los coeficientes tengan un efecto comparable independientemente de la escala original.

### Trazabilidad futura

Al integrar datos reales, cada registro de riesgo debe incluir:
- fuente del dato (referencia a `data_sources`),
- fecha de recolección y período de validez (`valid_from`, `valid_to`),
- método de agregación por comuna,
- indicador de calidad (`data_quality: "real"` o `"estimated"`).

---

## 6. Consideraciones éticas

El uso de datos de riesgo urbano implica responsabilidades:

- **No estigmatizar zonas**: las puntuaciones de riesgo son indicadores relativos, no etiquetas definitivas.
- **No afirmar criminalidad real**: los datos actuales son simulados. Ningún resultado debe presentarse como predicción real de seguridad.
- **No usar datos personales**: el sistema no registra ni procesa información de usuarios.
- **Comunicar incertidumbre**: cualquier visualización debe dejar claro que el modelo es académico y experimental.
- **Evitar sesgos**: al integrar datos reales, auditar que no repliquen sesgos históricos de policiamiento o estigmatización.

---

## 7. Integración de datos reales — criterios

Cuando se integren fuentes reales, deben cumplir:

- Datos **abiertos o semiabiertos**, con licencia clara.
- Datos **agregados por zona**, no individuales.
- Fuentes preferidas para Cali:
  - Secretaría de Seguridad y Justicia de Cali
  - Datos abiertos del municipio (datosabiertos.cali.gov.co)
  - Indicadores de iluminación y presencia institucional disponibles públicamente
- El dataset debe indicar **fecha y período de recolección**.
- Usar indicadores indirectos cuando los datos directos de criminalidad sean sensibles o incompletos.
- Marcar `data_quality = "real"` o `"estimated"` en `commune_risk_profiles`.
