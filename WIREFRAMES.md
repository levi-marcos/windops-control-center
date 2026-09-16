# 🖼️ WIREFRAMES — WindOps Control Center

## Opção A — Dashboard operacional

```text
┌────────────────────────────────────────────────────────────┐
│ WINDOPS                           API ● Online   [Atualizar]│
├────────────────────────────────────────────────────────────┤
│ [Ativos 03] [Online 02] [Atenção 01] [Críticos 01]       │
├────────────────────────────────────────────────────────────┤
│ ATIVOS                          │ ALERTAS RECENTES          │
│ ┌─────────────────────────────┐ │ 🔴 WT-001 Critical       │
│ │ WT-001  Aerogerador 01     │ │ 🟠 WT-002 Warning        │
│ │ ONLINE   2.8 MW            │ │                          │
│ └─────────────────────────────┘ │                          │
└────────────────────────────────────────────────────────────┘
```

Prós: foco operacional, ótima leitura rápida, forte para contexto de energia.
Contras: exige composição de vários dados.

⭐ Recomendação padrão.

## Opção B — Catálogo de ativos

```text
┌────────────────────────────────────────────────────────────┐
│ WINDOPS  [Buscar ativo____________] [Status ▾]             │
├────────────────────────────────────────────────────────────┤
│ [WT-001]        [WT-002]        [PV-001]                  │
│ ONLINE          ATTENTION       ONLINE                    │
│ 2.8 MW          2.1 MW          1.4 MW                    │
│ [Detalhes]      [Detalhes]      [Detalhes]                │
└────────────────────────────────────────────────────────────┘
```

Prós: frontend mais simples.
Contras: visão executiva mais fraca.

## Opção C — Master/detail

```text
┌────────────────────────────────────────────────────────────┐
│ WINDOPS                                                    │
├──────────────────────┬─────────────────────────────────────┤
│ ATIVOS               │ WT-001 — Aerogerador 01            │
│ > WT-001 ONLINE      │ Status: ONLINE                      │
│   WT-002 ATTENTION   │ Potência: 2.8 MW                   │
│   PV-001 ONLINE      │ Temperatura: 80 C                  │
│                      │ [Registrar telemetria]              │
│                      │ Alerts / Summary                    │
└──────────────────────┴─────────────────────────────────────┘
```

Prós: ótimo para desktop.
Contras: mais cuidado em mobile.

## Detalhe sugerido

```text
┌────────────────────────────────────────────────────────────┐
│ ← Ativos       WT-001 — Aerogerador 01      [ONLINE]      │
├────────────────────────────────────────────────────────────┤
│ [Potência média] [Temp máx] [Warnings] [Critical]         │
├──────────────────────────┬─────────────────────────────────┤
│ TELEMETRIA RECENTE       │ NOVA LEITURA                    │
│ 12:00  2.8MW  80°C       │ Potência [____]                │
│ 11:00  2.7MW  72°C       │ Vento    [____]                │
│                          │ Temp     [____]                 │
│                          │ [Registrar]                     │
├──────────────────────────┴─────────────────────────────────┤
│ ALERTAS DO ATIVO                                           │
└────────────────────────────────────────────────────────────┘
```

Pergunta do mentor:
> Qual informação precisa aparecer nos primeiros 5 segundos?
