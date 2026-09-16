# 🧾 MENTORIA_STATE — WindOps Fullstack

## Projeto

- Nome: WindOps Control Center
- Fase: 4 — Primeira integração: health
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
- CORS: habilitado e testado para http://localhost:4200 (header Access-Control-Allow-Origin: http://localhost:4200)
- testes: 16 unitários e 7 e2e aprovados

### Frontend
- diretório: web/
- porta: 4200 (prevista)
- build: aprovado (ng build - Angular 22 standalone)

## Decisões

- Layout: Opção A — Dashboard Operacional (KPIs no topo, lista de ativos e alertas recentes)
- CORS vs proxy: CORS explícito no NestJS para http://localhost:4200
- Base URL: http://localhost:3000
- Reatividade: pendente
- Agregação KPIs: pendente
- Estratégia refresh após POST: pendente
- Estrutura de tipos: pendente

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

## Evidências

### Backend
- health: 200 { status: "ok" }
- assets: 200 (3 ativos retornados: PV-001, WT-001, WT-002)
- 404: 404 retornado para /assets/XYZ
- telemetry: testado via e2e e unitários
- alerts: 200 (alertas retornados com severidade CRITICAL/WARNING)
- summary: 200 (/assets/WT-001/summary validado)

### Frontend
- health: validado via HttpTestingController (sucesso 'online' e erro 'offline' com banner)
- assets: pendente
- detail: pendente
- alerts: pendente
- telemetry form: pendente
- loading: validado (estado loading com badge animado)
- errors: validado (estado offline com mensagem e banner)
- responsive: pendente

### Fullstack
- POST 90°C: validado no backend e2e
- alert atualizado: pendente na UI
- summary atualizado: pendente na UI
- Network audit: pendente

### Builds/tests
- api build: aprovado (nest build)
- web build: aprovado (ng build)
- api tests: 16 unitários e 7 e2e aprovados (vitest)
- web tests: 2 testes de integração e comportamento aprovados (vitest)

## Bugs conhecidos

Nenhum registrado.

## Dívidas técnicas

Nenhuma registrada.

## Próximo passo

Concluir validação visual da Fase 4 e iniciar Fase 5 (API Service com Assets e Dashboard).
