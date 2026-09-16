# ⚡ DESAFIO INDIVIDUAL #3 — WINDOPS API

## Backend de Operação e Alertas para Ativos de Energia

**Stack principal:** NestJS · TypeScript · REST · Swagger/OpenAPI  
**Bônus:** Prisma · PostgreSQL/Neon  
**Prazo sugerido desta turma:** 14/09/2026 às 14:00  
**Modo obrigatório:** OpenCode/Antigravity em Mentor Mode  
**Contexto:** simulação de treinamento para o setor de energia. **Não é o desafio oficial do Hackathon Proenergia Summit 2026.**

---

# 1. Cenário

Uma empresa que opera ativos de geração renovável precisa de uma API para centralizar informações operacionais.

A equipe precisa responder:

- quais ativos estão cadastrados?
- qual o status de cada um?
- quais leituras de telemetria chegaram?
- existe temperatura em nível de atenção?
- há alertas críticos?
- qual é o resumo recente de um ativo?

Sua missão é construir a primeira versão da **WindOps API**.

---

# 2. Objetivo pedagógico

Ao final você deve conseguir explicar:

- API REST;
- módulos, controllers e services no NestJS;
- injeção de dependência;
- DTO;
- `ValidationPipe`;
- regra de negócio;
- status HTTP;
- tratamento de 404;
- Swagger/OpenAPI;
- testes;
- evolução de memória para banco.

---

# 3. Domínio

## Asset

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

Tipos:
```text
WIND_TURBINE
SOLAR_ARRAY
```

Status:
```text
ONLINE
ATTENTION
MAINTENANCE
OFFLINE
```

## Telemetry

```json
{
  "powerMw": 2.7,
  "windSpeedMs": 11.4,
  "temperatureC": 71,
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```

## Alert

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

---

# 4. Regra de negócio

> Os valores são fictícios e usados somente para treinamento.

```text
temperatureC < 75
→ NORMAL

75 <= temperatureC < 85
→ WARNING

temperatureC >= 85
→ CRITICAL
```

Quando for `WARNING` ou `CRITICAL`, registrar alerta.

---

# 5. MVP obrigatório

```text
GET  /health

GET  /assets
GET  /assets/:id

POST /assets/:id/telemetry
GET  /assets/:id/telemetry

GET  /alerts
GET  /assets/:id/summary
```

Também obrigatório:

```text
[ ] NestJS
[ ] TypeScript
[ ] DTOs
[ ] ValidationPipe
[ ] 404
[ ] regra NORMAL/WARNING/CRITICAL
[ ] geração de alerta
[ ] Swagger
[ ] pelo menos teste da regra
[ ] README
[ ] build sem erro
```

---

# 6. Bônus

Somente depois do MVP:

```text
GET /assets?status=ONLINE&type=WIND_TURBINE
GET /alerts?severity=CRITICAL&assetId=WT-001
POST /assets
PATCH /assets/:id/status
Prisma + PostgreSQL/Neon
testes adicionais/e2e
logs estruturados
```

Bônus não compensa MVP quebrado.

---

# 7. Fase 0 — Diagnóstico

O tutor lê:

- `AGENTS.md`
- `WINDOPS_MENTOR_PROTOCOL.md`
- este arquivo
- `MENTORIA_STATE.md`
- `README.md`

Depois pergunta:

```text
A) iniciante
B) intermediário
C) avançado
```

Não escrever código antes da resposta.

---

# 8. Fase 1 — Entender o domínio

Desenhar:

```text
Asset
  ├── possui muitas → Telemetry
  └── pode gerar → Alert
```

Perguntas:

1. uma leitura existe sem asset?
2. alerta vem do cliente ou é calculado?
3. status do ativo é igual à severidade?
4. quais dados são entrada e quais são derivados?

Checkpoint:

> Por que `severity` não precisa vir no body da telemetria?

---

# 9. Fase 2 — Contrato HTTP

Montar antes do código:

| Método | Rota | Objetivo |
|---|---|---|
| GET | `/health` | verificar API |
| GET | `/assets` | listar ativos |
| GET | `/assets/:id` | buscar ativo |
| POST | `/assets/:id/telemetry` | registrar leitura |
| GET | `/assets/:id/telemetry` | consultar leituras |
| GET | `/alerts` | listar alertas |
| GET | `/assets/:id/summary` | resumo |

Explicar path param, query param, body, status e JSON.

---

# 10. Fase 3 — Setup NestJS

Verificar:

```bash
node -v
npm -v
nest --version
```

Criação sugerida:

```bash
nest new windops-api
```

Explicar:
- `main.ts`;
- `app.module.ts`;
- controller;
- service;
- module;
- `package.json`.

Validar servidor antes de avançar.

---

# 11. Fase 4 — Health

```text
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

Conceitos:
- controller;
- decorator;
- rota;
- 200.

---

# 12. Fase 5 — Assets

Dados iniciais em memória:

```text
WT-001
WT-002
PV-001
```

Endpoints:

```text
GET /assets
GET /assets/:id
```

Recurso inexistente:

```text
GET /assets/XYZ
→ 404
```

Checkpoint:

> Por que o controller não deveria procurar manualmente no array?

---

# 13. Fase 6 — Telemetria + DTO

Endpoint:

```text
POST /assets/:id/telemetry
```

Campos mínimos:

```text
powerMw
temperatureC
timestamp
```

`windSpeedMs` pode ser opcional.

Discutir timestamp antes de decidir o DTO.

---

# 14. Fase 7 — ValidationPipe

Teste válido:

```json
{
  "powerMw": 2.8,
  "temperatureC": 78,
  "windSpeedMs": 10.2,
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```

Teste inválido:

```json
{
  "powerMw": "muito",
  "temperatureC": "quente"
}
```

Esperado:

```text
400
```

Checkpoint:

> Por que queremos barrar isso antes da regra?

---

# 15. Fase 8 — Regra de alerta

Antes de codificar, comparar:

A) Controller  
B) Service  
C) função pura/helper  
D) DTO

O mentor recomenda com justificativa.

Casos:

```text
70 → NORMAL
80 → WARNING
90 → CRITICAL
```

WARNING/CRITICAL geram alerta.

---

# 16. Fase 9 — Alertas

```text
GET /alerts
```

Exemplo:

```json
[
  {
    "id": "AL-001",
    "assetId": "WT-001",
    "severity": "WARNING",
    "type": "HIGH_TEMPERATURE",
    "message": "Temperatura acima do limite de atenção.",
    "timestamp": "2026-09-13T12:00:00.000Z"
  }
]
```

Filtros só depois.

---

# 17. Fase 10 — Summary

```text
GET /assets/:id/summary
```

Resposta sugerida:

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

Edge case: ativo sem telemetria.

Pergunta:

> Para métrica sem amostra, usamos zero, null ou outro contrato?

Apresentar opções e registrar decisão.

---

# 18. Fase 11 — Swagger

Adicionar depois de endpoints funcionais.

Objetivo:

outra pessoa deve conseguir descobrir como consumir a API sem ler o código.

Rota sugerida:

```text
/docs
```

---

# 19. Fase 12 — Testes

Obrigatório:

```text
70 → NORMAL
80 → WARNING
90 → CRITICAL
```

Recomendados:
- asset inexistente;
- summary.

O tutor explica Arrange / Act / Assert conforme o nível.

---

# 20. Fase 13 — Filtros

Bônus:

```text
GET /assets?status=ONLINE&type=WIND_TURBINE
GET /alerts?severity=CRITICAL&assetId=WT-001
```

Não criar mecanismo genérico de filtro.

---

# 21. Fase 14 — Persistência opcional

Só com MVP pronto.

Comparar:

```text
Service → Arrays
```

com:

```text
Service → PrismaService → PostgreSQL/Neon
```

Pergunta:

> Quais controllers deveriam precisar mudar?

Idealmente nenhum ou o mínimo.

---

# 22. Fase 15 — Auditoria

Corretude:
```text
[ ] rotas
[ ] 404
[ ] 400
[ ] regra de alerta
```

Arquitetura:
```text
[ ] controllers pequenos
[ ] regra fora de HTTP
[ ] services coerentes
[ ] sem abstração inútil
```

Qualidade:
```text
[ ] build
[ ] testes
[ ] Swagger
[ ] README
```

---

# 23. Fase 16 — Explicação final

Em até 3 minutos:

1. problema;
2. arquitetura;
3. fluxo da telemetria;
4. Controller vs Service;
5. DTO + ValidationPipe;
6. alerta;
7. 404;
8. Swagger;
9. testes;
10. evolução para PostgreSQL.

O mentor ouve primeiro; não entrega fala decorada antes.

---

# 24. Estrutura sugerida, não dogmática

```text
src/
├── assets/
│   ├── dto/
│   ├── assets.controller.ts
│   ├── assets.service.ts
│   └── assets.module.ts
├── alerts/
│   ├── alerts.controller.ts
│   ├── alerts.service.ts
│   └── alerts.module.ts
├── health/
│   └── health.controller.ts
├── app.module.ts
└── main.ts
```

Se Alerts ainda for pequeno, pode ficar junto de Assets. A decisão deve ser explicada.

---

# 25. Critérios de aceite

```text
[ ] Projeto NestJS executa
[ ] GET /health
[ ] GET /assets
[ ] GET /assets/:id
[ ] 404 para asset inexistente
[ ] POST telemetry
[ ] GET telemetry
[ ] DTO
[ ] validação 400
[ ] classificação
[ ] geração de alerta
[ ] GET /alerts
[ ] GET summary
[ ] Swagger
[ ] teste da regra
[ ] README
[ ] build sem erro
```

---

# 26. Entrega

1. repositório Git;
2. README;
3. instruções para instalar/rodar/testar;
4. URL local do Swagger;
5. exemplos de requests;
6. testes passando;
7. `MENTORIA_STATE.md` atualizado.

---

# 27. Rubrica interna

| Critério | Peso |
|---|---:|
| API funcional + contratos HTTP | 25 |
| Arquitetura/responsabilidades | 20 |
| DTOs, validação e erros | 15 |
| Regra de negócio | 15 |
| Testes | 10 |
| Swagger + README | 10 |
| Explicação técnica | 5 |

Total: 100.

> Não vence quem gerou mais arquivos com IA.
> Vence quem consegue explicar, validar, modificar e depurar o que construiu.
