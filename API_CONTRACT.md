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

Resposta (201) — formato efetivo implementado:
```json
{
  "id": 5,
  "assetId": "WT-001",
  "powerMw": 2.8,
  "windSpeedMs": 10.2,
  "temperatureC": 80,
  "timestamp": "2026-09-15T12:00:00.000Z",
  "createdAt": "2026-09-15T12:00:00.010Z",
  "severity": "WARNING",
  "alert": {
    "id": "AL-003",
    "assetId": "WT-001",
    "severity": "WARNING",
    "type": "HIGH_TEMPERATURE",
    "message": "Temperatura acima do limite de atenção.",
    "timestamp": "2026-09-15T12:00:00.000Z",
    "createdAt": "2026-09-15T12:00:00.008Z"
  }
}
```

> **Decisão:** a resposta reutiliza a telemetria persistida com `severity` e `alert` anexados (flat), em vez do wrapper `{ telemetry, classification, alertCreated }`. A API schema real é a fonte de verdade; `API_CONTRACT.md` reflete o formato implementado.

400: body inválido. 404: asset inexistente.

Quando `severity = NORMAL`, o campo `alert` é `null` e nenhum alerta é criado.

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

## GET /dashboard/overview

Resposta:
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

> **Decisão registrada:** KPIs calculados no backend via `GET /dashboard/overview` (opção B do wireframe), em vez de aggregation no frontend (opção A). Vantagem: 1 request, regras de negócio concentradas no backend, reutilizável por qualquer cliente. Requisição existente nos endpoints obrigatórios do desafio.

A decisão frontend aggregation vs backend aggregation foi resolvida favorando **backend aggregation**.
