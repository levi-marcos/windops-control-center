# 🧾 MENTORIA_STATE — WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 15 — Auditoria Network e finalização (fases 0–14 concluídas)
- Nível do aluno: A (faz telas, mas se confunde na integração com backend; foco em diagramas, explicações detalhadas e checkpoints frequentes)
- Estrutura repo: Opção A (task4 com subpastas api/ e web/)
- Tutor: OpenCode / Antigravity

## Ambiente

### Backend
- diretório: api/
- porta: 3000
- build: aprovado (nest build)
- Swagger: /docs (200 OK)
- health: /health (200 { status: "ok" })
- CORS: habilitado e testado para http://localhost:4200 e https://levi-marcos.github.io (Access-Control-Allow-Origin)
- testes: 16 unitários e 8 e2e aprovados (vitest)

### Frontend
- diretório: web/
- porta: 4200 (prevista)
- build: aprovado (ng build - Angular 22 standalone)
- testes: 15 testes unitários e de integração aprovados (vitest)

## Decisões

- Layout: Opção A — Dashboard Operacional (KPIs no topo, lista de ativos e alertas recentes)
- CORS vs proxy: CORS explícito no NestJS para http://localhost:4200 e https://levi-marcos.github.io
- Base URL: environment por build (dev http://localhost:3000; prod https://windops-api.onrender.com)
- Reatividade: Signals para estado local de componente (asset, summary, telemetry, KPIs)
- Agregação KPIs: Opção B — endpoint agregado GET /dashboard/overview no backend
- Estratégia refresh após POST: recarregar summary + telemetria após sucesso (2 requests pontuais)
- Estrutura de tipos: modelos centralizados em web/src/app/models/windops.models.ts
- Detalhe do ativo: carrega asset primeiro, depois summary+telemetria em paralelo (evita requests órfãs em 404)

## ADRs

### ADR-001 — Estrutura de Repositório
- Problema: Onde manter a API e o Web Frontend?
- Opções: (A) Repositório único com api/ e web/ vs (B) Dois repositórios separados
- Recomendação: Opção A
- Escolha: Opção A
- Motivo: Facilidade de mentoria, contexto fullstack claro e menos complexidade de setup.
- Trade-off: Dependências separadas por pasta, mas versionamento conjunto.
- Reversibilidade: Alta.

### ADR-002 — Conectividade Frontend/Backend e CORS
- Problema: O navegador bloqueia requisições entre portas diferentes (4200 e 3000) por segurança (Same-Origin Policy).
- Opções: (A) CORS explícito no NestJS vs (B) Proxy de desenvolvimento do Angular (proxy.conf.json)
- Recomendação: Opção A
- Escolha: Opção A
- Motivo: Compreensão clara dos headers HTTP, sem intermediários mágicos, alinhado à prática de produção.
- Trade-off: Exige apontar a base URL http://localhost:3000 no frontend.
- Reversibilidade: Alta.

### ADR-003 — Wireframe Principal
- Problema: Qual formato de tela inicial melhor atende a operação de energia?
- Opções: (A) Dashboard Operacional vs (B) Catálogo de Ativos vs (C) Master/Detail
- Recomendação: Opção A
- Escolha: Opção A (Dashboard Operacional de WIREFRAMES.md)
- Motivo: Fornece visão executiva e operacional imediata (KPIs + Ativos + Alertas).
- Trade-off: Exige composição de dados de múltiplos endpoints na tela inicial.
- Reversibilidade: Média.

### ADR-004 — Agregação de KPIs
- Problema: O dashboard precisa de totais de ativos e alertas. Onde calcular?
- Opções: (A) Angular chama /assets + /alerts e deriva KPIs vs (B) backend expõe GET /dashboard/overview agregado
- Recomendação: Opção B
- Escolha: Opção B
- Motivo: 1 request em vez de 2+; regra de contagem concentrada no backend (reutilizável por qualquer cliente); frontend consome apenas a resposta.
- Trade-off: Novo endpoint a manter; contagens ficam no domínio do service.
- Reversibilidade: Alta.

### ADR-005 — Base URL por ambiente
- Problema: espalhar http://localhost:3000 em componentes inviabiliza o build de produção (GitHub Pages).
- Opções: (A) hardcode no service vs (B) environments com fileReplacements no angular.json
- Escolha: Opção B (src/environments/environment.ts + environment.prod.ts)
- Motivo: `WindOpsApiService` importa uma única fonte; o build dev usa localhost:3000 e o de produção usa `https://windops-api.onrender.com`.
- Trade-off: Pré-requisito de rebuild para trocar de URL.
- Reversibilidade: Alta.

### ADR-006 — Carregamento do detalhe do ativo
- Problema: forkJoin das 3 chamadas disparava summary/telemetria mesmo quando o asset não existia (requests órfãs em 404).
- Opções: (A) 3 chamadas em forkJoin vs (B) GET /assets/:id primeiro e, após confirmar, summary+telemetria em paralelo
- Escolha: Opção B
- Motivo: 404 vira 1 request; sem mudança de custo no fluxo feliz; sequenciamento mínimo.
- Trade-off: 1 round-trip adicional no caso de falha intermediária de summary.
- Reversibilidade: Alta.

## Evidências

### Backend
- health: 200 { status: "ok" }
- assets: 200 (3 ativos retornados: PV-001, WT-001, WT-002)
- 404: 404 retornado para /assets/XYZ
- telemetry: testado via e2e e unitários
- alerts: 200 (alertas retornados com severidade CRITICAL/WARNING)
- summary: 200 (/assets/WT-001/summary validado)
- overview: 200 (GET /dashboard/overview → KPIs: totalAssets 3, online 2, maintenance 1)

### Frontend
- health: validado via HttpTestingController (sucesso 'online' e erro 'offline' com banner)
- assets: validado (cards operacionais com filtros de status e tipo, RouterLink para detalhe e 3 testes unitários cobrindo loading, erro e empty)
- detail: validado (4 testes: carregamento paralelo, POST sucesso com CRITICAL, 400, 404)
- dashboard: validado (3 testes: KPIs renderizados, erro, empty)
- alerts: validado (3 testes: severidade textual, erro, empty)
- telemetry form: validado (submit, loading, erro 400, refresh pós-POST)
- loading: validado (estado loading com spinner e feedback)
- errors: validado (estado offline e de erro com mensagem e retry)
- responsive: cards com grid auto-fill adaptável para mobile e desktop

### Fullstack
- POST 90°C: validado no backend e2e e via HTTP real (severity CRITICAL, alerta AL-004 criado)
- alert atualizado: validado na UI (banner de alerta gerado + refresh summary/telemetry)
- summary atualizado: validado (samples/maxTemperatureC/criticalAlerts refletem o POST)
- Network audit: pendente de captura, sem requests duplicadas no código (1 request por página; detalhe usa asset→{summary,telemetry})

### Builds/tests
- api build: aprovado (nest build)
- web build: aprovado (ng build)
- api tests: 16 unitários e 8 e2e aprovados (vitest)
- web tests: 15 testes unitários e de integração aprovados (vitest)

## Bugs conhecidos

- Resolvido: fases 1–14 sem bugs pendentes. Durante a fase 7, o detalhe 404 disparava requests órfãs de summary/telemetria (corrigido com ADR-006).

## Dívidas técnicas

- Nenhuma registrada.

## Próximo passo

Publicação do frontend no GitHub Pages (build com `--base-href /windops-control-center/`) e, se o aluno tiver conta no Render, subir a API com PostgreSQL para o demo online funcionar de ponta a ponta.
