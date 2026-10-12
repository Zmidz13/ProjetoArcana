# Testes e verificação

Quatro andares, cada um com um propósito que os outros não cumprem. Tudo o que está aqui corre em
CI e na tua máquina, exceto onde é dito o contrário.

```bash
npm run test              # vitest: unitários + integração
npm run test:unit         # só unitários
npm run test:integration  # só a base de dados (9 testes, SQLite real)
npm run test:coverage     # v8, com limites (70% linhas/funções, 68% ramos)
npm run test:e2e          # Playwright (precisa dos browsers: npm run test:e2e:install)
npm run check             # typecheck + lint + testes + 3 auditorias estáticas
npm run verify            # check + next build + benchmark do motor
```

## 1. Unitários (`tests/unit/`, 115 testes)

| Ficheiro | Cobre |
| --- | --- |
| `deck.spec.ts` | PRNG, `hashSeed`/`deriveSeed`, permutações por algoritmo, `cutDeck`/`threeCuts`, unicidade da compra |
| `ritual-flow.spec.ts` | o contrato do ritual: `cutSize` respeitado e registado, replay igual, escolha manual com `((i%len)+len)%len`, colisões de índice resolvidas, topo/fundo/alternado, filtro de só-maiores, `allowReversed` não muda cartas, taxa de invertidas entre 20 % e 80 %, unicidade em **todas** as 76 tiragens |
| `symbolic.spec.ts` | tabela Golden Dawn/planos/elementos, aspectos, `analyze`, carta do dia estável por dia |
| `art-render.spec.ts` | 421 glifos resolvem, SVG válido e seguro, determinismo, escape, invertida roda só a camada `cena`, 78 cartas ⇒ 78 SVG distintos, manifest e hashes únicos |
| `experience.spec.ts` | ambientes/efeitos coerentes, `requireEnvironment` tolerante, `mergePreferences` com lixo/out-of-range/parciais |
| `audio-engine.spec.ts` | `AmbienceEngine` sem `AudioContext`: no-op, estado coerente, `setEnabled(false)` não desmonta, volumes limitados, singleton |
| `safety.spec.ts` | ideação suicida/autolesão/violência de relação bloqueiam com contactos; tristeza não bloqueia; diretivas não duplicadas; ordem por gravidade |

Padrão de escrita: os testes chamam as **funções reais** do motor (não réplicas em JS), e as
assersões são sobre invariantes ("nenhuma carta repetida em nenhuma das 76 tiragens") mais do que
sobre snapshots de texto — assim o conteúdo pode ser reescrito sem rebentar com a suite.

## 2. Integração (`tests/integration/db.spec.ts`)

Sobe um SQLite real em `os.tmpdir()` com `ARCANA_DB_PATH` e prova as 9 coisas que só se veem com
uma base verdadeira: `splitStatements`/`rewritePlaceholders` (convert `?` → `$n`), migrações
idempotentes com registo em `schema_migrations`, transacções que fazem rollback, unicidade de
`handle`, escrita e leitura de leituras/interpretações/diário, *soft delete*, e `claimDeviceReadings`
a mover efetivamente as linhas. É este o teste que corre no arranque do build de CI.

## 3. Auditorias estáticas (são testes, mas de produto)

- `npm run audit:content` — 78 cartas (22 + 4×14), ≥25 campos por carta, ≥65 tiragens (76), 522
  posições com coordenadas, 306 relações sem pontas soltas, 421 glifos, 546 textos únicos, zero
  placeholders (`lorem ipsum`, `TODO`, `a completar`, …) e sobreposições de layout só permitidas
  quando mudam rotação/escala (é o caso do braço da Cruz Céltica).
- `npm run audit:art` — `build-art.ts --check`: valida sem escrever; falha se um glifo não resolver
  ou se dois SVG partilharem hash.
- `npm run audit:tokens` — importa `tailwind.config.mjs` como módulo e compara hex a hex com
  `src/styles/tokens.css`, incluindo variantes (`gold.dim`, `gold.bright`) e as variáveis de fonte.
- `npm run audit:a11y` — 115 ficheiros: nenhum `<img>` sem `alt`, nenhum `role="dialog"` sem
  `aria-modal`, botões sem nome acessível geram aviso, `@keyframes` fora de bloco
  `prefers-reduced-motion` falha, `outline: none` sem `:focus-visible` falha.
- `npm run bench` — 1000 sessões por algoritmo, corte manual, escolha manual e `replayDraw`
  (~42–92 µs/sessão) + verificação de determinismo e de não-colisão de seeds.

## 4. E2E (`tests/e2e`, Playwright, 3 projetos: desktop 1440, tablet 834, mobile 390)

O `playwright.config.ts` arranca o próprio dev server (`reuseExistingServer` fora de CI) com
`ARCANA_DB_PATH=var/arcana-e2e.db`, `locale=pt-PT`, `timezoneId=Atlantic/Azores`, `trace` e
screenshots em falha. 51 testes no total.

- `fluxo-ritual.spec.ts` — pergunta → baralhar → **corte** → escolher 3 cartas por teclado →
  "compra manual completa" → gravar → revelar ×3 → interpretar pelo motor local → as secções
  Abertura/Carta a carta/Combinações/Síntese visíveis → abrir `/leitura/[id]`. Mais: a compra
  automática grava replay verificável (`/api/readings/[id]` com 3 cartas distintas), a mesma
  seed + corte reproduz a mesma tiragem em duas sessões, e cortes diferentes dão tiragens
  diferentes.
- `acessibilidade.spec.ts` — `lang`, landmarks, título e `h1`; ligação de salto com uma tecla;
  o leque é `role="listbox"` com `aria-activedescendant` a mover-se e ≥78 `option`s; anel de foco
  visível no primeiro interactivo; `prefers-reduced-motion: reduce` não deixa animação activa e a
  informação mantém-se; contraste do texto medido no browser ≥ 4,5:1; `Escape` fecha diálogos;
  nenhum `img` sem `alt` em `/baralho`.
- `catalogo.spec.ts` — as 78 fichas abrem e têm prosa; a procura filtra e limpa; `/tiragens` lista
  o catálogo e o botão da ficha leva à mesa; **criar uma tiragem própria** pelo editor (3 posições
  preenchidas) e vê-la em `/tiragens`; um link de partilha é legível por um contexto de browser sem
  sessão.

### Nota honesta sobre o ambiente atual

Neste sandbox não há binário de navegador (o `playwright install` precisa de rede fora da
lista permitida), por isso `npm run test:e2e` **não foi executado aqui** — os 51 testes estão
escritos, descobertos pelo `playwright test --list` e prontos a correr. O que foi verificado
aqui em alternativa: `next build` limpo, as 100 rotas a responder 200 com os títulos certos,
a página 404 a funcionar, e os contratos de API dos painéis provados por `curl` contra o
servidor de produção (auth + CSRF, diário em `snake_case`, `calendar?de=&dias=`, `stats`, `decks`,
`preferences` em *patch* plano, `export json/csv/zip`, `feedback`, `auth/claim`).
`scripts/lighthouse.mjs` corre Lighthouse real quando há Chrome (usa `CHROME_PATH` ou o Chromium do
Playwright) e **salta com aviso explícito** quando não há — nunca finge um `pass`.

## Testar o que é difícil de testar

Três coisas são verificadas por inspeção assistida porque não têm análogo automático honesto:

1. **O som.** O teste não ouve. Por isso `audio-engine.spec.ts` só prova o grafo de estado e a
   ausência de exceções, e `/som` tem os 21 efeitos clicáveis um a um, com a receita escrita ao lado
   — a escuta é humana e é barata de fazer.
2. **A prosa.** O `audit:content` apanha repetição e placeholders; "isto é bom?" é revisão humana, e
   é para isso que `/api/feedback` com `area: 'conteudo'` existe.
3. **A mesa em movimento.** GSAP + canvas num browser sem GPU não é testável em jsdom. O e2e cobre
   o estado lógico e a acessibilidade; a coreografia vê-se em 20 segundos em `/mesa`.
