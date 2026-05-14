# Safe Maps

Plataforma web académica de análisis urbano y riesgo geoespacial, enfocada en Santiago de Cali, Colombia.

---

## ¿Qué es Safe Maps?

Safe Maps analiza cómo evoluciona el riesgo durante un desplazamiento urbano y lo visualiza sobre un mapa interactivo con rutas reales.

**No es** un reemplazo de Google Maps o Waze.  
**Es** una plataforma que integra visualización geográfica, segmentación espacial y ecuaciones diferenciales aplicadas a un problema urbano real.

---

## Objetivo principal

Modelar y visualizar el **riesgo acumulado** a lo largo de una ruta urbana, utilizando variables como criminalidad, seguridad, vigilancia, iluminación y flujo de personas, procesadas mediante el **método de Euler**.

---

## Estado actual (mayo 2026)

El pipeline de análisis de rutas está operativo de extremo a extremo:

- Mapa interactivo con MapLibre GL JS
- Rutas reales por calles via OpenRouteService
- Geocodificación con labels resueltos mostrados en la UI
- Segmentación espacial por distancia (~400 m por segmento, Haversine)
- Asignación de comuna oficial por segmento (ray-casting)
- Riesgo local por segmento (dataset `comunas-risk.json`, simulado)
- Riesgo acumulado por modelo diferencial Euler (Euler v1)
- Ruta coloreada por nivel de riesgo acumulado
- Gráfica SVG de evolución de riesgo Euler
- Panel explicativo del modelo diferencial
- Panel de segmentos por tramo

> **Datos de riesgo:** simulados. **Geometría de comunas:** oficial (IDESC/QGIS).  
> **Modelo:** académico/experimental. No representa predicción criminal real.

---

## Visión final

| Área | Estado |
|------|--------|
| Frontend geoespacial | Implementado |
| Rutas reales (ORS) | Implementado |
| Modelo Euler | Implementado |
| Datos de riesgo reales | Pendiente |
| Base de datos (Supabase/PostGIS) | Pendiente |
| Rutas alternativas comparadas | Pendiente |
| Persistencia de análisis | Pendiente |
| Geocoding confidence UI | Pendiente |

---

## Stack tecnológico

**Frontend**
- Next.js App Router
- TypeScript
- Tailwind CSS
- MapLibre GL JS

**API**
- Next.js API Routes (server-side)
- OpenRouteService (geocodificación y ruteo)

**Infraestructura**
- GitHub
- Vercel (deploy automático)

**Fase futura**
- Supabase (PostgreSQL + PostGIS)

---

## Flujo principal

```
Usuario ingresa origen y destino
         │
         ▼
analyzeRoute()   →   POST /api/routes/analyze
         │
         ├── geocodeAddress(origin, destination)   → coordenadas + labels resueltos
         │
         ├── getDrivingRoute()                     → geometría real por calles (ORS)
         │
         ├── segmentByDistance()                   → tramos ~400 m
         │
         ├── findCommuneForPoint()                 → communeId por segmento
         │
         ├── findRiskByCommune()                   → variables locales (C, S, V, I, F)
         │
         └── calculateEulerAccumulatedRouteRisk()  → R acumulado por segmento
                          │
                          ▼
               Frontend renderiza:
               - Ruta coloreada por riesgo
               - Gráfica Euler
               - Panel de segmentos
               - Panel del modelo
```

---

## Cómo ejecutar localmente

```bash
# Clonar el repositorio
git clone https://github.com/Diego-8520/safe-maps.git
cd safe-maps

# Instalar dependencias
npm install

# Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local
# Editar apps/web/.env.local y agregar:
# OPENROUTE_API_KEY=tu_clave_aqui

# Ejecutar en desarrollo
npm run dev --workspace=apps/web
```

Abrir `http://localhost:3000/map`

---

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENROUTE_API_KEY` | Clave de API de OpenRouteService | Sí |

> **Importante:** La clave de OpenRouteService debe mantenerse **server-side**.  
> **No usar** `NEXT_PUBLIC_OPENROUTE_API_KEY`. Exponer la clave al frontend es un error de seguridad.

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/architecture.md](docs/architecture.md) | Arquitectura técnica del sistema |
| [docs/data-sources.md](docs/data-sources.md) | Fuentes de datos y evolución |
| [docs/math-model.md](docs/math-model.md) | Modelo matemático Euler y variables |
| [docs/roadmap.md](docs/roadmap.md) | Fases del proyecto y prioridades |
| [docs/route-risk-pipeline.md](docs/route-risk-pipeline.md) | Flujo técnico completo del pipeline |

---

## Nota académica

Safe Maps es un proyecto académico y de portafolio técnico.  
El modelo matemático es experimental y no representa un sistema oficial de predicción de seguridad urbana.  
Los datos de riesgo actuales son simulados. Las geometrías de comunas provienen de la fuente oficial IDESC del municipio de Cali.
