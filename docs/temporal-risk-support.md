# Safe Maps — Soporte temporal de riesgo

Describe por qué se prepara la arquitectura para soporte temporal, cómo afectará al modelo Euler en el futuro, y cuáles son las diferencias conceptuales entre los tipos de riesgo.

---

## Por qué se prepara soporte temporal

El riesgo urbano no es estático. Un corredor seguro a las 14:00 puede ser de alto riesgo a las 23:00. Un dataset de criminalidad de 2021 no refleja la situación de 2024. El modelo actual usa un único snapshot de riesgo (simulado, sin fecha). Esto es aceptable para el prototipo, pero insostenible para una herramienta de uso real.

El soporte temporal se prepara ahora, antes de que sea urgente, para:

1. Evitar que el pipeline quede acoplado a un único archivo estático.
2. Permitir que los repositories seleccionen el dataset correcto según el contexto temporal.
3. Que el integrador Euler pueda recibir datos calibrados por período sin cambiar su fórmula.
4. Que los resultados almacenados en Supabase lleven metadata de cuándo y con qué datos se calcularon.

**Estado actual:** ningún componente temporal está activo. Los tipos y placeholders existen para guiar la implementación futura sin modificar el pipeline presente.

---

## Tres tipos de riesgo

### Riesgo espacial (local)

Es el riesgo inherente a un punto geográfico, derivado de los indicadores de la comuna donde ese punto se encuentra.

```
localRiskScore = f(criminalidad, seguridad, vigilancia, iluminacion, flujoPersonas)
```

Depende de la ubicación. No depende del tiempo de tránsito ni del recorrido previo. Es la entrada al integrador Euler.

### Riesgo acumulado (Euler)

Es el riesgo que un viajero acumula a lo largo de una ruta a medida que avanza por sectores de distinto riesgo espacial.

```
R(x + Δx) = clamp(R(x) + dR/dx · Δx_km, 0, 100)
```

Depende del orden de los segmentos y de la longitud recorrida. No depende directamente del tiempo de reloj — pero sí del dataset de riesgo espacial que lo alimenta.

### Riesgo temporal

Es la variación del riesgo espacial según el momento del día, la semana o el período histórico. No existe todavía como valor calculado en el pipeline.

```
localRiskScore(t) = f(criminalidad_t, seguridad_t, ...)
```

Donde los indicadores `_t` provienen de un snapshot calibrado para el período `t`. El integrador Euler no cambia — cambian los datos de entrada.

---

## Cómo afectará al modelo Euler en el futuro

El integrador Euler (`calculateEulerRiskEvolution`) es una función pura: recibe segmentos con sus scores ya calculados y produce la evolución acumulada. **No necesita cambiar.**

El cambio ocurre en la capa de acceso a datos:

```
Hoy:
  localCommuneRiskRepository.getAll()
  → siempre retorna comunas-risk.json

Futuro:
  localCommuneRiskRepository.getAll(temporalContext)
  → retorna el dataset correcto para el período y ventana horaria
```

El pipeline (`normalize-openroute-route.ts`) recibirá un `RiskTemporalContext` (resuelto por `resolveRiskTemporalContext()`) y lo pasará al repository. Los scores por segmento cambiarán según el período. La fórmula Euler permanece idéntica.

---

## Ejemplos futuros

### Horario nocturno

Un usuario solicita una ruta a las 23:15. El sistema detecta que corresponde al `TimeWindow` "Nocturno" (22:00–06:00). El repository carga un dataset donde `criminalidad` y `flujoPersonas` tienen valores calibrados para esa franja.

El `localRiskScore` de los segmentos cambia. El integrador Euler los procesa igual. El `finalRiskScore` resulta más alto que el calculado para la misma ruta a las 14:00.

### Día festivo

`resolveRiskTemporalContext()` detecta que hoy es festivo (vía calendario de Colombia). Carga un dataset específico para días festivos donde `seguridad` (presencia policial) es menor y `flujoPersonas` en zonas céntricas es mayor.

### Datasets anuales

El equipo ingesta datos reales de criminalidad de 2023 en `data/raw/`. Se procesan y normalizan a `data/processed/comunas-risk-2023.json`. El repository registra un `AnnualDatasetReference` apuntando a ese archivo. Cuando un usuario solicita análisis histórico para ese año, el repository selecciona el snapshot correcto.

---

## Tipos introducidos

| Tipo | Archivo | Propósito |
|------|---------|-----------|
| `RiskTimeGranularity` | `lib/types/time.ts` | Enum de granularidades temporales |
| `TimeWindow` | `lib/types/time.ts` | Bloque horario con start/end hour |
| `DatasetPeriod` | `lib/types/time.ts` | Año + semestre + label de un snapshot |
| `RiskTemporalContext` | `lib/types/time.ts` | Contexto temporal resuelto para una query |
| `AnnualDatasetReference` | `lib/types/time.ts` | Puntero a un archivo de dataset histórico |
| `RiskSnapshotMetadata` | `lib/types/time.ts` | Auditoría de resultados almacenados |
| `RiskModelVersion` | `lib/types/model-version.ts` | Discriminante del modelo activo |
| `RiskModelMetadata` | `lib/types/model-version.ts` | Descriptor completo de un modelo |
| `RiskModelCoefficientSet` | `lib/types/model-version.ts` | Mapa genérico de coeficientes |
| `RiskModelVariableMeta` | `lib/types/model-version.ts` | Metadata por variable (UI, docs) |

---

## Placeholders activos

| Archivo | Estado | Descripción |
|--------|--------|-------------|
| `lib/risk/temporal/resolve-risk-temporal-context.ts` | Placeholder | Retorna `{ isDefault: true }` — sin lógica temporal |
| `lib/risk/temporal/risk-time-fallbacks.ts` | Placeholder | Constantes de ventana y período por defecto |

---

## Posibles conflictos con PostGIS / Supabase

| Área | Riesgo | Consideración |
|------|--------|---------------|
| `AnnualDatasetReference.sourceFile` | Apunta a archivos locales | En Supabase, el "sourceFile" puede ser un `dataset_id` en una tabla `risk_datasets` |
| `RiskSnapshotMetadata.capturedAt` | Timestamp de string | PostgreSQL usará `TIMESTAMPTZ` — la serialización ISO 8601 es compatible |
| `DatasetPeriod.semester` | Opcional `1 | 2` | En DB, modelar como columna nullable `INTEGER CHECK (semester IN (1, 2))` |
| `TimeWindow.endHour < startHour` | Ventanas que cruzan medianoche (22–06) | Requiere lógica de comparación modular; documentar en la implementación de `resolveRiskTemporalContext` |
| Caché de módulo en loaders | El caché actual no soporta múltiples datasets | Cuando los repositories acepten `RiskTemporalContext`, el caché debe ser por período, no global |
