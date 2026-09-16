# 🧭 FULLSTACK MENTOR PROTOCOL — Angular + NestJS

## 1. Progressão da trilha

```text
Desafio 1: Angular isolado
→ Desafio 2: Angular + API pública
→ Desafio 3: NestJS API
→ Desafio 4: Angular + NestJS
```

O aluno deve conseguir rastrear uma funcionalidade ponta a ponta.

## 2. Pergunta central

> Quando o usuário faz X, quais camadas participam até ele enxergar Y?

Exemplo:

```text
Usuário envia telemetria
→ Angular valida formulário
→ POST /assets/WT-001/telemetry
→ Nest DTO valida
→ Service registra
→ regra classifica
→ alerta é criado
→ response volta
→ Angular atualiza tela
```

## 3. Contrato

Contrato possui método, path, params, query, body, status, response e erros relevantes.

## 4. Estratégia de integração

Ordem obrigatória:
1. testar backend sozinho;
2. observar JSON;
3. modelar TypeScript no frontend;
4. criar método do API service;
5. testar request;
6. tratar loading;
7. tratar erro;
8. renderizar;
9. validar visual;
10. testar edge case.

## 5. CORS e proxy

Angular normalmente roda em `http://localhost:4200` e NestJS em `http://localhost:3000`.

Comparar CORS explícito no backend e proxy de desenvolvimento. Registrar a decisão.

## 6. Modelos frontend

Criar apenas tipos usados pela UI. Distinguir resposta da API e View Model quando houver transformação real.

## 7. Estado

Perguntar se um valor é estado de origem ou derivado. Evitar duplicação.

## 8. Composição de requests

Antes de fazer várias chamadas, desenhar dependências e decidir se devem ser paralelas, sequenciais ou agregadas no backend.

## 9. Endpoint agregado opcional

```text
GET /dashboard/overview
```

Resposta possível:

```json
{
  "totalAssets": 3,
  "onlineAssets": 2,
  "attentionAssets": 1,
  "criticalAlerts": 1,
  "totalAlerts": 4
}
```

## 10. Formulário de telemetria

Aprender form state, validação UX, validação backend, submit, loading, erro 400, sucesso e refresh de estado.

Pergunta:
> Se Angular valida, por que NestJS ainda precisa validar?

## 11. Erros

Distinguir network error, 400, 404 e 500.

## 12. Rotas sugeridas

```text
/
/assets
/assets/:id
/alerts
```

## 13. Acessibilidade

Verificar labels, botões, links, foco, mensagens, severidade textual, headings e teclado.

## 14. Responsividade

Investigar onde o conteúdo quebra antes de escolher breakpoint.

## 15. Teste ponta a ponta manual obrigatório

```text
Dado WT-001 existente
Quando envio telemetry com temperatureC = 90
Então:
- POST retorna sucesso;
- classificação é CRITICAL;
- alerta aparece;
- summary muda;
- interface reflete a alteração de forma compreensível.
```

## 16. Performance

Inspecionar Network para requests duplicadas, sequências desnecessárias e refreshs excessivos antes de otimizar.

## 17. Git

Sugerir commits por fatia vertical.

## 18. Definition of Done

O aluno deve conseguir desenhar e explicar:

```text
Angular Component
→ Angular API Service
→ HTTP
→ Nest Controller
→ Nest Service
→ Response
→ Angular State
→ Template
```
