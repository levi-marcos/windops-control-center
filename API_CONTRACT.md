# 📜 API CONTRACT — WindOps Control Center

## GET /health

200:
```json
{ "status": "ok" }
```

## GET /assets

200:
```json
[
  {
    "id": "WT-001",
    "name": "Aerogerador 01",
    "type": "WIND_TURBINE",
    "status": "ONLINE",
    "ratedPowerMw": 3.2,
    "location": "Parque Demo A"
  }
]
```

## GET /assets/:id

200: Asset

404: asset inexistente.

## GET /assets/:id/telemetry

200:
```json
[
  {
    "assetId": "WT-001",
    "powerMw": 2.7,
    "windSpeedMs": 11.4,
    "temperatureC": 71,
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
]
```

## POST /assets/:id/telemetry

Body:
```json
{
  "powerMw": 2.8,
  "windSpeedMs": 10.2,
  "temperatureC": 80,
  "timestamp": "2026-09-15T12:00:00.000Z"
}
```

Resposta sugerida:
```json
{
  "telemetry": {
    "assetId": "WT-001",
    "powerMw": 2.8,
    "windSpeedMs": 10.2,
    "temperatureC": 80,
    "timestamp": "2026-09-15T12:00:00.000Z"
  },
  "classification": "WARNING",
  "alertCreated": true
}
```

400: body inválido. 404: asset inexistente.

## GET /alerts

200:
```json
[
  {
    "id": "AL-001",
    "assetId": "WT-001",
    "severity": "WARNING",
    "type": "HIGH_TEMPERATURE",
    "message": "Temperatura acima do limite de atenção.",
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
]
```

## GET /assets/:id/summary

200:
```json
{
  "assetId": "WT-001",
  "samples": 3,
  "averagePowerMw": 2.5,
  "maxTemperatureC": 82,
  "warningAlerts": 1,
  "criticalAlerts": 0
}
```

## GET /dashboard/overview — opcional

```json
{
  "totalAssets": 3,
  "onlineAssets": 2,
  "attentionAssets": 1,
  "maintenanceAssets": 0,
  "criticalAlerts": 1,
  "totalAlerts": 4
}
```

A decisão frontend aggregation vs backend aggregation deve ser registrada.
