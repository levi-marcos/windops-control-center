# âš¡ WindOps Control Center â€” Fullstack (Angular + NestJS)

Frontend e backend integrados do **Desafio Individual #4**: um control center para operaÃ§Ã£o de ativos de energia renovÃ¡vel (eÃ³lico + solar).

- **Frontend:** Angular 22 (standalone, Signals, SCSS) em `web/`
- **Backend:** NestJS 12 + Prisma + Swagger em `api/`
- **Contrato REST:** `API_CONTRACT.md`

---

## ðŸš€ Como rodar

### 1. Backend (porta 3000)

```bash
cd api
npm install
npx prisma migrate dev        # prepara o SQLite (dev.db) e aplica migrations
npm run start:dev             # ou npm run build && npm run start:prod
```

- Swagger interativo: http://localhost:3000/docs
- Health: http://localhost:3000/health â†’ `{ "status": "ok" }`
- Os 3 ativos de seed (`WT-001`, `WT-002`, `PV-001`) sÃ£o criados no primeiro boot.

### 2. Frontend (porta 4200)

```bash
cd web
npm install
npm start                     # http://localhost:4200
```

> Em desenvolvimento o frontend aponta para `http://localhost:3000` (via `src/environments/environment.ts`). O CORS do NestJS libera explicitamente `http://localhost:4200` e `https://levi-marcos.github.io` â€” nada de `origin: '*'`.

## ðŸ“– Rotas do frontend

| Rota | PÃ¡gina |
|---|---|
| `/` | Dashboard operacional (KPIs via `GET /dashboard/overview`) |
| `/assets` | Lista de ativos (filtros, loading/error/empty, link para detalhe) |
| `/assets/:id` | Detalhe â€” summary, telemetria recente e formulÃ¡rio de nova leitura |
| `/alerts` | Alertas WARNING/CRITICAL (severidade textual, nÃ£o sÃ³ cor) |

## ðŸ§ª Testes

```bash
cd api
npm run test        # 16 unitÃ¡rios (regra de temperatura, service, alerts)
npm run test:e2e    # 8 e2e (health, 400/404, fluxo 90Â°C â†’ CRITICAL, overview)
npm run lint

cd web
npm test            # 15 testes (health, lista, detalhe, dashboard, alertas, POST)
npm run build
```

## ðŸŽ¯ CenÃ¡rio obrigatÃ³rio validado

```
WT-001 â†’ POST telemetry (temperatureC = 90) â†’ NestJS classifica CRITICAL
â†’ alerta AL-xxx criado â†’ resposta volta â†’ Angular atualiza summary/telemetria â†’ UI reflete
```

EvidÃªncia: e2e do backend + testes de componente do frontend + validaÃ§Ã£o manual via HTTP.

## â˜ï¸ Deploy

### Frontend â€” GitHub Pages

O frontend Ã© publicado em **GitHub Pages** (infra estÃ¡tica). O build de produÃ§Ã£o usa `src/environments/environment.prod.ts`.

```bash
cd web
ng build --configuration production --base-href /windops-control-center/
# publicar o conteÃºdo de dist/web/browser em https://SEU_USUARIO.github.io/windops-control-center/
```

### Backend â€” Render (para o demo online funcionar)

O frontend publicado depende de um backend pÃºblico para exibir dados reais. O blueprint `api/render.yaml` estÃ¡ pronto:

1. Crie o serviÃ§o em https://dashboard.render.com/blueprint?repo=SEU_USUARIO/SEU_REPO
2. Associe um PostgreSQL e preencha `DATABASE_URL` no serviÃ§o.
3. Aponte `web/src/environments/environment.prod.ts` â†’ `https://windops-api-zo1o.onrender.com`.

> Sem o backend no ar, o site publicado exibe o estado "API IndisponÃ­vel" (comportamento intencional de erro, nÃ£o vazio).

## ðŸ§­ Arquivos da mentoria

- `AGENTS.md` e `FULLSTACK_MENTOR_PROTOCOL.md` â€” regras do modo mentor
- `DESAFIO_04_WINDOPS_CONTROL_CENTER_FULLSTACK.md` â€” currÃ­culo do desafio
- `API_CONTRACT.md` â€” contrato REST (fonte de verdade)
- `WIREFRAMES.md` â€” decisÃµes de interface
- `MENTORIA_STATE.md` â€” progresso, ADRs e evidÃªncias