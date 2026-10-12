# Motor de arte

Não há uma única imagem desenhada à mão nem importada. Cada ficheiro é **gerado por código** a
partir do registo simbólico da carta: 7 temas × 158 ficheiros (78 cartas direitas, 78 invertidas,
o verso e a sua miniatura) = 1106 SVG, mais o OG estático em `public/og/`.
Isto é o que torna a ilustração original e reprodutível.

## Pipeline

```
src/domain/data/content.json (art.*) ──┐
src/art/glyphs.ts  (léxico de motivos)  ├──→ scripts/build-art.ts ──→ public/art/<tema>/<id>.svg
src/art/render.ts  (composição)         │                          └─→ public/art/manifest.json
src/art/svg.ts     (primitivas + escape)┘
```

`build-art.ts` falha se (a) um glifo pedido pelo conteúdo não resolver no léxico, ou (b) dois SVG
diferentes partilharem o mesmo hash — a segunda regra é o que garante que nenhuma carta acabou
por ser uma cópia de outra. Média atual: **9,1 kB por ficheiro, 1106 ficheiros, 4,85 MB**
(pasta gerada e ignorada pelo git; regenera-se com `npm run art:build`).

## Restrições deliberadas da linguagem

Só são permitidos `<path> <rect> <circle> <ellipse> <line> <polygon> <text>` dentro do `viewBox`,
**sem** `<mask>`, `<filter>`, `<image>`, `<style>` ou `xlink:href`. Razão: o mesmo SVG tem de ser
válido como ficheiro estático servido em `<img>`, como `og:image` e como base de um PNG rasterizado
por `sharp` — máscaras e filtros desaparecem ou rebentam nesses contextos. Efeitos que precisariam
de máscara são feitos por subtração geométrica (a Lua cheia "com sombra" é dois círculos; o crescente
da Lua é um círculo menos um deslocado).

## Camadas

`renderCard` devolve `{ svg, layers, glyphs }`. As camadas, por esta ordem, são
`moldura, fundo, ceu, cena, glifos, tarja, numeracao` (+ `textura` quando o tema a pede). Com
`layered: true` cada uma sai em `<g data-layer="…">`, e é isso que a mesa anima: a moldura aparece
primeiro, a cena respira, a tarja entra por último. A orientação invertida **roda apenas o grupo
`cena`** (`rotate(180 …)`), porque a moldura e o nome da carta não se viram — é também o que o
teste unitário garante.

## Temas

`DECK_THEMES` (`src/art/render.ts`) define 7 temas — `obsidiana, ouro-velho, linho, nanquim,
vitral, nocturno, cinza` — cada um com `ink/paper/gild/accent`, espessura de contorno, raio de
canto, textura e o padrão do verso (`arcs | grid | rays | weave`). Um tema muda a paleta, a
densidade dos glifos, o tipo de céu e o verso, **sem** tocar no significado: a mesma carta continua
a ter a mesma cena, o que é verificável porque `art.scene` vem do conteúdo, não do tema.

O seletor em `/conta` aplica o tema a tudo (deck, catálogo, diário) e é persistido como
preferência; `loadArtManifest()` (`src/components/ui/art.tsx`) lê o `manifest.json` para a UI saber
que temas existem na instalação, em vez de assumir os do código.

## Selo do ritual

`renderCard(card, { seal })` acrescenta um glifo discreto derivado do hash da seed. É a mesma
seed que o motor usou: duas pessoas com o mesmo `seal` estão a olhar para o mesmo desenho. O
`hash` por ficheiro no manifest é o que permite ao build detetar colisões e à UI partilhada dizer
"esta arte é a tua, não é um ficheiro aleatório".

## Testes e verificação

- `tests/unit/art-render.spec.ts`: todos os 421 glifos pedidos resolvem; SVG válido por tema;
  determinismo byte-a-byte; escape de texto hostil; a invertida roda só a `cena`; 78 cartas dão 78
  SVG distintos; e o `manifest.json` aponta para ficheiros que existem com hashes únicos.
- `npm run audit:art` — `build-art.ts --check`: valida sem escrever.
