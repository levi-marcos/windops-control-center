# ⚡ DESAFIO INDIVIDUAL #4 — WINDOPS CONTROL CENTER FULLSTACK

**Stack:** Angular 22 · NestJS · TypeScript · SCSS · REST  
**Projeto:** frontend + backend integrados  
**Modo:** OpenCode/Antigravity como tutor adaptativo  
**Base:** pode reutilizar a WindOps API do desafio anterior

## 1. Missão

Transformar a API WindOps em uma aplicação fullstack operacional.

Fluxo esperado:

```text
abrir dashboard
→ ver saúde da API
→ ver KPIs
→ listar ativos
→ abrir detalhe
→ ver summary/telemetria/alertas
→ registrar nova telemetria
→ observar mudança de classificação/alerta
```

## 2. Objetivo pedagógico

Ao final, o aluno deve explicar:

- fronteira frontend/backend;
- contrato REST;
- CORS/proxy;
- `HttpClient`;
- tipagem;
- RxJS/Signals;
- loading/error/empty;
- Router;
- formulários;
- validação frontend vs backend;
- atualização de estado após mutation;
- debugging pelo Network;
- composição de dados;
- teste ponta a ponta.

## 3. Organização do projeto

### Opção A — um repositório com duas apps

```text
windops/
├── api/
└── web/
```

Prós: entrega simples, contexto fullstack claro.

### Opção B — dois repositórios

```text
windops-api
windops-web
```

Prós: separação independente.  
Contras: mais operação para o desafio.

⭐ Recomendação: A, se não quebrar o backend existente. Caso o backend já esteja em repositório próprio, não migrar só por estética.

## 4. MVP frontend

Rotas mínimas:

```text
/               Dashboard
/assets         Lista de ativos
/assets/:id     Detalhe do ativo
/alerts         Alertas
```

Funcionalidades:

```text
[ ] indicador API online/offline
[ ] KPIs principais
[ ] listagem real de ativos
[ ] loading/error/empty
[ ] detalhe por rota
[ ] summary
[ ] telemetria recente
[ ] formulário para nova telemetria
[ ] alertas
[ ] atualização após POST
[ ] responsividade
[ ] teclado/foco básico
```

## 5. MVP backend

O backend anterior deve prover:

```text
GET  /health
GET  /assets
GET  /assets/:id
GET  /assets/:id/telemetry
POST /assets/:id/telemetry
GET  /alerts
GET  /assets/:id/summary
```

Endpoint adicional opcional:

```text
GET /dashboard/overview
```

## 6. Fase 0 — Auditoria da base

Antes de criar Angular:

1. iniciar backend;
2. abrir Swagger;
3. testar endpoints;
4. verificar 400/404;
5. comparar com `API_CONTRACT.md`;
6. registrar divergências.

Não integrar frontend a backend não validado.

Checkpoint:
> Qual endpoint está pronto para ser o primeiro teste de integração e por quê?

Recomendação: `/health`.

## 7. Fase 1 — Arquitetura fullstack

Desenhar:

```text
Angular Component
  ↓
WindOpsApiService
  ↓ HttpClient
Nest Controller
  ↓
Nest Service
  ↓
Response
  ↓
Angular State
  ↓
Template
```

Decidir:
- estrutura do repo;
- estratégia CORS/proxy;
- Signals/RxJS;
- layout;
- base URL.

Registrar ADR.

## 8. Fase 2 — Wireframe e UX

Abrir `WIREFRAMES.md`.

O mentor apresenta A/B/C com prós/contras e pergunta a escolha do aluno.

Definir:
- primeira informação visual;
- navegação;
- comportamento mobile;
- severidade;
- loading/error.

Nenhum layout grande antes dessa decisão.

## 9. Fase 3 — Criar Angular

Criação sugerida:

```bash
ng new web --style=scss --routing=true --ssr=false
```

Explicar flags e validar app isolado.

## 10. Fase 4 — Primeira integração: health

Objetivo:

```text
Angular → GET /health → Nest
```

Antes:
- explicar origem;
- CORS/proxy;
- base URL;
- HttpClient/provider.

UI:

```text
API ● Online
```

ou:

```text
API ● Indisponível
```

Validar no Network.

Checkpoint:
> Se o backend responde no browser direto, mas Angular mostra erro de CORS, qual camada está bloqueando?

## 11. Fase 5 — API service tipado

Criar responsabilidade central:

```text
WindOpsApiService
```

Métodos progressivos:

```text
health()
getAssets()
getAsset(id)
getTelemetry(id)
createTelemetry(id, dto)
getAlerts()
getSummary(id)
```

Não colocar HTTP diretamente nos cards.

## 12. Fase 6 — Assets

Integrar `GET /assets`.

Estados:

```text
loading
success
empty
error
```

Card/lista deve mostrar:
- ID;
- nome;
- tipo;
- status;
- localização;
- potência nominal quando útil.

Card que navega deve usar link/RouterLink.

## 13. Fase 7 — Detalhe

Rota:

```text
/assets/:id
```

Integrar:
- asset;
- summary;
- telemetry.

Antes de múltiplas requests, desenhar:

```text
id
├── getAsset
├── getSummary
└── getTelemetry
```

Decidir paralelo, sequencial e comportamento em falha parcial.

## 14. Fase 8 — Dashboard

KPIs sugeridos:

```text
Total de ativos
Online
Attention
Critical alerts
```

Decisão obrigatória:

### A — calcular no frontend
Angular recebe assets + alerts e deriva.

### B — endpoint `/dashboard/overview`
Backend calcula e Angular consome uma resposta.

Comparar requests, reutilização, acoplamento e simplicidade.

## 15. Fase 9 — Formulário de telemetria

Campos:

```text
powerMw
windSpeedMs
temperatureC
timestamp
```

Ensinar:
- form state;
- labels;
- validação UX;
- backend continua autoridade;
- submit;
- loading;
- 400;
- 404;
- sucesso.

Cenário obrigatório:

```text
temperatureC = 90
```

Após sucesso:
- classificação CRITICAL;
- alerta aparece;
- summary reflete atualização;
- UI atualiza conscientemente.

## 16. Fase 10 — Alertas

Integrar `GET /alerts`.

Exibir:
- severity textual;
- asset;
- message;
- timestamp.

Não depender só da cor.

## 17. Fase 11 — Estado e reatividade

Revisar estados duplicados.

Perguntas:
- `criticalAlertsCount` precisa ser salvo ou derivado?
- form submit loading é global ou local?
- assets e selectedAsset têm donos diferentes?

## 18. Fase 12 — Erros fullstack

Testar intencionalmente:

```text
backend desligado
asset inexistente
payload inválido
500 controlado, se viável
```

UI deve distinguir pelo menos indisponibilidade, validação e não encontrado.

## 19. Fase 13 — Responsividade e acessibilidade

Checklist:

```text
[ ] headings
[ ] links vs buttons
[ ] labels
[ ] foco visível
[ ] teclado
[ ] mensagens de erro
[ ] loading
[ ] severidade com texto
[ ] layout sem overflow
```

## 20. Fase 14 — Testes

Backend:
- manter regra/summary.

Frontend, escolher testes com valor:
- API service;
- mapper;
- componente de erro;
- estado derivado;
- submit.

## 21. Fase 15 — Auditoria Network

Verificar:
- requests duplicadas;
- endpoint errado;
- CORS;
- payload;
- status;
- chamadas excessivas;
- refresh desnecessário.

Registrar ao menos uma observação técnica.

## 22. Fase 16 — Explicação final

Aluno explica em até 4 minutos:

1. arquitetura;
2. contrato;
3. CORS;
4. primeira request;
5. fluxo da lista;
6. fluxo da telemetria;
7. loading/error;
8. atualização após mutation;
9. teste;
10. decisão dos KPIs.

## 23. Critérios de aceite

```text
[ ] Backend validado
[ ] Angular executa
[ ] health integrado
[ ] assets reais
[ ] detalhe por rota
[ ] summary
[ ] telemetry
[ ] POST telemetry
[ ] alertas
[ ] loading
[ ] error
[ ] empty quando aplicável
[ ] CORS/proxy consciente
[ ] API service centralizado
[ ] tipagem sem any desnecessário
[ ] responsivo
[ ] teclado básico
[ ] build backend
[ ] build frontend
[ ] testes escolhidos
[ ] Network audit
[ ] README
```

## 24. Bônus

Depois do MVP:
- gráficos;
- filtros;
- tema;
- polling;
- refresh automático;
- Prisma/PostgreSQL;
- autenticação;
- deploy;
- WebSocket/SSE.

Cada bônus deve responder:
> Que problema ou aprendizado isso adiciona?

## 25. Entrega

- repositório(s);
- README raiz;
- instruções API e web;
- como iniciar ambos;
- Swagger;
- testes;
- `MENTORIA_STATE.md`.

> Uma integração fullstack boa é aquela que o aluno consegue rastrear e depurar ponta a ponta.
