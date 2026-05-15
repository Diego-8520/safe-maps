# Safe Maps — Roadmap

Evolución del proyecto desde sus bases hasta la visión final. Cada fase agrega capacidades sobre las anteriores.

---

## Estado actual (mayo 2026) — Fases 1–7 completadas

El pipeline de análisis de rutas está operativo de extremo a extremo con datos desde Supabase:

- Mapa interactivo con MapLibre GL JS
- Rutas reales por calles (OpenRouteService)
- Geocodificación con labels resueltos
- Comunas oficiales de Cali (22 comunas, GeoJSON IDESC)
- Segmentación de ruta por distancia (~400 m, Haversine)
- Asignación de comuna por segmento (ray-casting)
- Riesgo local por segmento desde Supabase (`commune_risk_profiles`)
- Riesgo acumulado por modelo diferencial Euler (Euler v1)
- Ruta coloreada por nivel de riesgo local
- Puntos de inicio y fin de segmentos en el mapa
- Gráfica SVG de evolución de riesgo Euler
- Panel del modelo diferencial (fórmula y tabla de coeficientes)
- Panel de segmentos paginado (8 por página, navegación ‹ / ›)
- Selección de comuna con panel lateral actualizado desde estado React
- Repository Pattern con feature flag `SAFE_MAPS_DATA_SOURCE`
- Integración completa con Supabase: PostgreSQL + PostGIS + RLS
- `GET /api/communes/risk` como fuente única de verdad del riesgo

---

## Fase 1 — Base visual y mapas ✅

- Proyecto Next.js con App Router y TypeScript
- Integración de MapLibre GL JS
- Mapa interactivo funcional
- Carga de comunas de Cali en GeoJSON
- Hover, popup y selección de comunas
- Leyenda de riesgo
- Diseño oscuro del sidebar

---

## Fase 2 — Rutas reales y geocodificación ✅

- Integración con OpenRouteService
- Geocodificación de origen y destino
- Labels resueltos mostrados en el sidebar
- Geometría real de rutas por calles
- Enriquecimiento de direcciones para Cali
- Manejo de errores tipados de ORS

---

## Fase 3 — Segmentación espacial y riesgo local ✅

- Segmentación por distancia Haversine (~400 m por tramo)
- Asignación de communeId por punto medio del segmento (ray-casting)
- Lookup de variables de riesgo desde repository
- Riesgo local por segmento (C, S, V, I, F)
- Fallback para segmentos fuera de comunas (variables neutras)

---

## Fase 4 — Modelo Euler y visualización matemática ✅

- Derivada de riesgo: `dR/dx = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃`
- Integrador Euler paso a paso por segmento
- `R(n+1) = clamp(R(n) + k·(localRiskScore − R(n))·Δx_km, 0, 100)`
- Clamp de R entre 0 y 100
- Ruta coloreada por nivel de riesgo local
- Gráfica SVG de evolución de R (sin librerías externas)
- Panel explicativo del modelo
- Panel de segmentos con riesgo local y acumulado

---

## Fase 5 — UX: paginación de segmentos y puntos en mapa ✅

- Panel de segmentos paginado: 8 por página, botones ‹ / ›
- Contador de rango y páginas
- Reset automático de página al cambiar la ruta
- Puntos blancos de inicio y fin de segmento sobre el mapa
- Borde oscuro sutil en puntos para contraste sobre la ruta

---

## Fase 6 — Repository Pattern y fuente única de verdad ✅

- Interfaces `CommuneRepository` y `CommuneRiskRepository`
- Implementaciones locales (`LocalCommuneRepository`, `LocalCommuneRiskRepository`)
- Feature flag `SAFE_MAPS_DATA_SOURCE` en `repository-factory.ts`
- `GET /api/communes/risk` con `force-dynamic`
- `loadEnrichedGeojson()` consume `/api/communes/risk`
- `selectedCommuneId` en estado React; `selectedCommune` derivado via `useMemo`
- Eliminación de snapshots stale del mapa como fuente de datos del panel lateral

---

## Fase 7 — Supabase + PostGIS ✅

- Proyecto Supabase con PostgreSQL + PostGIS configurado
- Tablas: `communes`, `commune_risk_profiles`, `risk_model_versions`, `risk_model_coefficients`, `data_sources`, `annual_crime_indicators`, `risk_time_windows`
- Vista `communes_geojson` con `ST_AsGeoJSON`
- RLS activo en todas las tablas con políticas de lectura pública
- `SupabaseCommuneRepository` y `SupabaseCommuneRiskRepository` implementados
- Migraciones versionadas en `supabase/migrations/`
- Scripts de seed en `scripts/`
- Modo `SAFE_MAPS_DATA_SOURCE=supabase` operativo

---

## Fase 8 — Mejoras de UX y geocodificación ⏳ Pendiente

- **Geocoding confidence warning**: alerta cuando ORS devuelve baja confianza
- **Selección entre candidatos**: ofrecer los 3 mejores resultados de geocodificación
- **Mensajes de error amigables**: distinguir error de red, dirección no encontrada, ruta imposible
- **Análisis textual de la ruta**: resumen legible de los tramos de riesgo
- **Autocompletado de direcciones** (evaluación futura)

---

## Fase 9 — Datos reales o semirreales ⏳ Pendiente

- Identificar fuentes abiertas para Cali (Secretaría de Seguridad, datos.gov.co)
- Transformar datos al esquema `commune_risk_profiles` de Supabase
- Documentar fuente, fecha y método de agregación por variable
- Auditar sesgos antes de publicar
- Marcar perfiles como `data_quality: "real"` en lugar de `"simulated"`

Ver criterios de calidad en [docs/data-sources.md](data-sources.md).

---

## Fase 10 — Persistencia de análisis ⏳ Pendiente

- Tabla `route_analyses` con metadatos del análisis
- Tabla `route_segments` con riesgo por segmento
- API para guardar un análisis tras ejecutarlo
- Historial de análisis (opcional, con sesión de usuario)
- Consulta de análisis previos por zona o rango de fechas

---

## Fase 11 — Rutas alternativas ⏳ Pendiente

- Solicitar hasta 3 rutas alternativas a ORS
- Calcular Euler v1 para cada alternativa
- Comparar: riesgo acumulado final, distancia, tiempo estimado
- Visualizar las 3 rutas en el mapa con colores diferenciados
- Panel de comparación con recomendación

---

## Fase 12 — Presentación académica y portafolio ⏳ Pendiente

- Demo pública en Vercel con datos simulados
- Video o presentación explicativa del modelo
- Análisis de sensibilidad de coeficientes documentado
- Reflexión sobre limitaciones y ética del modelo

---

## Prioridades transversales

- **Precisión**: el modelo debe ser correcto antes de ser sofisticado.
- **Seguridad**: las claves nunca se exponen al cliente.
- **Mantenibilidad**: el código se mantiene legible y modular.
- **Escalabilidad**: las decisiones de hoy no deben bloquear las de mañana.
- **Claridad comunicativa**: la UI debe dejar claro que los resultados son académicos.

---

## Qué no se hará

| Fuera de alcance | Razón |
|-----------------|-------|
| Machine learning | Fuera del enfoque matemático diferencial del proyecto |
| Predicción criminal en tiempo real | Ética, privacidad y falta de datos |
| Navegación GPS paso a paso | No es el objetivo; existen soluciones comerciales |
| Datos personales de usuarios | Sin autenticación ni perfiles en el alcance actual |
| Reemplazar sistemas oficiales de seguridad | No es la visión del proyecto |
