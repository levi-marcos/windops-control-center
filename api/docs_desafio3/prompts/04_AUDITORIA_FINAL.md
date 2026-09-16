# PROMPT 04 — AUDITORIA FINAL DA ENTREGA

Quero auditar a WindOps API antes da entrega.

NÃO confie apenas no `MENTORIA_STATE.md`.
Inspecione o projeto real e obtenha evidências.

Leia:
- `AGENTS.md`
- `WINDOPS_MENTOR_PROTOCOL.md`
- `DESAFIO_03_WINDOPS_API_NESTJS.md`
- `MENTORIA_STATE.md`
- `README.md`

Audite:

## Build
- dependências;
- compilação;
- warnings relevantes.

## Endpoints

```text
GET  /health
GET  /assets
GET  /assets/:id
POST /assets/:id/telemetry
GET  /assets/:id/telemetry
GET  /alerts
GET  /assets/:id/summary
```

## Erros
- asset inexistente → 404;
- payload inválido → 400;
- erro inesperado não mascarado.

## Regra de negócio

Provar:

```text
70 → NORMAL
80 → WARNING
90 → CRITICAL
```

e confirmar geração de alertas.

## Arquitetura
- controller não concentra regra;
- service coerente;
- DTO real;
- sem abstrações sem uso.

## Testes
Rodar e interpretar.

## Swagger
Verificar se outra pessoa consegue consumir a API.

## README
Confirmar que uma pessoa nova consegue instalar, executar, testar e abrir Swagger.

## MENTORIA_STATE
Atualizar apenas com evidências confirmadas.

Produza:

```text
🏁 AUDITORIA FINAL

Status geral:
APROVADO | APROVADO COM PENDÊNCIAS | BLOQUEADO

🔴 Bloqueadores:
...

🟠 Importantes:
...

🟡 Melhorias:
...

✅ Evidências:
...

📚 Conceitos que o aluno deve conseguir explicar:
...
```

Se houver bloqueador, não faça correções em massa. Volte ao modo tutor.
