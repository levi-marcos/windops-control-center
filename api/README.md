# âš¡ WindOps API

Backend de OperaÃ§Ã£o e Alertas para Ativos de Energia â€” **Desafio Individual #3** (NestJS + TypeScript).

API REST que centraliza informaÃ§Ãµes operacionais de ativos de geraÃ§Ã£o renovÃ¡vel: cadastro de ativos, telemetria, classificaÃ§Ã£o de temperatura, alertas e resumos operacionais.

> âš ï¸ **Contexto:** simulaÃ§Ã£o de treinamento para o setor de energia. NÃ£o Ã© o desafio oficial do Hackathon Proenergia Summit 2026. Os limites de temperatura sÃ£o fictÃ­cios e didÃ¡ticos.

---

## ðŸ“‘ Ãndice

- [Stack](#-stack)
- [Modelo mental](#-%EF%B8%8F-modelo-mental)
- [DomÃ­nio](#-domÃ­nio)
- [Regra de negÃ³cio](#-regra-de-negÃ³cio)
- [Endpoints](#-endpoints)
- [Exemplos de uso](#-exemplos-de-uso)
- [CÃ³digos de erro](#-cÃ³digos-de-erro)
- [PersistÃªncia](#-persistÃªncia)
- [InstalaÃ§Ã£o](#%EF%B8%8F-instalaÃ§Ã£o)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Roadmap](#-roadmap)

---

## ðŸ§° Stack

| Tecnologia | Uso |
|---|---|
| NestJS 12 | Framework backend |
| TypeScript | Linguagem |
| Prisma 6 + SQLite (dev) / PostgreSQL (prod) | ORM e persistÃªncia |
| class-validator / class-transformer | ValidaÃ§Ã£o de DTOs (ValidationPipe) |
| Swagger / OpenAPI | DocumentaÃ§Ã£o interativa em `/docs` |
| Vitest + Supertest | Testes unitÃ¡rios e e2e |

**PersistÃªncia atual:** Prisma em PostgreSQL (produÃ§Ã£o) e SQLite (desenvolvimento local).

---

## ðŸ§  Modelo mental

```text
HTTP Request
    â†“
Controller  (recebe HTTP, delega)
    â†“
DTO / ValidationPipe  (bloqueia payload invÃ¡lido â†’ 400)
    â†“
Service  (regra de negÃ³cio)
    â†“
Dados  (memÃ³ria â†’ depois PostgreSQL)
    â†“
HTTP Response
```

**Controller** conhece HTTP e **delega**. **Service** concentra a regra de negÃ³cio. **Regra de temperatura** Ã© uma funÃ§Ã£o pura em `src/domain/temperature.ts` â€” nÃ£o depende de HTTP nem de NestJS, logo Ã© trivial de testar e reutilizar.

---

## ðŸ—‚ï¸ DomÃ­nio

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
- `type`: `WIND_TURBINE` | `SOLAR_ARRAY`
- `status`: `ONLINE` | `ATTENTION` | `MAINTENANCE` | `OFFLINE`

### Telemetry
```json
{
  "assetId": "WT-001",
  "powerMw": 2.7,
  "windSpeedMs": 11.4,
  "temperatureC": 71,
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```
Leitura de sensor que **pertence a um ativo** â€” nÃ£o existe sem ele. O cliente envia `powerMw`, `temperatureC` e `timestamp` (`windSpeedMs` Ã© opcional); `assetId`, `severity` e `alert` sÃ£o **derivados pela API**.

### Alert
```json
{
  "id": "AL-001",
  "assetId": "WT-001",
  "severity": "CRITICAL",
  "type": "HIGH_TEMPERATURE",
  "message": "Temperatura em nÃ­vel crÃ­tico.",
  "timestamp": "2026-09-13T12:00:00.000Z"
}
```
Alerta Ã© **gerado internamente** pela API ao processar telemetria. O cliente **nunca** envia um alerta. `severity` (severidade do alerta) Ã© independente de `status` (estado operacional do ativo).

---

## ðŸ“ Regra de negÃ³cio

> Valores fictÃ­cios e educacionais â€” nÃ£o representam limites reais de aerogeradores.

```text
temperatureC < 75          â†’ NORMAL
75 <= temperatureC < 85    â†’ WARNING
temperatureC >= 85         â†’ CRITICAL
```

Quando `WARNING` ou `CRITICAL`, a API cria um alerta `HIGH_TEMPERATURE`. ClassificaÃ§Ã£o **antes** da persistÃªncia da leitura.

---

## ðŸ”Œ Endpoints

| MÃ©todo | Rota | DescriÃ§Ã£o |
|---|---|---|
| `GET` | `/health` | Verifica se a API estÃ¡ no ar |
| `GET` | `/assets` | Lista ativos (aceita `?status=` e `?type=`) |
| `GET` | `/assets/:id` | Busca ativo por ID (404 se nÃ£o existir) |
| `POST` | `/assets` | Cria ativo (409 se ID duplicado) |
| `PATCH` | `/assets/:id/status` | Atualiza status do ativo |
| `POST` | `/assets/:id/telemetry` | Registra leitura e classifica temperatura (201) |
| `GET` | `/assets/:id/telemetry` | Lista leituras do ativo |
| `GET` | `/assets/:id/summary` | Resumo operacional do ativo |
| `GET` | `/alerts` | Lista alertas (aceita `?severity=` e `?assetId=`) |
| `GET` | `/dashboard/overview` | KPIs agregados para o dashboard (contagem Ãºnica de ativos/alertas) |

**DocumentaÃ§Ã£o interativa (Swagger):** `GET /docs`

---

## ðŸ§ª Exemplos de uso

### 1. Listar ativos com filtro
```bash
curl "http://localhost:3000/assets?type=WIND_TURBINE&status=ONLINE"
```

### 2. Buscar ativo por ID
```bash
curl "http://localhost:3000/assets/WT-001"
```

### 3. Registrar telemetria (gera alerta em WARNING/CRITICAL)
```bash
curl -X POST "http://localhost:3000/assets/WT-001/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "powerMw": 2.7,
    "temperatureC": 90,
    "windSpeedMs": 11.4,
    "timestamp": "2026-09-13T12:00:00.000Z"
  }'
```
Resposta (201):
```json
{
  "assetId": "WT-001",
  "powerMw": 2.7,
  "windSpeedMs": 11.4,
  "temperatureC": 90,
  "timestamp": "2026-09-13T12:00:00.000Z",
  "severity": "CRITICAL",
  "alert": {
    "id": "AL-001",
    "assetId": "WT-001",
    "severity": "CRITICAL",
    "type": "HIGH_TEMPERATURE",
    "message": "Temperatura em nÃ­vel crÃ­tico.",
    "timestamp": "2026-09-13T12:00:00.000Z"
  }
}
```

### 4. Resumo do ativo
```bash
curl "http://localhost:3000/assets/WT-001/summary"
```
```json
{
  "assetId": "WT-001",
  "samples": 1,
  "averagePowerMw": 2.7,
  "maxTemperatureC": 90,
  "warningAlerts": 0,
  "criticalAlerts": 1
}
```
> Ativo sem telemetria retorna `samples: 0`, `averagePowerMw: 0` e `maxTemperatureC: null`.

### 5. Listar alertas com filtro
```bash
curl "http://localhost:3000/alerts?severity=CRITICAL"
```

### 6. KPIs do dashboard (endpoint agregado)
```bash
curl "http://localhost:3000/dashboard/overview"
```
```json
{
  "totalAssets": 3,
  "onlineAssets": 2,
  "attentionAssets": 0,
  "maintenanceAssets": 1,
  "criticalAlerts": 1,
  "totalAlerts": 2
}
```

---

## ðŸš¦ CÃ³digos de erro

| Status | Quando |
|---|---|
| `200` | Sucesso em leituras |
| `201` | Recurso criado (telemetria, asset) |
| `400` | Payload invÃ¡lido â€” barrado pelo ValidationPipe antes da regra |
| `404` | Recurso inexistente (`asset` nÃ£o encontrado) |
| `409` | Conflito (ID de asset duplicado) |
| `500` | Erro inesperado (nÃ£o tratado) |

---

## ðŸ’¾ PersistÃªncia

**ANTES (dados em memÃ³ria):**
```text
Service
    â†“
Array em memÃ³ria  â† reiniciou, perdeu
```

**DEPOIS (banco via Prisma):**
```text
Service
    â†“
PrismaService
    â†“
SQLite (dev) / PostgreSQL (produÃ§Ã£o)
```

### Modelos (schema em `prisma/schema.prisma`)
- **Asset** â€” ativo; o `id` Ã© a chave primÃ¡ria.
- **Telemetry** â€” leitura; pertence a um Asset (relaÃ§Ã£o `N:1`).
- **Alert** â€” alerta; pertence a um Asset (relaÃ§Ã£o `N:1`), gerado na telemetria.

### Pergunta-chave da mentoria
> Se trocarmos o banco, o **Controller** deveria mudar?

NÃ£o. Os controllers continuam chamando `assetsService.addTelemetry(...)` como antes â€” sÃ³ a implementaÃ§Ã£o interna do Service mudou (de array para `prisma.telemetry.create`). A troca memÃ³ria â†’ banco ficou encapsulada atrÃ¡s dos mesmos mÃ©todos.

### Desenvolvimento local (SQLite)
```bash
# .env contÃ©m: DATABASE_URL="file:./dev.db"
npx prisma migrate dev          # cria/atualiza o banco e aplica migrations
npm run start:dev
```

### ProduÃ§Ã£o (PostgreSQL/Neon)
```bash
# 1. troque o provider no prisma/schema.prisma: sqlite â†’ postgresql
# 2. defina a URL, ex.:
#    DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
# 3. gere a cli e aplique:
npx prisma generate
npx prisma migrate deploy
```

---

## ðŸ› ï¸ InstalaÃ§Ã£o

```bash
# 1. clone
git clone <seu-repo> windops-api
cd windops-api

# 2. dependÃªncias
npm install

# 3. preparar o banco (cria prisma/dev.db + cliente)
npx prisma migrate dev

# 4. desenvolvimento (watch mode)
npm run start:dev

# 5. produÃ§Ã£o
npm run build && npm run start:prod
```

A API sobe em `http://localhost:3000` (respeita `PORT` se definida). Os 3 ativos de exemplo (`WT-001`, `WT-002`, `PV-001`) sÃ£o semeados automaticamente no primeiro boot.

---

## ðŸ§ª Testes

```bash
# unitÃ¡rios (regra de temperatura, service de assets â€” Prisma mockado)
npm run test

# e2e (contratos HTTP completos com SQLite real)
npm run test:e2e

# build de produÃ§Ã£o
npm run build
```

Cobertura principal do comportamento:
| Caso | Resultado esperado |
|---|---|
| `temperatureC = 70` | `NORMAL`, sem alerta |
| `temperatureC = 80` | `WARNING`, alerta criado |
| `temperatureC = 90` | `CRITICAL`, alerta criado |
| `GET /assets/XYZ` | `404` |
| payload invÃ¡lido | `400` |
| summary com/sem dados | mÃ©tricas corretas / zeros + `null` |

---

## ðŸš€ Deploy

### API (Render) â€” deploy gratuito
1. Crie um repositÃ³rio no GitHub com este cÃ³digo.
2. Acesse: `https://dashboard.render.com/blueprint?repo=SEU_USUARIO/SEU_REPO` (o blueprint `render.yaml` jÃ¡ estÃ¡ configurado).
3. Associe um banco PostgreSQL (New â†’ PostgreSQL) e preencha a var `DATABASE_URL` no serviÃ§o.
4. Confirme o deploy. A API ficarÃ¡ em `https://windops-api-zo1o.onrender.com`.

> O comando `npx prisma migrate deploy` jÃ¡ roda no `startCommand` e aplica as migrations automaticamente.

### DocumentaÃ§Ã£o (GitHub Pages)
A pasta `docs/` contÃ©m uma pÃ¡gina Swagger UI estÃ¡tica (carregada por CDN) que consome `docs/openapi.json`.
- No GitHub: **Settings â†’ Pages â†’ Source: Deploy from a branch â†’ `main` â†’ `/docs`**.
- A pÃ¡gina fica em `https://SEU_USUARIO.github.io/SEU_REPO/`.

---

## ðŸ—ƒï¸ Estrutura do projeto

```text
src/
â”œâ”€â”€ domain/
â”‚   â””â”€â”€ temperature.ts          # funÃ§Ã£o pura da regra de classificaÃ§Ã£o
â”œâ”€â”€ prisma/
â”‚   â”œâ”€â”€ prisma.service.ts       # cliente Prisma (conecta/desconecta)
â”‚   â””â”€â”€ prisma.module.ts        # mÃ³dulo global que expÃµe o PrismaService
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ dto/
â”‚   â”‚   â”œâ”€â”€ create-asset.dto.ts
â”‚   â”‚   â”œâ”€â”€ create-telemetry.dto.ts
â”‚   â”‚   â””â”€â”€ update-asset-status.dto.ts
â”‚   â”œâ”€â”€ assets.controller.ts
â”‚   â”œâ”€â”€ assets.service.ts
â”‚   â””â”€â”€ assets.module.ts
â”œâ”€â”€ alerts/
â”‚   â”œâ”€â”€ alerts.controller.ts
â”‚   â”œâ”€â”€ alerts.service.ts
â”‚   â””â”€â”€ alerts.module.ts
â”œâ”€â”€ dashboard/
â”‚   â”œâ”€â”€ dashboard.controller.ts   # GET /dashboard/overview (KPIs agregados)
â”‚   â”œâ”€â”€ dashboard.service.ts
â”‚   â””â”€â”€ dashboard.module.ts
â”œâ”€â”€ app.controller.ts           # GET /health
â”œâ”€â”€ app.module.ts
â””â”€â”€ main.ts                     # bootstrap + ValidationPipe + Swagger
prisma/
â”‚   â”œâ”€â”€ schema.prisma            # modelos Asset, Telemetry, Alert
â”‚   â””â”€â”€ migrations/              # SQL de migraÃ§Ã£o versionado
docs/                           # pÃ¡gina estÃ¡tica do Swagger (GitHub Pages)
test/                           # testes e2e
render.yaml                     # blueprint de deploy no Render
```

**Fluxo de dependÃªncias (baby):**
```text
PrismaModule (@Global)  â†’  injeta PrismaService  â†’  usado por AssetsService e AlertsService
AssetsModule            â†’  importa AlertsModule   â†’  telemetria gera alertas
```

**DecisÃ£o de arquitetura:** a regra de classificaÃ§Ã£o vive em funÃ§Ã£o pura (fora de HTTP). ServiÃ§os usam Prisma e se tornaram `async` (o controller continua igual, sÃ³ devolvendo Promises). Tudo encapsulado atrÃ¡s dos mesmos mÃ©todos â€” pronta para trocar de banco sem tocar na camada HTTP.

---

## ðŸ—ºï¸ Roadmap

- [x] `GET /health`
- [x] `GET /assets`, `GET /assets/:id`, 404
- [x] `POST /assets/:id/telemetry` + `GET /assets/:id/telemetry`
- [x] DTOs + ValidationPipe (400)
- [x] Regra NORMAL/WARNING/CRITICAL + geraÃ§Ã£o de alerta
- [x] `GET /alerts`
- [x] `GET /assets/:id/summary`
- [x] `GET /dashboard/overview` (KPIs agregados)
- [x] Swagger em `/docs`
- [x] Testes (unit + e2e)
- [x] Prisma + SQLite (dev) / PostgreSQL (produÃ§Ã£o) â€” persistÃªncia real
- [ ] Logs estruturados