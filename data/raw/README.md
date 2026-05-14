# data/raw — Raw source files

Raw input data. **Never committed to git** (see root `.gitignore`).

## Expected files

| File | Description | Source |
|------|-------------|--------|
| `safe_maps_dataset_db_ready.xlsx` | Main dataset: communas, risk variables, crime indicators, time windows | Academic / Secretaría de Seguridad |
| `comunas-cali/` | Original commune shapefiles or GeoJSON from IDESC | IDESC (Instituto para la Gestión y Desarrollo Sostenible de Cali) |

## How to obtain

Place `safe_maps_dataset_db_ready.xlsx` in this directory before running:

```bash
npm run prepare-seeds     # at repo root (requires xlsx installed)
```

## Sheets expected in Excel

| Sheet | Purpose |
|-------|---------|
| `dim_zonas` | Commune identifiers and names |
| `variables_modelo` | Risk variables in 0–10 scale → normalized to 0–100 |
| `fact_homicidios_anual` | Annual homicide counts by commune |
| `dim_horarios_riesgo` | Risk levels by time window |
| `data_sources` | (optional) Source registry |
