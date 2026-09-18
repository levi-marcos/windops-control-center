# ⚡ WindOps Control Center — Fullstack (Angular + NestJS)

Frontend e backend integrados do **Desafio Individual #4**: um control center para operação de ativos de energia renovável (eólico + solar).

- **Frontend:** Angular 22 (standalone, Signals, SCSS) em `web/`
- **Backend:** NestJS 12 + Prisma + Swagger em `api/`
- **Contrato REST:** `API_CONTRACT.md`

---

## 🚀 Como rodar

### 1. Backend (porta 3000)

```bash
cd api
npm install
npx prisma migrate dev        # prepara o SQLite (dev.db) e aplica migrations
npm run start:dev             # ou npm run build && npm run start:prod
```

- Swagger interativo: http://localhost:3000/docs
- Health: http://localhost:3000/health → `{ "status": "ok" }`
- Os 3 ativos de seed (`WT-001`, `WT-002`, `PV-001`) são criados no primeiro boot.

### 2. Frontend (porta 4200)

```bash
cd web
npm install
npm start                     # http://localhost:4200
```

> Em desenvolvimento o frontend aponta para `http://localhost:3000` (via `src/environments/environment.ts`). O CORS do NestJS libera explicitamente `http://localhost:4200` e `https://levi-marcos.github.io` — nada de `origin: '*'`.

## 📖 Rotas do frontend

| Rota | Página |
|---|---|
| `/` | Dashboard operacional (KPIs via `GET /dashboard/overview`) |
| `/assets` | Lista de ativos (filtros, loading/error/empty, link para detalhe) |
| `/assets/:id` | Detalhe — summary, telemetria recente e formulário de nova leitura |
| `/alerts` | Alertas WARNING/CRITICAL (severidade textual, não só cor) |

## 🧪 Testes

```bash
cd api
npm run test        # 16 unitários (regra de temperatura, service, alerts)
npm run test:e2e    # 8 e2e (health, 400/404, fluxo 90°C → CRITICAL, overview)
npm run lint

cd web
npm test            # 15 testes (health, lista, detalhe, dashboard, alertas, POST)
npm run build
```

## 🎯 Cenário obrigatório validado

```
WT-001 → POST telemetry (temperatureC = 90) → NestJS classifica CRITICAL
→ alerta AL-xxx criado → resposta volta → Angular atualiza summary/telemetria → UI reflete
```

Evidência: e2e do backend + testes de componente do frontend + validação manual via HTTP.

## ☁️ Deploy

### Frontend — GitHub Pages

O frontend é publicado em **GitHub Pages** (infra estática). O build de produção usa `src/environments/environment.prod.ts`.

```bash
cd web
ng build --configuration production --base-href /windops-control-center/
# publicar o conteúdo de dist/web/browser em https://SEU_USUARIO.github.io/windops-control-center/
```

### Backend — Render (para o demo online funcionar)

O frontend publicado depende de um backend público para exibir dados reais. O blueprint `api/render.yaml` está pronto:

1. Crie o serviço em https://dashboard.render.com/blueprint?repo=SEU_USUARIO/SEU_REPO
2. Associe um PostgreSQL e preencha `DATABASE_URL` no serviço.
3. Aponte `web/src/environments/environment.prod.ts` → `https://windops-api.onrender.com`.

> Sem o backend no ar, o site publicado exibe o estado "API Indisponível" (comportamento intencional de erro, não vazio).

## 🧭 Arquivos da mentoria

- `AGENTS.md` e `FULLSTACK_MENTOR_PROTOCOL.md` — regras do modo mentor
- `DESAFIO_04_WINDOPS_CONTROL_CENTER_FULLSTACK.md` — currículo do desafio
- `API_CONTRACT.md` — contrato REST (fonte de verdade)
- `WIREFRAMES.md` — decisões de interface
- `MENTORIA_STATE.md` — progresso, ADRs e evidências