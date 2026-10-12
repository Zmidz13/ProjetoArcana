# Arquitetura

Princípio único que organiza tudo: **a UI nunca lê os módulos de autorado nem calcula regras de domínio no
navegador**. O conteúdo é compilado para JSON, o domínio vive em módulos puros testados, e o
servidor é a autoridade sobre o que é gravado.

```
content/pt-PT/{cards,spreads}/*.ts ─┤
                       ├─ scripts/build-content.ts ─→ src/domain/data/content.json
src/domain/schema.ts ──┘                                     │
                                                             ▼
                          src/domain/content.ts (índices, requireCard/requireSpread)
                                                             │
   ┌─────────────────────────────────────────────────────────┼─────────────────────────┐
   ▼                                                         ▼                         ▼
src/engine/* (determinístico, sem I/O)              src/domain/interpretation.ts   src/art/*
deck.ts  shuffle/corte/compra/replay                A–G local, DEPTH_PLAN          render.ts + glyphs.ts + svg.ts
aspects.ts relações elementais/planetárias                                                  │
cycle.ts  fase lunar, sabbats, carta do dia                                                   ▼
layout.ts formas da mesa                                                              public/art/**
   │                                                        │
   ▼                                                        ▼
src/server/* (service, repositories, http, api-schemas) ←→ src/db/* (Sqlite | Postgres)
   │
   ▼
src/app/api/** (route handlers finos) ──→ src/components/** (React + hooks)
```

## Camadas e fronteiras

| Camada | Pastas | Regra que a mantém |
| --- | --- | --- |
| Conteúdo | `content/pt-PT`, `scripts/build-content.ts`, `src/domain/schema.ts` | A UI só lê `src/domain/data/content.json`; o autorado em TS é a fonte |
| Domínio | `src/domain` | Puro: sem `fetch`, sem `fs`, sem `Date.now()` fora do que recebe como argumento |
| Motor | `src/engine` | Determinístico: `(ids, seed, algoritmo, cortes, modo) → ordem → compra` |
| Arte | `src/art` | Só primitivas SVG válidas dentro de `<img>`; falha o build se um glifo não resolver |
| Som/imagem viva | `src/audio`, `src/vfx` | 100 % generativo; nada de ficheiros de áudio; nunca arranca sem gesto |
| Serviço | `src/server` | Valida com zod, recomputa a distribuição, decide quotas e orçamento |
| Persistência | `src/db` | `DatabaseClient` com dois adaptadores e migrações transaccionais |
| Interface | `src/app`, `src/components`, `src/hooks` | Estado de ritual no hook; o resto é apresentação |

## O fluxo de uma leitura (o caminho crítico)

1. `use-ritual.ts` guarda pergunta, seed, algoritmo, nº de cortes, corte manual, modo de compra,
   baralho filtrado e escolhas do utilizador. **Nada disto é enviado ao servidor antes de fechar.**
2. O motor (`src/engine/deck.ts`) deriva três fluxos de seed do `seed` base
   (`shuffle:<algoritmo>`, `cuts:<n>`, `orientation:<on|off>`): a ordem, os cortes e as
   orientações são independentes — por isso permitir invertidas **não** muda as cartas retiradas.
3. Ao gravar, `POST /api/readings` leva o `audit` (seed, algoritmo, cortes, `cutSize`, modo,
   posições, índice/escolha de cada carta). O servidor **recomputa** a distribuição com o mesmo
   motor e recusa (409) qualquer divergência — é o que impede um cliente modificado de gravar
   tiragens inventadas.
4. A interpretação é pedida à parte (`POST /api/readings/[id]/interpret`), em stream SSE, por
   secção (A–G), com validação por secção e *fallback* para o motor local quando o LLM falha,
   excede o orçamento diário ou está desligado.
5. `GET /api/readings/[id]` inclui `replay`, que reconstrói a tiragem a partir do `audit.baseOrder`
   e responde `matches: true|false` — a página de leitura mostra isso como prova visível.

## Por que não X

- **Sem ORM**: duas tabelas de junção e ~20 queries não justificam Prisma/Drizzle; os
  repositórios são funções com SQL explícito e `rewritePlaceholders` converte `?`→`$n` no Postgres.
- **Sem estado global**: o provider tem sessão/preferências/áudio/toasts; o ritual tem estado
  próprio por página, para duas mesas abertas não se pisarem.
- **Sem `next/image`**: a arte é SVG estático local (média 9,1 kB); o otimizador só acrescentava
  dependências nativas ao build (há um `eslint-disable` comentado no sítio).

## Ficheiros a ler primeiro

1. `src/engine/deck.ts` — tudo sobre ordem, corte, compra e replay.
2. `src/domain/content.ts` + `src/domain/schema.ts` — como o conteúdo entra no sistema.
3. `src/server/service.ts` — a política de escrita (o que o servidor aceita e rejeita).
4. `src/hooks/use-ritual.ts` — o estado do ritual do lado do cliente.
5. `src/art/render.ts` — como cada carta é desenhada a partir do registo simbólico.
