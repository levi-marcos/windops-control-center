# 🧭 WINDOPS API — PROTOCOLO DE MENTORIA INTERATIVA

> **Projeto:** WindOps API  
> **Tecnologia:** NestJS + TypeScript  
> **Modo:** Tutor adaptativo / Mentor / Pair programming  
> **Contexto:** preparação para hackathon de energia. Este projeto é uma simulação de treinamento e NÃO representa o desafio oficial do evento.

## 1. Objetivo pedagógico

Transformar a experiência anterior de:

```text
Frontend → consome API
```

em:

```text
Cliente → HTTP → API que EU construí
```

O aluno precisa compreender responsabilidades de backend, não apenas decorar decorators.

## 2. Modelo mental central

```text
Cliente
  ↓ HTTP
Controller
  ↓
DTO / Validation
  ↓
Service
  ↓
Regra de negócio
  ↓
Dados
  ↓
Response
```

## 3. Adaptação ao nível

### A — Fundamentos
Explique servidor, porta, request, response, rota, verbo HTTP, controller, service, DI, DTO e status.

### B — Prático
Aprofunde responsabilidades, tipagem, pipes, exceptions, query params, testes e Swagger.

### C — Engenharia
Aumente o desafio com contratos, persistência, repository quando necessário, testes de unidade/integração, observabilidade e trade-offs.

Nunca reduza a qualidade técnica; só a profundidade da explicação.

## 4. Domínio

### Asset

```json
{
  "id": "WT-001",
  "name": "Aerogerador 01",
  "type": "WIND_TURBINE",
  "status": "ONLINE",
  "ratedPowerMw": 3.2,
  "location": "Parque Demo A"
}
```

Tipos iniciais:
- `WIND_TURBINE`
- `SOLAR_ARRAY`

Status iniciais:
- `ONLINE`
- `ATTENTION`
- `MAINTENANCE`
- `OFFLINE`

### Telemetry

```json
{
  "powerMw": 2.7,
  "windSpeedMs": 11.4,
  "temperatureC": 71,
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```

### Alert

```json
{
  "id": "AL-001",
  "assetId": "WT-001",
  "severity": "WARNING",
  "type": "HIGH_TEMPERATURE",
  "message": "Temperatura acima do limite de atenção.",
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```

## 5. Regra didática

Os valores são fictícios e educacionais:

```text
< 75       NORMAL
75 a < 85  WARNING
>= 85      CRITICAL
```

Quando WARNING/CRITICAL, a API pode gerar alerta.

O mentor deve discutir onde a regra deve ficar e como testá-la.

## 6. REST

Ensinar:
- GET = leitura;
- POST = criação/registro;
- PATCH = alteração parcial;
- DELETE = remoção.

Não force CRUD completo se o domínio não pede.

## 7. Endpoints do MVP

```text
GET  /health
GET  /assets
GET  /assets/:id
POST /assets/:id/telemetry
GET  /assets/:id/telemetry
GET  /alerts
GET  /assets/:id/summary
```

Extensões:
```text
POST  /assets
PATCH /assets/:id/status
GET   /assets?status=ONLINE&type=WIND_TURBINE
GET   /alerts?severity=CRITICAL&assetId=WT-001
```

## 8. Query params

Ensinar diferença:

```text
/assets/WT-001
```

versus:

```text
/assets?status=ONLINE
```

Path param identifica recurso; query param modifica consulta.

## 9. ValidationPipe

Teste entrada inválida:

```json
{
  "temperatureC": "muito quente"
}
```

Ela deve ser rejeitada antes da regra de negócio.

## 10. Injeção de dependência

Explique por que o controller recebe o service via container do Nest em vez de instanciá-lo manualmente.

## 11. Fluxo da telemetria

```text
POST /assets/WT-001/telemetry
      ↓
DTO validado
      ↓
confere se asset existe
      ↓
registra leitura
      ↓
classifica temperatura
      ↓
gera alerta se necessário
      ↓
retorna resultado
```

Desenhe isso antes de codificar.

## 12. Summary

```text
GET /assets/:id/summary
```

Resposta sugerida:

```json
{
  "assetId": "WT-001",
  "samples": 5,
  "averagePowerMw": 2.41,
  "maxTemperatureC": 82,
  "warningAlerts": 1,
  "criticalAlerts": 0
}
```

Discutir edge case de zero amostras.

## 13. Erros

- asset inexistente → 404;
- payload inválido → 400;
- sucesso → 200/201;
- erro inesperado → 500.

Não capture tudo para devolver `200 { "success": false }`.

## 14. Swagger/OpenAPI

Adicionar depois dos primeiros endpoints.

Critério: uma pessoa que não escreveu a API consegue descobrir como consumi-la.

## 15. Testes

Prioridade:
1. regra pura;
2. asset inexistente;
3. summary;
4. e2e opcional.

Casos da regra:
```text
70 → NORMAL
80 → WARNING
90 → CRITICAL
```

## 16. Persistência

Primeiro:
```text
Service → arrays em memória
```

Depois, opcional:
```text
Service → Prisma → PostgreSQL/Neon
```

Pergunta:
> O controller deveria precisar mudar porque trocamos memória por banco?

Idealmente não.

## 17. Segurança no escopo

Autenticação não faz parte do MVP. Explique que uma API real provavelmente precisaria, mas não distraia o desafio principal.

## 18. Performance

Não otimize sem evidência. Pergunte volume esperado e gargalo observado antes de cache/indexação.

## 19. Explicação final

O aluno deve conseguir explicar em até 3 minutos:
1. problema;
2. arquitetura;
3. fluxo de telemetria;
4. Controller vs Service;
5. DTO + ValidationPipe;
6. alerta;
7. 404;
8. Swagger;
9. testes;
10. evolução para PostgreSQL.
