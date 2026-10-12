# Contrato HTTP

Todas as rotas vivem em `src/app/api/**/route.ts`, são `force-dynamic`, devolvem JSON e seguem
três regras partilhadas em `src/server/http.ts`:

- **envelope de erro**: `{ error: string, code: string, details?: unknown }` com o estatuto HTTP
  certo (400 json inválido, 401 sem sessão, 403 CSRF, 404 inexistente, 409 conflito de
  integridade, 422 validação, 429 quota).
- **validação de entrada** com os schemas de `src/server/api-schemas.ts`; erros de validação
  devolvem `details: [{ campo, problema }]`, que os formulários mostram por campo.
- **cookies de sessão/dispositivo/CSRF** emitidas por `issueSession`/`withDevice`. A cookie
  legível `arcana_csrf` é repetida no cabeçalho `X-CSRF-Token` em qualquer mutação autenticada.

### 0.1 · Os erros que a UI sabe ler (medidos com `curl`, não de memória)

| estatuto | `code` | corpo real |
| --- | --- | --- |
| 400 | `json_invalido` | `{"error":"O corpo do pedido não é JSON válido.","code":"json_invalido"}` |
| 403 | `csrf` | `{"error":"Origem não reconhecida.","code":"csrf"}` — também quando falta/erra o `X-CSRF-Token` |
| 422 | `validacao` | `{"error":"O pedido não cumpre o formato esperado.","code":"validacao","details":[{"campo":"handle","problema":"Required"},{"campo":"email","problema":"Email inválido."}]}` |
| 429 | `limite_atingido` | `{...,"details":{"retryAfterSeconds":12}}` — a UI mostra "tenta de novo em Ns" em vez de engolir o erro |

Além destes, cada rota levanta `HttpError(status, mensagem, code, details)` com códigos locais
(`nao_autenticado`, `inexistente`, `integridade`, `limite_de_uso`…). A forma — `error`, `code`,
`details?` — não muda; é isso que `src/lib/api.ts` espera e que os testes de integração validam.

> Não há `suggestions` nem `campaign` no envelope de erro. O texto do envelope de *leitura*
> (`InterpretResult.campaign`) é outra coisa: vem de `POST /api/readings/[id]/interpret`, que é
> uma resposta `200`, não um erro.

## Leitura

| Rota | Devolve |
| --- | --- |
| `GET /api/health` | `{ ok, service, version, time, latencyMs, database{kind,migrations,path}, content, experience{environments,soundEffects}, totals{readings,users}, ai, session }` |
| `GET /api/catalog?kind=&suit=&theme=` | `cards`/`spreads` com *overrides* da base aplicados por cima do `content.json` |
| `GET /api/daily?salt=` | carta do dia determinística (id, orientação, seed, fase lunar, sabbat) |
| `GET /api/spreads` | `{ total, spreads }` — catálogo + tiragens próprias |
| `GET /api/spreads/[id]` | esquema completo, com `positions` e `readingOrder` |
| `GET /api/readings?limit=&offset=&spread=&starred=` | `{ readings, total, limit, offset, account }` |
| `GET /api/readings/[id]` | leitura + `interpretations[]` + `replay.matches` |
| `GET /api/readings/[id]/chat` · `POST` mesmo caminho | conversa posterior à leitura (com quota própria) |
| `GET /api/journal?de=&ate=` | `{ from, to, entries[], readings[] }` (colunas em `snake_case`) |
| `GET /api/calendar?de=&dias=` | `{ from, days, series[], moons[], sabbats[], accuracyNote }` |
| `GET /api/stats` | `{ totalDraws, dailyDraws, coverage, bySuit, cards[], totals, bySpread[], usage, streak, lastDay, reversedTrend[], deckSize, note }` |
| `GET /api/decks` | `{ decks, default, palette }` |
| `GET /api/preferences` | `{ preferences, authenticated }` (padrões se anónimo) |
| `GET /api/auth/session` | `{ user|null, deviceId, csrfToken, ai, usage }` |
| `GET /api/ai/status` | estado do modo híbrido (`local` quando não há chave); `POST {reset:true}` repõe o runtime |
| `GET /api/shared/[token]` | leitura partilhada, sem campos pessoais (`stripPersonal`) |
| `GET /api/export?format=json|csv|zip` | exportação completa (ZIP escrito por `src/server/zip.ts`) |

## Escrita

| Rota | Corpo | Notas |
| --- | --- | --- |
| `POST /api/auth/register` | `{handle,password,email?,displayName?,acceptFrame:true}` | exige `acceptFrame`; reclama automaticamente as leituras do dispositivo |
| `POST /api/auth/login` | `{handle,password}` | usa `authenticate`, que **reaproveita a resposta** para não perder as `Set-Cookie` |
| `POST /api/auth/logout` | — | revoga a sessão e limpa cookies |
| `POST /api/auth/claim` | `{device?}` | junta à conta leituras gravadas só contra o id do dispositivo; idempotente |
| `PUT /api/preferences` | *patch* plano de preferências | nunca `{preferences:{…}}`: o servidor faz merge do que vier por cima do guardado |
| `POST /api/decks` | `{name,deckKind,theme,allowReversed,onlyMajors,cardIds≥3}` | 422 `baralho_invalido` com <3 cartas; `DELETE /api/decks?id=` |
| `POST /api/spreads` | esquema de tiragem própria | cria **ou** atualiza (aceita `id`); layout, `readingOrder`, blocos e layout móvel são derivados pelo mesmo motor do build de conteúdo; `DELETE /api/spreads?id=` remove |
| `POST /api/journal` | `{date,...}` | upsert por `(utilizador,data)` |
| `POST /api/readings` | ver abaixo | grava leitura + interpretação local |
| `PATCH /api/readings/[id]` | `{starred?,question?,note?}` | |
| `DELETE /api/readings/[id]` | — | soft-delete; desaparece de todas as listagens |
| `GET /api/readings/[id]/interpret` | — | disponibilidade do modo híbrido e orçamento para esta leitura |
| `POST /api/readings/[id]/interpret` | `{voice?,register?,depth?,forceLocal?,shareContext?}` | SSE por secção (A–G) |
| `POST /api/readings/[id]/messages` | `{content, focusPositionId?}` | quota própria |
| `POST /api/readings/[id]/share` | — | cria/renova `share_token` |
| `POST /api/feedback` | `{area,message}` | usados por `diagnostico` e pelo pedido de eliminação de dados |
| `POST /api/events` | números e chaves apenas | telemetria de interação; sem conteúdo de leitura |

### `POST /api/readings`

```jsonc
{
  "spreadId": "past-present-future",
  "question": "…", "querentNote": "…",
  "seed": 1234567890, "algorithm": "riffle", "cuts": 1, "cutSize": 39,
  "allowReversed": true, "drawMode": "topo", "environment": "lareira",
  "durationMs": 412000, "deckId": "deck-…", "positionOrder": ["…"],
  "cards": [{ "positionId": "…", "cardId": "…", "orientation": "reversed", "deckIndex": 12 }],
  "claim": false
}
```

O servidor recomputa a distribuição a partir de `seed`/`algorithm`/`cuts`/`cutSize`/`drawMode` e:

- **409** se os `cards` não corresponderem ao que o motor produz (`clientCards` divergente);
- com `deckIndex` (escolha manual) a verificação passa a ser "cada carta escolhida está no índice
  declarado", que é o que a escolha manual significa;
- grava `audit` (incluindo `baseOrder`) — é o que alimenta `replay.matches` e a animação.

### Stream de interpretação

`text/event-stream` com eventos `section` (A–G validadas uma a uma), `meta` (gerador, modelo,
tokens, custo, `budgetNote` quando houve degradação) e `done`. O cliente (`src/lib/api.ts`)
faz `fetch` + `ReadableStream` porque `EventSource` não envia a cookie de sessão nem o cabeçalho
CSRF.
