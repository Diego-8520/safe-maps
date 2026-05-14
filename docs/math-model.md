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

La derivada del riesgo respecto a la distancia:

```
dR/dx = a·C̃ − b·S̃ − d·Ṽ − e·Ĩ + h·F̃
```

### Coeficientes actuales

| Símbolo | Variable | Dirección | Coeficiente |
|---------|----------|-----------|-------------|
| a | Criminalidad | ↑ riesgo | 30 |
| b | Seguridad | ↓ riesgo | 15 |
| d | Vigilancia | ↓ riesgo | 10 |
| e | Iluminación | ↓ riesgo | 10 |
| h | Flujo personas | ↑ riesgo | 8 |

> **Los coeficientes son provisionales y experimentales.** No han sido calibrados con datos reales. Son puntos de partida para el modelo académico.

### Interpretación

- La **criminalidad** tiene el mayor peso: un segmento muy peligroso eleva fuertemente el riesgo.
- La **seguridad** y **vigilancia** actúan como amortiguadores.
- La **iluminación** reduce el riesgo pero con menor peso relativo.
- El **flujo de personas** aumenta el riesgo en el modelo actual, modelando la exposición a la actividad criminal. Este supuesto es discutible y puede revisarse.

---

## Método de Euler

El riesgo acumulado se calcula numéricamente segmento a segmento mediante el método de Euler:

```
R(n+1) = clamp( R(n) + f(C, S, V, I, F) · Δx_km , 0, 100 )
```

Donde:
- `R(n)` es el riesgo acumulado al inicio del segmento n
- `f(C, S, V, I, F)` es la derivada calculada con las variables de ese segmento
- `Δx_km` es la longitud del segmento en kilómetros
- `clamp(·, 0, 100)` limita R al rango válido

---

## Condición inicial

```
R(0) = localRiskScore del primer segmento
```

Si no hay segmentos, `R(0) = 50` (valor neutro).

---

## Diferencia entre riesgo local y riesgo acumulado

| Concepto | Descripción |
|----------|-------------|
| **Riesgo local** | Puntuación de riesgo de la comuna del segmento (`comunas-risk.json`) |
| **Riesgo acumulado** | Evolución de R calculada por Euler, incorpora el efecto de todos los segmentos previos |

Un segmento de riesgo local alto en el tramo 5 no provoca un salto abrupto en el acumulado: el cambio depende de la longitud del segmento y del estado previo de R.

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

| n | Segmento | C | S | V | I | F | f = dR/dx | Δx | R(n) | R(n+1) |
|---|---------|---|---|---|---|---|-----------|-----|------|--------|
| 0 | Inicio | — | — | — | — | — | — | — | 45 | 45 |
| 1 | Seg 1 | 60 | 40 | 50 | 60 | 30 | 18−6−5−6+2.4 = 3.4 | 0.4 | 45 | 46.4 |
| 2 | Seg 2 | 80 | 20 | 30 | 30 | 60 | 24−3−3−3+4.8 = 19.8 | 0.4 | 46.4 | 54.3 |
| 3 | Seg 3 | 30 | 70 | 70 | 80 | 20 | 9−10.5−7−8+1.6 = -14.9 | 0.4 | 54.3 | 48.4 |

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
