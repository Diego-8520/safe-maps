# apps/web — Safe Maps (Next.js)

Aplicación principal de Safe Maps. Contiene el frontend React/MapLibre y las API Routes server-side.

---

## Desarrollo local

```bash
# Desde la raíz del monorepo:
npm run dev --workspace=apps/web

# O desde este directorio:
npm run dev
```

Abrir `http://localhost:3000/map`

---

## Variables de entorno

Crear `apps/web/.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENROUTE_API_KEY` | Clave de API de OpenRouteService | Sí |
| `SAFE_MAPS_DATA_SOURCE` | `local` o `supabase` (default: `local`) | No |
| `SAFE_MAPS_SUPABASE_URL` | URL del proyecto Supabase | Solo si `=supabase` |
| `SAFE_MAPS_SUPABASE_PUBLISHABLE_KEY` | Clave anon/pública (RLS activo) | Solo si `=supabase` |
| `SAFE_MAPS_SUPABASE_SECRET_KEY` | Clave service_role (admin) | Opcional |

> Ninguna variable lleva prefijo `NEXT_PUBLIC_`. Todas son server-side únicamente.

---

## Scripts

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build de producción
npm run start   # Servidor de producción
npm run lint    # ESLint
```

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/routes/analyze` | Geocodifica, enruta, segmenta, aplica Euler |
| `GET` | `/api/communes/risk` | Perfiles de riesgo de las 22 comunas |
| `GET` | `/api/health/data-source` | Estado y conteo de la fuente de datos activa |

---

## Nota sobre Next.js

Esta aplicación usa **Next.js 16** con **React 19**. Algunas APIs y convenciones difieren de versiones anteriores. Consultar `node_modules/next/dist/docs/` antes de modificar configuración o APIs de Next.js.

Ver documentación completa del proyecto en `/docs/` desde la raíz del repositorio.
