# Safe Maps — Roadmap

Evolución del proyecto desde sus bases hasta la visión final. Cada fase agrega capacidades sobre las anteriores.

---

## Estado actual (mayo 2026) — Fases 1–4 completadas

El pipeline de análisis de rutas está operativo de extremo a extremo:

- Mapa interactivo real (MapLibre GL JS)
- Rutas reales por calles (OpenRouteService)
- Geocodificación con labels resueltos
- Comunas oficiales de Cali (22 comunas, GeoJSON IDESC)
- Segmentación de ruta por distancia (~400 m, Haversine)
- Asignación de comuna por segmento (ray-casting)
- Riesgo local por segmento (comunas-risk.json, simulado)
- Riesgo acumulado por modelo diferencial Euler (Euler v1)
- Ruta coloreada por nivel de riesgo acumulado
- Gráfica SVG de evolución de riesgo
- Panel del modelo diferencial (explicación académica)
- Panel de segmentos por tramo
- Modo demo eliminado

---

## Fase 1 — Base visual y mapas ✅

Establecer la infraestructura visual del proyecto.

- Proyecto Next.js con App Router y TypeScript
- Integración de MapLibre GL JS
- Mapa interactivo funcional
- Carga de comunas de Cali en GeoJSON
- Hover, popup y selección de comunas
- Leyenda de riesgo
- Diseño oscuro del sidebar

---

## Fase 2 — Rutas reales y geocodificación ✅

Conectar el sistema con rutas reales de calles.

- Integración con OpenRouteService
- Geocodificación de origen y destino
- Labels resueltos mostrados en el sidebar
- Geometría real de rutas por calles
- Enriquecimiento de direcciones para Cali
- Manejo de errores tipados de ORS

---

## Fase 3 — Segmentación espacial y riesgo local ✅

Dividir la ruta en tramos y asignar variables de riesgo.

- Segmentación por distancia Haversine (~400 m por tramo)
- Asignación de communeId por punto medio del segmento (ray-casting)
- Lookup de variables de riesgo desde comunas-risk.json
- Riesgo local por segmento (C, S, V, I, F)
- Fallback para segmentos fuera de comunas (variables neutras)

---

## Fase 4 — Modelo Euler y visualización matemática ✅

Calcular el riesgo acumulado y mostrarlo visualmente.

- Derivada de riesgo: `f(C, S, V, I, F) = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃`
- Integrador Euler paso a paso por segmento
- Clamp de R entre 0 y 100
- Ruta coloreada por nivel de riesgo acumulado (`low / medium / high`)
- Gráfica SVG de evolución de R (sin librerías externas)
- Panel explicativo del modelo
- Panel de segmentos con riesgo local y acumulado

---

## Fase 5 — Mejoras de UX y geocodificación ⏳ Pendiente

Mejorar la experiencia al introducir y resolver direcciones.

- **Geocoding confidence warning**: mostrar alerta cuando ORS devuelve baja confianza
- **Selección entre candidatos**: ofrecer los 3 resultados principales de geocodificación
- **Mensajes de error amigables**: distinguir error de red, dirección no encontrada, ruta no posible
- **Análisis textual de la ruta**: generar un resumen legible de los tramos de riesgo
- **Autocompletado de direcciones** (evaluación futura)

---

## Fase 6 — Datos reales o semirreales ⏳ Pendiente

Reemplazar los datos simulados con indicadores urbanos reales.

- Identificar fuentes abiertas para Cali (Secretaría de Seguridad, datos abiertos municipio)
- Transformar datos al esquema `comunas-risk.json`
- Documentar fuente, fecha y método de agregación por variable
- Auditar sesgos antes de publicar
- Mantener distinción entre datos directos (crimen) e indicadores indirectos (iluminación, flujo)

Ver criterios de calidad en [docs/data-sources.md](data-sources.md).

---

## Fase 7 — Base de datos: Supabase + PostGIS ⏳ Pendiente

Migrar datos estáticos a una base de datos geoespacial.

- Crear proyecto en Supabase
- Migración de comunas-cali.geojson a tabla PostGIS `communes`
- Tabla `commune_risk_profiles` con versiones por período
- Reemplazar ray-casting JS por `ST_Within` en PostGIS
- Cachear geocoding en base de datos
- Configurar Row Level Security (RLS)
- Scripts de seed en `data/seeds/`

---

## Fase 8 — Persistencia de análisis ⏳ Pendiente

Guardar y consultar análisis de rutas.

- Tabla `route_analyses` con metadatos del análisis
- Tabla `route_segments` con riesgo por segmento
- API para guardar un análisis tras ejecutarlo
- Historial de análisis (opcional, con sesión de usuario)
- Consulta de análisis previos por zona o rango de fechas

---

## Fase 9 — Rutas alternativas ⏳ Pendiente

Comparar múltiples rutas y elegir la de menor riesgo.

- Solicitar hasta 3 rutas alternativas a ORS
- Calcular Euler v1 para cada alternativa
- Comparar: riesgo acumulado final, distancia, tiempo estimado
- Visualizar las 3 rutas en el mapa con colores diferenciados
- Panel de comparación con recomendación

---

## Fase 10 — Presentación académica y portafolio ⏳ Pendiente

Preparar el proyecto para presentación pública.

- README completo con contexto académico
- Documentación técnica revisada y coherente
- Demo pública en Vercel con datos simulados
- Video o presentación explicativa del modelo
- Análisis de sensibilidad de coeficientes documentado
- Reflexión sobre limitaciones y ética del modelo

---

## Prioridades transversales

A lo largo de todas las fases:

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
