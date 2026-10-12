# Autoria de conteúdo

Todo o texto simbólico é **tipado, versionado e auditado**. Não há strings de UI com
significado escondidas em componentes: o que a pessoa lê vem de `content/pt-PT/`.

## Fluxo

```
content/pt-PT/cards/{majors-a,majors-b,wands,cups,swords,pentacles}.ts   ┐
content/pt-PT/spreads/{rapid-and-three,themes,extras,positions}.ts       ├──→ scripts/build-content.ts
                                                                          ┘        │ valida com zod
                                            src/engine/layout.ts  ←─────────────────┤ deriva layout
                                             (layoutFor, separateOverlaps, bounds)  │
                                                                                     ▼
                                                        src/domain/data/content.json (+ content.meta.json)
```

A fonte são **módulos TypeScript tipados** (`CardSource[]`, `SpreadDraft[]`), não YAML: o `tsc` é a
primeira rede de segurança (um campo a mais ou a menos numa carta não chega ao build), o zod é a
segunda (o `CardListSchema`/`SpreadSchema` em `src/domain/schema.ts` validam conteúdo e forma), e as
coordenadas das posições não são escritas à mão — são derivadas da `shape` pelo mesmo motor que a
mesa usa, com `separateOverlaps` a desempatar e `bounds` a normalizar.

`npm run content:build` regenera; `npm run content:validate` valida sem escrever (é o modo do CI);
`npm run audit:content` exige 78 cartas (22 + 4×14), ≥25 campos por carta, ≥65 tiragens, relações
sem pontas soltas, coordenadas em todas as posições, prosa não repetida entre cartas e zero
marcadores de placeholder.

## Uma carta (chaves reais, na ordem em que aparecem no objeto)

```ts
{
  id: 'major-17-star',
  arcana: 'major',                 // 'major' | 'minor'
  suit: null,                      // 'wands' | 'cups' | 'swords' | 'pentacles' nos menores
  number: 17, rank: null,          // rank: 'ace' | 'two' … 'king' nos menores
  name: { pt: 'A Estrela', intl: 'The Star' },
  archetype: 'a esperança depois do desmantelamento',
  element: 'water',                // raiz elemental da carta
  astro: 'Aquário · regente tradicional de Peixes',   // string livre, como nas fontes
  gdTitle: 'A Estrela da Magia — כוכב',               // título e hebraico da Golden Dawn
  traditionNote: '…o que muda entre Marselha, Waite e Thoth…',
  keywords: { upright: [...], reversed: [...] },
  history: '…de onde vem a imagem…',
  meanings: { upright: '…', reversed: '…' },
  relations: [{ card: 'major-18-moon', kind: 'espelho', note: '…porque é que as duas se lêem juntas…' }],
  domains: { amor: '…', trabalho: '…', corpo: '…', dinheiro: '…' },   // recorte por área
  guidance: { advice: [...], reflection: [...], obstacles: [...], opportunities: [...] },
  a11y: { alt: '…', long: '…' },   // escritos à mão: a arte é gerada, a descrição não
  art: {
    scene: 'star-over-pool', sky: 'night', terrain: 'pool',
    glyphs: ['eight-point-star', 'pool', 'heron', 'water-jars', 'naked-figure-kneeling'],
    palette: ['#C6A66B', '#56C5BD', '#EFE6D6'],
    motifs: ['o céu sem nuvens', 'a água que volta ao rio'],
    reading: ['…o que um leitor de imagem descreveria…'],
  },
  sources: ['Golden Dawn — atribuições de Tarot (Mathers)', 'Book T (1888)'],
}
```

Regras que o `audit:content` faz cumprir, e que não são negociáveis:

- **uma frase, um sentido**: nada de "pode significar tudo". Se a carta é ambígua, o módulo diz em
  que contexto ela pende para cada lado.
- **sem previsão**: as frases de conselho são acções verificáveis pela pessoa, não promessas.
- `a11y.alt` curto e `a11y.long` descritivo **escritos à mão** — a arte é gerada, a descrição não.
- `art.glyphs` têm de resolver no léxico (`src/art/glyphs.ts`); se inventares um glifo sem motivo
  elementar, `build-art.ts` falha o build.
- relações apontam para ids existentes; o motor de aspectos usa-as para a secção C.

## 76 tiragens

Cada rascunho em `content/pt-PT/spreads/*.ts` declara `shape`, `category`, `positions[]` (`id`,
`label`, `description` e, nos casos em que a posição precisa de instrução especial, `group`,
`allowReversed`, `noteReversed`, `linksTo`) e `readingOrder`; o build acrescenta `x`/`y` derivados
da forma, `cardCount`, `summary`, `purpose`, `whenToUse`, `estimatedMinutes`, `cinematic`,
`difficulty`, `author` e `themes` (índice de palavras-chave usado pela procura e pelos
`matchThemeKeywords` da API). A `shape` é
resolvida por `src/engine/layout.ts`, que é também o que a mesa usa para desenhar o mapa de
posições — por isso a mesma tiragem tem o mesmo layout no catálogo, na mesa e no OG.

O catálogo cobre 19 formas e 7 categorias, incluindo tiragens de 1 carta (10), cruzes de 10 e 12,
pirâmides, leques, e a tiragem das 78 cartas. Se criares uma tiragem nova pela UI
(`/tiragens/criar`), ela entra na tua lista e pode ser promovida a catálogo por quem mantém o
repositório.

## Overrides editoriais sem deploy

`PATCH /api/catalog` grava `content_overrides` na base; `GET /api/catalog` aplica-os por cima do
JSON gerado (`applyPatch`). Assim um texto pode ser corrigido em produção sem publicar o repositório,
sem que a fonte versionada deixe de ser a referência: o override fica visível no `/diagnostico`.
