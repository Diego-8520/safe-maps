# Safe Maps — Fuentes de datos

Descripción de los datos que usa el sistema, su origen, calidad, estado actual y evolución prevista.

---

## Tipos de datos en el proyecto

Safe Maps trabaja con cinco categorías de datos:

1. **Geometría administrativa** — límites de comunas de Cali
2. **Rutas urbanas** — geometría de calles por origen y destino
3. **Variables de riesgo** — indicadores por comuna (C, S, V, I, F)
4. **Resultados de análisis** — `RouteAnalysis` generado por el pipeline
5. **Datos persistidos (fase futura)** — análisis guardados en base de datos

---

## 1. Geometría de comunas

| Campo | Detalle |
|-------|---------|
| Fuente | Infraestructura de Datos Espaciales de Santiago de Cali (IDESC) |
| Proceso | Shapefile oficial → QGIS → reproyección EPSG:4326 → GeoJSON |
| Archivo actual | `apps/web/public/data/comunas-cali.geojson` |
| Tipo | `FeatureCollection` de `MultiPolygon` |
| Comunas | 22 comunas oficiales |
| Estado | **Geométría oficial** — no simulada |

El GeoJSON se carga en memoria al iniciar el servidor (caché en proceso) mediante `loadCommunesGeoJSON()`.

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

Detalles del flujo de geocodificación en [docs/route-risk-pipeline.md](route-risk-pipeline.md).

---

## 3. Variables de riesgo por comuna

### Archivo actual

```
apps/web/public/data/comunas-risk.json
```

### Variables por comuna

| Variable | Descripción | Efecto en riesgo |
|----------|-------------|-----------------|
| `criminalidad` (C) | Índice de actividad criminal | Aumenta riesgo |
| `seguridad` (S) | Presencia de seguridad formal | Reduce riesgo |
| `vigilancia` (V) | Cobertura de vigilancia | Reduce riesgo |
| `iluminacion` (I) | Nivel de iluminación pública | Reduce riesgo |
| `flujoPersonas` (F) | Flujo peatonal | Aumenta riesgo (modelo actual) |
| `riskScore` | Puntuación local agregada (0–100) | Referencia inicial |
| `riskLevel` | Clasificación (`low` / `medium` / `high`) | Referencia inicial |

### Estado actual

> **Los datos actuales son simulados/mock.** No provienen de fuentes oficiales de seguridad ni criminalidad.

Su propósito es:
- demostrar el funcionamiento del modelo Euler,
- permitir desarrollo y pruebas sin datos reales,
- servir como estructura lista para futura integración real.

---

## 4. Consideraciones sobre calidad de datos

### Normalización

Todas las variables se normalizan al rango `[0, 1]` antes de aplicarse al modelo diferencial (`X̃ = X / 100`). Esto garantiza que los coeficientes tengan un efecto comparable independientemente de la escala original.

### Trazabilidad

En fases futuras, cada registro de riesgo deberá incluir:
- fuente del dato,
- fecha de recolección,
- método de agregación por comuna.

### Actualización

Los datos de riesgo son estáticos en la versión actual. La arquitectura futura contempla actualizaciones periódicas desacopladas del frontend.

---

## 5. Consideraciones éticas

El uso de datos de riesgo urbano implica responsabilidades:

- **No estigmatizar zonas**: las puntuaciones de riesgo son indicadores relativos, no etiquetas definitivas.
- **No afirmar criminalidad real**: los datos actuales son simulados. Ningún resultado debe presentarse como predicción real de seguridad.
- **No usar datos personales**: el sistema no registra ni procesa información de usuarios.
- **Comunicar incertidumbre**: cualquier visualización debe dejar claro que el modelo es académico y experimental.
- **Evitar sesgos**: al integrar datos reales, auditar que no repliquen sesgos históricos de policiamiento o estigmatización.

---

## 6. Datos reales — integración futura

Cuando se integren fuentes reales, deberán cumplir:

- Datos **abiertos o semiabiertos**, con licencia clara.
- Datos **agregados por zona**, no individuales.
- Fuentes preferidas para Cali:
  - Secretaría de Seguridad y Justicia de Cali
  - Datos abiertos del municipio (datosabiertos.cali.gov.co)
  - Indicadores de iluminación y presencia institucional disponibles públicamente
- El dataset debe indicar **fecha y período de recolección**.
- Usar indicadores indirectos cuando los datos directos de criminalidad sean sensibles o incompletos.

---

## 7. Migración futura a base de datos

En la fase de persistencia, los datos se moverán a Supabase (PostgreSQL + PostGIS).

### Tablas propuestas

| Tabla | Contenido |
|-------|-----------|
| `communes` | Geometría de comunas (PostGIS geometry) |
| `commune_risk_profiles` | Variables de riesgo por comuna y período |
| `route_analyses` | Análisis de rutas guardados |
| `route_segments` | Segmentos con riesgo local y acumulado |
| `data_sources` | Trazabilidad de fuentes por variable |

Ver detalles de evolución de infraestructura en [docs/roadmap.md](roadmap.md).
