Safe Maps

Safe Maps es una plataforma web de análisis de riesgo urbano basada en visualización geoespacial, análisis urbano y ecuaciones diferenciales.

El proyecto busca modelar cómo evoluciona el riesgo a lo largo de una ruta urbana utilizando variables como criminalidad, seguridad, vigilancia, iluminación y flujo de personas.

La ciudad inicial del proyecto es:

Cali, Colombia.
Objetivo

Safe Maps NO busca reemplazar Google Maps o Waze.

El objetivo principal es:

aplicar matemáticas y ecuaciones diferenciales a un problema urbano real,
visualizar riesgo urbano sobre rutas reales,
integrar análisis espacial y visualización geográfica,
construir una plataforma moderna con enfoque académico y técnico.

El sistema permitirá analizar cómo cambia el riesgo durante un desplazamiento urbano y visualizarlo sobre mapas interactivos.

Estado actual del proyecto

Actualmente Safe Maps ya cuenta con:

Visualización geoespacial
integración funcional con MapLibre GL JS,
mapa interactivo real,
renderizado geoespacial estable,
soporte para GeoJSON oficiales,
visualización dinámica de comunas de Cali,
hover interactivo,
popup dinámico,
selección de comuna,
highlight visual,
leyenda de riesgo.
Datos urbanos
separación correcta entre geometría y dataset urbano,
integración dinámica GeoJSON + dataset de riesgo,
estructura preparada para futuros modelos matemáticos.
Interfaz
dashboard lateral moderno,
diseño oscuro moderno,
experiencia visual tipo plataforma geoespacial profesional,
arquitectura frontend modular.
Tecnologías
Frontend
Next.js App Router
TypeScript
Tailwind CSS
MapLibre GL JS
Infraestructura
GitHub
Vercel
Deploy automático
Arquitectura
Monorepo
Estructura del proyecto
safe-maps/
├── apps/
│ ├── web/
│ └── api/
│
├── data/
│ ├── raw/
│ ├── processed/
│ └── seeds/
│
├── docs/
│ ├── architecture.md
│ ├── geospatial-data.md
│ ├── risk-model.md
│ └── roadmap.md
│
├── README.md
└── .gitignore
Frontend principal
apps/web
Datos geoespaciales

Las comunas de Cali utilizadas actualmente son reales.

Fuente oficial:

Infraestructura de Datos Espaciales de Santiago de Cali (IDESC)

Proceso realizado:

Shapefile oficial
→ QGIS
→ EPSG:4326
→ GeoJSON compatible con MapLibre

Archivo principal:

apps/web/public/data/comunas-cali.geojson

Características:

22 comunas oficiales,
geometrías reales,
soporte MultiPolygon,
coordenadas válidas,
FeatureCollection válida.

Actualmente ya NO se usan:

polígonos mock,
zonas inventadas,
geometrías falsas.
Dataset urbano

Archivo actual:

apps/web/public/data/comunas-risk.json

El dataset actual es mock, pero estructurado correctamente para futuras integraciones reales.

Variables actuales:

riskScore
riskLevel
criminalidad
seguridad
vigilancia
iluminacion
flujoPersonas
Modelo matemático planeado
Modelo lineal

dx/dR=aC−bS

Donde:

R(x): riesgo acumulado,
x: distancia recorrida,
C: criminalidad,
S: seguridad.
Modelo no lineal

dx/dR==aC−bS−dV−eI+cC(10−S)+hF

Variables:

C: criminalidad,
S: seguridad,
V: vigilancia,
I: iluminación,
F: flujo de personas.
Método numérico

Método de Euler:

R_n+1 = R_n +f(C,S,V,I,F)⋅Δx

Roadmap
Fase actual

Safe Maps se encuentra actualmente en:

visualización geográfica real

- modelado urbano inicial
  Próximas fases
  Fase 2
  refinamiento del frontend geoespacial,
  análisis detallado por comuna,
  modularización de arquitectura frontend,
  datasets urbanos más sólidos.
  Fase 3
  integración OpenRouteService,
  rutas reales,
  segmentación espacial,
  intersecciones con comunas.
  Fase 4
  backend FastAPI,
  PostgreSQL + PostGIS,
  cálculo diferencial,
  Euler,
  riesgo acumulado.
  Fase 5
  optimización matemática,
  visualización avanzada,
  estadísticas,
  alertas urbanas,
  mejoras futuras.
  Tecnologías planeadas
  Backend
  FastAPI
  Python
  Pydantic
  SQLAlchemy
  GeoAlchemy2
  NumPy
  Shapely
  Base de datos
  PostgreSQL
  PostGIS
  Supabase
  APIs externas futuras
  OpenRouteService
  OpenStreetMap
  Objetivo visual

Safe Maps busca convertirse en una plataforma moderna de análisis urbano con:

mapas interactivos,
rutas reales,
análisis visual de riesgo,
dashboards urbanos,
visualización matemática,
experiencia visual profesional.
Estado actual importante

Actualmente el proyecto:

NO usa rutas reales todavía,
NO usa backend productivo todavía,
NO usa machine learning,
NO usa datos criminales en tiempo real.

El enfoque actual es consolidar correctamente:

arquitectura,
visualización geoespacial,
modelado urbano,
mantenibilidad,
escalabilidad.
Visión final

Safe Maps busca convertirse en:

un proyecto académico sólido,
una plataforma moderna de análisis geoespacial,
una demostración técnica de integración entre matemáticas y software,
y un proyecto de portafolio profesional.
