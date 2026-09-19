# ðŸ§¾ MENTORIA_STATE â€” WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 15 â€” Auditoria Network e finalizaÃ§Ã£o (fases 0â€“14 concluÃ­das)
- NÃ­vel do aluno: A (faz telas, mas se confunde na integraÃ§Ã£o com backend; foco em diagramas, explicaÃ§Ãµes detalhadas e checkpoints frequentes)
- Estrutura repo: OpÃ§Ã£o A (task4 com subpastas api/ e web/)
- Tutor: OpenCode / Antigravity

## Ambiente

### Backend
- diretÃ³rio: api/
- porta: 3000
- build: aprovado (nest build)
- Swagger: /docs (200 OK)
- health: /health (200 { status: "ok" })
- CORS: habilitado e testado para http://localhost:4200 e https://levi-marcos.github.io (Access-Control-Allow-Origin)
- testes: 16 unitÃ¡rios e 8 e2e aprovados (vitest)

### Frontend
- diretÃ³rio: web/
- porta: 4200 (prevista)
- build: aprovado (ng build - Angular 22 standalone)
- testes: 15 testes unitÃ¡rios e de integraÃ§Ã£o aprovados (vitest)

## DecisÃµes

- Layout: OpÃ§Ã£o A â€” Dashboard Operacional (KPIs no topo, lista de ativos e alertas recentes)
- CORS vs proxy: CORS explÃ­cito no NestJS para http://localhost:4200 e https://levi-marcos.github.io
- Base URL: environment por build (dev http://localhost:3000; prod https://windops-api-zo1o.onrender.com)
- Reatividade: Signals para estado local de componente (asset, summary, telemetry, KPIs)
- AgregaÃ§Ã£o KPIs: OpÃ§Ã£o B â€” endpoint agregado GET /dashboard/overview no backend
- EstratÃ©gia refresh apÃ³s POST: recarregar summary + telemetria apÃ³s sucesso (2 requests pontuais)
- Estrutura de tipos: modelos centralizados em web/src/app/models/windops.models.ts
- Detalhe do ativo: carrega asset primeiro, depois summary+telemetria em paralelo (evita requests Ã³rfÃ£s em 404)

## ADRs

### ADR-001 â€” Estrutura de RepositÃ³rio
- Problema: Onde manter a API e o Web Frontend?
- OpÃ§Ãµes: (A) RepositÃ³rio Ãºnico com api/ e web/ vs (B) Dois repositÃ³rios separados
- RecomendaÃ§Ã£o: OpÃ§Ã£o A
- Escolha: OpÃ§Ã£o A
- Motivo: Facilidade de mentoria, contexto fullstack claro e menos complexidade de setup.
- Trade-off: DependÃªncias separadas por pasta, mas versionamento conjunto.
- Reversibilidade: Alta.

### ADR-002 â€” Conectividade Frontend/Backend e CORS
- Problema: O navegador bloqueia requisiÃ§Ãµes entre portas diferentes (4200 e 3000) por seguranÃ§a (Same-Origin Policy).
- OpÃ§Ãµes: (A) CORS explÃ­cito no NestJS vs (B) Proxy de desenvolvimento do Angular (proxy.conf.json)
- RecomendaÃ§Ã£o: OpÃ§Ã£o A
- Escolha: OpÃ§Ã£o A
- Motivo: CompreensÃ£o clara dos headers HTTP, sem intermediÃ¡rios mÃ¡gicos, alinhado Ã  prÃ¡tica de produÃ§Ã£o.
- Trade-off: Exige apontar a base URL http://localhost:3000 no frontend.
- Reversibilidade: Alta.

### ADR-003 â€” Wireframe Principal
- Problema: Qual formato de tela inicial melhor atende a operaÃ§Ã£o de energia?
- OpÃ§Ãµes: (A) Dashboard Operacional vs (B) CatÃ¡logo de Ativos vs (C) Master/Detail
- RecomendaÃ§Ã£o: OpÃ§Ã£o A
- Escolha: OpÃ§Ã£o A (Dashboard Operacional de WIREFRAMES.md)
- Motivo: Fornece visÃ£o executiva e operacional imediata (KPIs + Ativos + Alertas).
- Trade-off: Exige composiÃ§Ã£o de dados de mÃºltiplos endpoints na tela inicial.
- Reversibilidade: MÃ©dia.

### ADR-004 â€” AgregaÃ§Ã£o de KPIs
- Problema: O dashboard precisa de totais de ativos e alertas. Onde calcular?
- OpÃ§Ãµes: (A) Angular chama /assets + /alerts e deriva KPIs vs (B) backend expÃµe GET /dashboard/overview agregado
- RecomendaÃ§Ã£o: OpÃ§Ã£o B
- Escolha: OpÃ§Ã£o B
- Motivo: 1 request em vez de 2+; regra de contagem concentrada no backend (reutilizÃ¡vel por qualquer cliente); frontend consome apenas a resposta.
- Trade-off: Novo endpoint a manter; contagens ficam no domÃ­nio do service.
- Reversibilidade: Alta.

### ADR-005 â€” Base URL por ambiente
- Problema: espalhar http://localhost:3000 em componentes inviabiliza o build de produÃ§Ã£o (GitHub Pages).
- OpÃ§Ãµes: (A) hardcode no service vs (B) environments com fileReplacements no angular.json
- Escolha: OpÃ§Ã£o B (src/environments/environment.ts + environment.prod.ts)
- Motivo: `WindOpsApiService` importa uma Ãºnica fonte; o build dev usa localhost:3000 e o de produÃ§Ã£o usa `https://windops-api-zo1o.onrender.com`.
- Trade-off: PrÃ©-requisito de rebuild para trocar de URL.
- Reversibilidade: Alta.

### ADR-006 â€” Carregamento do detalhe do ativo
- Problema: forkJoin das 3 chamadas disparava summary/telemetria mesmo quando o asset nÃ£o existia (requests Ã³rfÃ£s em 404).
- OpÃ§Ãµes: (A) 3 chamadas em forkJoin vs (B) GET /assets/:id primeiro e, apÃ³s confirmar, summary+telemetria em paralelo
- Escolha: OpÃ§Ã£o B
- Motivo: 404 vira 1 request; sem mudanÃ§a de custo no fluxo feliz; sequenciamento mÃ­nimo.
- Trade-off: 1 round-trip adicional no caso de falha intermediÃ¡ria de summary.
- Reversibilidade: Alta.

## EvidÃªncias

### Backend
- health: 200 { status: "ok" }
- assets: 200 (3 ativos retornados: PV-001, WT-001, WT-002)
- 404: 404 retornado para /assets/XYZ
- telemetry: testado via e2e e unitÃ¡rios
- alerts: 200 (alertas retornados com severidade CRITICAL/WARNING)
- summary: 200 (/assets/WT-001/summary validado)
- overview: 200 (GET /dashboard/overview â†’ KPIs: totalAssets 3, online 2, maintenance 1)

### Frontend
- health: validado via HttpTestingController (sucesso 'online' e erro 'offline' com banner)
- assets: validado (cards operacionais com filtros de status e tipo, RouterLink para detalhe e 3 testes unitÃ¡rios cobrindo loading, erro e empty)
- detail: validado (4 testes: carregamento paralelo, POST sucesso com CRITICAL, 400, 404)
- dashboard: validado (3 testes: KPIs renderizados, erro, empty)
- alerts: validado (3 testes: severidade textual, erro, empty)
- telemetry form: validado (submit, loading, erro 400, refresh pÃ³s-POST)
- loading: validado (estado loading com spinner e feedback)
- errors: validado (estado offline e de erro com mensagem e retry)
- responsive: cards com grid auto-fill adaptÃ¡vel para mobile e desktop

### Fullstack
- POST 90Â°C: validado no backend e2e e via HTTP real (severity CRITICAL, alerta AL-004 criado)
- alert atualizado: validado na UI (banner de alerta gerado + refresh summary/telemetry)
- summary atualizado: validado (samples/maxTemperatureC/criticalAlerts refletem o POST)
- Network audit: pendente de captura, sem requests duplicadas no cÃ³digo (1 request por pÃ¡gina; detalhe usa assetâ†’{summary,telemetry})

### Builds/tests
- api build: aprovado (nest build)
- web build: aprovado (ng build)
- api tests: 16 unitÃ¡rios e 8 e2e aprovados (vitest)
- web tests: 15 testes unitÃ¡rios e de integraÃ§Ã£o aprovados (vitest)

## Bugs conhecidos

- Resolvido: fases 1â€“14 sem bugs pendentes. Durante a fase 7, o detalhe 404 disparava requests Ã³rfÃ£s de summary/telemetria (corrigido com ADR-006).

## DÃ­vidas tÃ©cnicas

- Nenhuma registrada.

## PrÃ³ximo passo

PublicaÃ§Ã£o do frontend no GitHub Pages (build com `--base-href /windops-control-center/`) e, se o aluno tiver conta no Render, subir a API com PostgreSQL para o demo online funcionar de ponta a ponta.
