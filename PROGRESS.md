# PROGRESSO

Estado honesto do repositório. Última verificação: `2026-10-12`.

## Verificações que correram (e passaram) nesta máquina

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | 0 erros |
| `npx eslint .` | 0 erros, 0 avisos (depois de limpar as 66 ocorrências iniciais) |
| `npx vitest run` | **115 testes, 8 ficheiros, 0 falhas** (unitários + integração com SQLite real) |
| `npm run audit:content` | 78 cartas · 76 tiragens · 522 posições · 306 relações · 421 glifos · 546 textos únicos · 0 placeholders |
| `npm run audit:art` | 1106 SVG válidos (média 9,1 kB, 4,85 MB) · 0 colisões de hash |
| `npm run audit:tokens` | 39 variáveis em `tokens.css`, espelhadas em `tailwind.config.mjs` sem divergência |
| `npm run audit:a11y` | 115 ficheiros verificados, 0 falhas |
| `npm run bench` | 1000 sessões por algoritmo em 68–137 ms (~42–92 µs/sessão); determinismo e não-colisão de seeds OK |
| `npx next build` | compila, 100 páginas pré-renderizadas, 26 rotas de API |
| `curl` contra `next start` | as 19 páginas a responder 200 com os títulos certos, 404 a funcionar, e todos os contratos de API dos painéis verificados (auth+CSRF, diário, calendário, estatísticas, baralhos, preferências, exportação, feedback, `auth/claim`) |

## O que está feito

### Conteúdo e dados
- `content/pt-PT/` com as 78 cartas (22 maiores + 56 menores, 14 por naipe) e as 76 tiragens,
  compiladas para `src/domain/data/content.json` por `scripts/build-content.ts` (zod + `--check`).
- Carta com ~25 campos por folha: significados direito/invertido, palavras-chave, conselhos,
  perguntas de reflexão, história, nota de tradição, tabela Golden Dawn/planos/elementos/hebraico,
  relações simbólicas, `a11y.alt`/`a11y.long` escritos à mão, receita de arte (cena, céu, terreno,
  glifos, paleta, motivos, leitura de imagem) e fontes.
- Tabela Golden Dawn/planetas/decans verificada contra `Book T` de Mathers e referências públicas;
  corte=Ar, cavaleiro=Ar… com as correspondências clássicas de naipe↔elemento.

### Motor determinístico
- `src/engine/deck.ts`: `makeRng`/`hashSeed`/`deriveSeed`, 6 algoritmos de baralhar, `cutDeck`,
  `threeCuts`, `permutationFor`, compra com `topo|fundo|alternado`, `filter` (só maiores, por
  naipe), `forced`, `manualPicks` com normalização modular, `cutSize` escolhido pelo utilizador
  (força 1 corte e vai para o registo), `replayDraw`.
- `src/engine/aspects.ts` (elementos, modalidades, planetas, relações), `cycle.ts` (fase lunar por
  Meeus com nota de ±0,5 dia, 8 sabbats, carta do dia com `dailySalt`), `layout.ts` (19 formas),
  `narrative.ts` (secções A–G com plano por profundidade), `symbolic.ts`.
- Contrato anti-falsificação: `POST /api/readings` recomputa a distribuição e devolve 409 em
  divergência; `GET /api/readings/[id]` devolve `replay.matches`.

### Camada visual
- `src/art/`: `svg.ts` (primitivas + escape), `glyphs.ts` (léxico com 421 glifos pedidos pelo
  conteúdo a resolver), `render.ts` (7 temas, 7 camadas nomeadas + textura, verso por tema, selo de
  seed), e `scripts/build-art.ts` que escreve `public/art/**` + `manifest.json` e **falha** se um
  glifo não resolver ou se dois SVG partilharem hash.
- Só `<path> <rect> <circle> <ellipse> <line> <polygon> <text>` e nada de máscaras/filtros: o mesmo
  ficheiro funciona em `<img>`, em `og:image` e rasterizado por `sharp`.
- `public/og/arcana.svg` + `arcana.png` (1200×630) gerados a partir do mesmo vocabulário visual.

### Som e movimento
- `src/audio/engine.ts`: grafo Web Audio 100 % generativo (7 ambientes com pad/escala/textura/
  reverb, 21 efeitos um por acção), arranca só com gesto, `setEnabled(false)` sem desmontar o
  grafo, `-reduced-motion` corta vozes do pad, e no-op declarado quando não há `AudioContext`.
- `src/vfx/engine.ts`: canvas 2D com 7 tipos de partícula escalados por densidade, suspenso com o
  separador invisível, `emit('queda'…)` no largo da carta.
- GSAP só na coreografia do ritual; CSS para o resto, tudo dentro de blocos
  `prefers-reduced-motion`.

### Interface
- Mesa (`/mesa`, `/ritual/[spreadId]`) com leque/linha, arrastar, corte com rato e teclado,
  revelação carta a carta, stream de interpretação A–G e conversa posterior.
- 19 rotas de página: início, mesa, ritual, tiragens (+ficha e criador), baralho (+ficha das 78),
  histórico, leitura, partilha, diário, calendário, estatísticas, preferências, som, conta, entrar,
  registar, diagnóstico, sobre, acessibilidade, privacidade, termos + `not-found`.
- `src/components/ui/primitives.tsx` (Button, Panel, Field, Segmented, Slider, Switch, Badge,
  Skeleton, Toasts) e `art.tsx` (CardArt, CardBack, manifest, temas) partilhados por tudo.
- Estado partilhado em `providers.tsx`: sessão, preferências com *debounce* e `PUT` em patch plano,
  áudio, VFX, toasts, tema do baralho; `hooks/use-ritual.ts` é o estado do ritual.

### Backend
- 26 rotas de API com envelope de erro e schemas zod partilhados (`src/server/api-schemas.ts`),
  sessões HMAC, CSRF por dupla submissão com verificação de `Host` (não do URL interno), quotas por
  balde, orçamento diário de IA com degradação para local, `src/server/zip.ts` para exportação
  JSON/CSV/ZIP, `content_overrides` aplicados em `GET /api/catalog`.
- `src/db`: `DatabaseClient` com `SqliteAdapter` (`node:sqlite`, WAL) e `PgAdapter`, migrações
  transaccionais registadas em `schema_migrations`, `rewritePlaceholders` partilhado.

### Testes, auditorias e documentação
- 115 testes (7 ficheiros unitários + integração de base real) e 51 testes Playwright em 3
  projetos (`tests/e2e/`), com config que arranca o próprio servidor.
- Scripts novos: `audit-coverage.mjs` (conteúdo), `audit-tokens.mjs`, `audit-a11y.mjs`,
  `bench-engine.mjs`, `lighthouse.mjs`, `migrate.ts`.
- 9 documentos em `docs/` (Instalação, Arquitetura, Conteúdo, Arte, Som, IA, API, Segurança,
  Testes) + este `PROGRESS.md` + README reescrito.

## Correcções encontradas ao construir o resto (não estavam no plano)

1. **CSRF matava todos os POST fora de `localhost:3000`**: a comparação era com `req.url` do
   handler, que transporta o endereço de escuta. Agora `Sec-Fetch-Site: same-origin` é aceite e a
   comparação usa `Host`/`x-forwarded-host`/`ARCANA_PUBLIC_URL`. Prova: `curl` com `Origin:` de
   127.0.0.1 contra servidor em 0.0.0.0 → 403 antes, 200 depois.
2. **O registo não iniciava sessão**: `POST /api/auth/register` consumia a resposta de
   `issueSession()` para ler o corpo e construía outra resposta, perdendo as três `Set-Cookie`.
   Agora reaproveita os cabeçalhos. Prova: `curl -D` mostra as cookies e o `POST /api/journal`
   seguinte passa de 401 para 201.
3. **`mountain()` em `src/art/svg.ts` referia `attrs`, que não existe** — um `ReferenceError` à
   espera de quem usasse a silhueta de montanha. Passou a usar o `style` do parâmetro e a
   devolver `''` para picos vazios.
4. Contratos que os painéis liam mal: `calendar` usa `de`/`dias` (não `from`/`days`), `journal` usa
   `de`/`ate` e devolve colunas em `snake_case`, `PUT /api/preferences` é um *patch* plano (não
   `{preferences:{…}}`), `SessionInfo.usage`/`ai` correspondem a `usageTotals`/`aiStatus`, e as
   profundidades são `breve|normal|profunda|muito-profunda`.
5. Não existia endpoint de "reclamar leituras"; em vez de o simular na UI, foi escrito
   `POST /api/auth/claim` (idempotente) e a página de conta usa-o.
6. Lint limpo a sério: 66 ocorrências iniciais → 0, com `any` removido do `pipeline`, `args` não
   usados prefixados, imports mortos fora, dois `<a>` substituídos por `<Link>`, dependências de
   hooks corrigidas, e dois avisos remanescentes desativados *localmente* com justificação escrita
   (SVG estático local vs. `next/image`).

## O que falta (e porquê)

| Falta | Estado | Situação honesta |
| --- | --- | --- |
| `npm run test:e2e` nesta máquina | não executado | Esta caixa de areia não pode descarregar o Chromium do Playwright (fora da lista de hosts permitida). A suite está escrita e os 51 testes são descobertos por `playwright test --list`; precisa de `npm run test:e2e:install` num sítio com rede. |
| Lighthouse com browser real | não executado | `scripts/lighthouse.mjs` salta com aviso explícito quando não há Chrome (é o comportamento atual aqui). Alvos: acessibilidade ≥ 95 e best-practices ≥ 90 em `/`, `/mesa`, `/tiragens`. |
| Chave de IA real e custo | não testado com provedor | Todo o caminho foi exercido em modo local (`ai.enabled: false`, `budgetNote`, degradação, stream por secção, validação). Falta uma corrida com 1 LLM verdadeiro para calibrar `ARCANA_TOKEN_PRICES_USD`. |
| PostgreSQL real | só unitariamente | O adaptador, `rewritePlaceholders` e as migrações estão cobertos; falta um `docker compose up postgres` + `npm run test:integration` com `DATABASE_URL`. |
| `LICENSE` | por decidir | Não vou escolher licença por ti. `/termos` já separa código de conteúdo e `docs/` diz o que é original. |
| Teste de regressão de banda larga para 76 tiragens em mobile | parcial | O e2e tem projeto mobile e o layout tem `layoutMobile` por esquema; falta um teste a comparar capturas por forma. |
| Arquivo de áudio alternativo (`.opus`) para browsers sem Web Audio | decidido não fazer | Sem `AudioContext` a app fica silenciosa por desenho, com o estado dito ao utilizador. |
| i18n (EN) | fora de âmbito | A UI é PT-PT e o conteúdo é a fonte; a estrutura `content/<locale>/` já está prevista no build. |
| `next/image` para os SVG | decidido não fazer | Ficheiros locais de ~9 kB imutáveis; o otimizador acrescentaria dependências nativas. Commentado no código. |
| Migração para Postgres em produção com `var/` persistente | documentação | Cobre-se em `docs/INSTALACAO.md`; falta testar num host real. |
| Revisão humana de prosa e som | não automatizável | O `audit:content` apanha repetição e placeholders; a qualidade é revisão (`/api/feedback`, `area: 'conteudo'`). |

## Como continuar

1. `npm run test:e2e:install && npm run test:e2e` num sítio com rede — é o andar que falta.
2. `CHROME_PATH=… npm run a11y:lighthouse` para fechar o requisito de Lighthouse com números.
3. Correr `npm run verify` depois de qualquer mudança em `src/engine/**` ou `content/pt-PT/**`.
4. Ao alterar conteúdo: `npm run content:build && npm run audit:content && npm run art:build`; os
   dois primeiros são o que apanha texto por escrever antes de chegar à UI.
