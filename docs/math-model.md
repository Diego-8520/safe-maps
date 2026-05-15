# Safe Maps — Modelo matemático

Descripción del modelo diferencial que calcula cómo evoluciona el riesgo acumulado a lo largo de una ruta urbana.

---

## Objetivo matemático

Modelar **R(x)**: el riesgo acumulado en función de la distancia recorrida **x**.

En lugar de asignar un único valor de riesgo a toda una ruta, el modelo calcula cómo cambia el riesgo paso a paso según las condiciones del entorno en cada tramo.

---

## Variables del modelo

| Símbolo | Variable | Rango | Efecto en riesgo |
|---------|----------|-------|-----------------|
| R(x) | Riesgo acumulado | 0–100 | Variable de estado |
| x | Distancia recorrida | km | Variable independiente |
| Δx | Longitud del segmento | km | Paso de integración |
| C | Criminalidad | 0–100 | ↑ Aumenta riesgo |
| S | Seguridad | 0–100 | ↓ Reduce riesgo |
| V | Vigilancia | 0–100 | ↓ Reduce riesgo |
| I | Iluminación | 0–100 | ↓ Reduce riesgo |
| F | Flujo de personas | 0–100 | ↑ Aumenta riesgo |

---

## Normalización de variables

Antes de aplicar el modelo, cada variable se normaliza al rango `[0, 1]`:

```
X̃ = X / 100
```

Ejemplo: si `criminalidad = 70`, entonces `C̃ = 0.70`.

---

## Ecuación diferencial

El riesgo acumulado evoluciona hacia el riesgo local del segmento actual:

```
dR/dx = k · (L - R)
```

Donde `L` es `localRiskScore` del segmento y `k` controla qué tan rápido se ajusta el acumulado. En `euler-v1`, `k = 1`.

### Interpretación

- Si `L > R`, el riesgo acumulado sube hacia el riesgo local.
- Si `L < R`, el riesgo acumulado baja gradualmente hacia el riesgo local.
- Si `L = R`, el acumulado se mantiene estable.

---

## Método de Euler

El riesgo acumulado se calcula numéricamente segmento a segmento mediante el método de Euler:

```
R(n+1) = clamp( R(n) + k · (localRiskScore - R(n)) · Δx_km , 0, 100 )
```

Donde:
- `R(n)` es el riesgo acumulado al inicio del segmento n
- `localRiskScore` es el riesgo local del segmento/comuna actual
- `k` es la sensibilidad del ajuste hacia el riesgo local
- `Δx_km` es la longitud del segmento en kilómetros
- `clamp(·, 0, 100)` limita R al rango válido

---

## Condición inicial

```
R(0) = initialRiskScore = riesgo base/promedio de la comuna del punto de origen
```

Si el punto de origen no cae en una comuna conocida, se usa el fallback neutro `R(0) = 50`.

---

## Diferencia entre riesgo local y riesgo acumulado

| Concepto | Descripción |
|----------|-------------|
| **Riesgo local** | Puntuación de riesgo de la comuna del segmento (desde `getCommuneRiskRepository()`) |
| **Riesgo acumulado** | Evolución de R calculada por Euler, incorpora el efecto de todos los segmentos previos |

Un segmento de riesgo local alto en el tramo 5 no provoca un salto abrupto en el acumulado: el cambio depende de la longitud del segmento y del estado previo de R.

En la visualización, el mapa colorea cada tramo con `localRiskLevel` para mostrar el riesgo inmediato de la comuna actual. La gráfica Euler conserva `accumulatedRiskLevel` y `accumulatedRiskScore` para representar la evolución acumulada de la ruta, y ancla su primer punto en `R(0) = initialRiskScore` del origen.

---

## Umbrales de clasificación

```
R < 40      → bajo   (low)
40 ≤ R < 70 → medio  (medium)
R ≥ 70      → alto   (high)
```

Fuente única: `apps/web/lib/risk/risk-level.ts` → `scoreToRiskLevel()`.

---

## Ejemplo conceptual paso a paso

Supongamos una ruta con 3 segmentos, cada uno de 0.4 km:

| n | Segmento | localRiskScore | Δx | R(n) | R(n+1) |
|---|---------|----------------|----|------|--------|
| 0 | Inicio | - | - | 47.0 | 47.0 |
| 1 | Seg 1 | 38.3 | 0.4 | 47.0 | 43.5 |
| 2 | Seg 2 | 38.3 | 0.4 | 43.5 | 41.4 |
| 3 | Seg 3 | 60.0 | 0.4 | 41.4 | 48.8 |

El riesgo sube al entrar en un tramo peligroso y baja al entrar en una zona más segura, pero de forma gradual.

---

## Limitaciones del modelo

| Limitación | Descripción |
|-----------|-------------|
| Coeficientes no calibrados | Los valores a, b, d, e, h son estimaciones iniciales |
| Datos simulados | `comunas-risk.json` no proviene de fuentes reales |
| Sin variación temporal | El modelo no considera horario, día de semana o temporada |
| Sin interacción entre variables | El modelo es lineal; no captura efectos no lineales reales |
| Un solo perfil por comuna | Todo el segmento hereda el perfil de su comuna |
| No predice crimen | El modelo describe exposición relativa, no probabilidad real de incidentes |

---

## Futuras mejoras del modelo

- **Calibración con datos reales**: ajustar coeficientes usando registros históricos de incidentes.
- **Modelo no lineal**: añadir términos de interacción entre variables (ej. `C · (1 - S)`).
- **Pesos por horario**: ajustar coeficientes según hora del día.
- **Análisis de sensibilidad**: evaluar cómo cambia R al variar cada coeficiente.
- **Rutas alternativas**: comparar el riesgo acumulado final entre múltiples rutas.
- **Validación cruzada**: contrastar salidas del modelo con datos de incidentes reales.

Ver contexto técnico del pipeline en [docs/route-risk-pipeline.md](route-risk-pipeline.md).
