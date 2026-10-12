# Modo híbrido: motor simbólico + modelo de linguagem

A regra-mãe: **a leitura existe sem o LLM**. O motor local (`src/domain/interpretation.ts` +
`src/engine/narrative.ts`) produz as sete secções A–G a partir do mesmo material simbólico que o
prompt do modelo recebe; o LLM acrescenta fraseado e associação contextual, não informação nova.

```
pergunta + cartas + posições + ambiente + ciclo
        │
        ├──→ interpretReading(…)            ← sempre corre, e é o resultado se não houver LLM
        │
        └──→ pipeline (src/ai/pipeline.ts)
                 │  prompts por secção (src/ai/prompts.ts)
                 │  provider OpenAI-compatível (src/ai/providers.ts)
                 │  validação por secção (src/ai/schema.ts, zod)
                 ▼
              mergeSections(local, llm) → auditoria final (BANNED_PATTERNS) → grava interpretação
```

## O que o modelo recebe e o que não recebe

- Recebe: pergunta (se `ai.shareContext`), posições, cartas com `meanings`/`keywords`/`relations`,
  notas de tradição, estado do ciclo (fase lunar, sabbat), ambiente e voz/registos escolhidos.
- **Não recebe**: dados de outras leituras, o diário, a conta, nem o teu `handle`. O
  `shareContext` é uma preferência por conta e pode ser desligado; desligado, o prompt perde a
  pergunta e fica só com a configuração das cartas.
- As instruções de segurança entram no system prompt como `modelDirectives` derivadas das bandeiras
  detetadas no texto da pergunta — nunca como texto mostrado ao modelo sobre a pessoa.

## Vozes e registos

`VOICES = mistico | acolhedora | direta | sabia | poetica | analitica` definem o *tom* de quem fala.
`REGISTERS = narrativa | psicologica | espiritual | pratica | tradicional | poetica` definem a
* lente*. `DEPTH_PLAN` (`breve | normal | profunda | muito-profunda`) define quantas frases por
secção, quantas cartas comentadas uma a uma e se há análise de relações. Os três eixos são
independentes e o `hint` por omissão da UI é gerado a partir deles, não escrito à mão em cada
combinação.

## Orçamento, quotas e degradação

- `prefs.ai.dailyBudgetUsd` contra `usageTotals(db, userId, 1)` em USD estimado com
  `ARCANA_TOKEN_PRICES_USD`. Ao passar o orçamento o servidor **não recusa a leitura**: corre o
  motor local e anexa `budgetNote` a dizer exatamente isso. Falhar para o utilizador é sempre
  aceitável; deixar uma conta arder, não.
- Quotas por bucket (`src/server/http.ts`): leituras `{40, 6/h}`, IA `{12, 2/min}`, conversa
  `{30, 10/min}`, eventos `{240, 120/min}`, feedback `{6, 0,2/min}` (capacidade, reposição/minuto).
- Limitador de tokens por utilizador com `ARCANA_AI_BURST_TOKENS` (12 000) e
  `ARCANA_AI_TOKENS_PER_MINUTE` (24 000) — protege a chave, não o teu tempo.
- `POST /api/feedback` aceita `area` livre: `/conta` envia `eliminacao-de-dados`, `/diagnostico`
  envia `diagnostico`, e um pedido de aumento de orçamento cabe em `area: 'orcamento'`. O `GET` do
  mesmo endpoint é o que quem administra a instância usa para listar os pedidos.

## O que o pipeline rejeita mesmo vindo do modelo

`auditText` corre sobre o texto já integrado e bloqueia: previsão de morte/acidente com data,
afirmações diagnósticas ("tem depressão"), asserções sobre fidelidade de terceiros, aconselhamento
financeiro imperativo ("investe tudo", "compra já"), e instruções contra a saúde ("deixa a
medicação"). Quando dispara, a secção volta ao texto local e o incidente é gravado como *fallback*
— visível em `/diagnostico` e no `meta.gerador` da interpretação.

## Validação por secção

Cada secção tem schema próprio (`src/ai/schema.ts`). Uma secção inválida não deita abaixo a
leitura: é substituída pela versão local e o `meta` regista `sections` com origem por secção. É
também por isso que o stream é por secção (A→G) em vez de um texto único no fim.

## Provedores

`ARCANA_AI_PROVIDER=auto` escolhe por presença de `ARCANA_AI_API_KEY`/`OPENAI_API_KEY`/
`ANTHROPIC_API_KEY`; `ARCANA_AI_BASE_URL` aceita qualquer endpoint compatível com
`/chat/completions` (incluindo servidores locais como Ollama/vLLM/LM Studio em modo OpenAI).
`ARCANA_AI_JSON_MODE=1` pede `response_format: json_object`. A chave nunca chega ao navegador: o
endpoint é chamado no servidor, e `GET /api/ai/status` revela apenas se está definida.

`npm run bench` não mede o LLM (rede), mas mede o resto do caminho: ~70–140 µs por sessão de
compra determinística.
