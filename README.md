# ARCANA

Plataforma de tarot em português: 78 cartas ilustradas **por código**, 76 tiragens, um sistema
físico de baralhar e cortar, ambientes sonoros sintetizados no navegador e leitura simbólica A–G
que existe **sem** modelo de linguagem — e melhora com um, se houver chave.

> Conteúdo simbólico e reflexivo. Não é previsão, não é diagnóstico, não é aconselhamento
> clínico, jurídico ou financeiro.

## Porque é que isto não é mais um sítio de horóscopos

- **A mesa tem física.** O baralho tem ordem, os cortes têm tamanho, e a orientação é sorteada por
  um fluxo de seed independente. Podes baralhar, cortar (arrastando ou escolhendo o índice), tirar
  do topo, do fundo, alternado, ou escolher carta a carta do leque — e a mesma seed com o mesmo
  corte dá exatamente a mesma tiragem amanhã.
- **É verificável.** Ao gravar, o servidor recomputa a distribuição e recusa (409) o que não bater
  certo. Cada leitura guarda o `audit` e a página de leitura mostra `replay.matches`.
- **A arte é original.** Nenhum SVG foi desenhado à mão nem copiado de um baralho:
  `src/art/render.ts` compõe moldura, céu, cena e glifos a partir do registo simbólico de cada
  carta, e `scripts/build-art.ts` falha o build se dois desenhos colidirem.
- **O som também.** 7 ambientes e 21 efeitos sintetizados com Web Audio, um por acção do ritual.
  Zero ficheiros de áudio na aplicação.
- **A leitura é estrutura, não vaguidão.** Sete secções (A–G) com posições, relações entre cartas,
  aspetos elementais/planetários e um conselho que se pode executar hoje. Voz, registo e
  profundidade são três eixos independentes.
- **Funciona sem conta, sem rede e sem chave.** Convidados gravam por id de dispositivo e podem
  reclamar tudo ao criar conta.

## Começar em 60 segundos

```bash
npm ci
npm run setup   # conteúdo → arte → migrações
npm run dev     # http://localhost:3000
```

Sem `.env`, sem Docker, sem API keys. Para ligar um modelo:

```bash
cp .env.example .env    # ARCANA_AI_API_KEY=sk-…  (ou deixa em branco e usa o motor local)
npm run dev
```

## O que existe para onde olhar

| Onde | O quê |
| --- | --- |
| `/` | carta do dia, ciclo, ambiente, entradas diretas |
| `/mesa`, `/ritual/[spreadId]` | a mesa: pergunta → baralhar → cortar → escolher → revelar → interpretar → conversar |
| `/tiragens`, `/tiragens/[id]`, `/tiragens/criar` | 76 tiragens curadas, ficha completa, e o editor que cria esquemas canónicos |
| `/baralho`, `/baralho/[id]` | índice das 78 cartas e a ficha com história, tradições, relações e descrição de imagem |
| `/historico`, `/leitura/[id]`, `/partilha/[token]` | as tuas leituras, a leitura completa com replay, e partilha anónima |
| `/diario`, `/calendario`, `/estatisticas` | estado declarado por dia, carta-âncora por dia com fase lunar e sabbats, contagens da própria prática |
| `/som` | ambientes, volumes, os 21 efeitos e a pré-visualização de partículas |
| `/preferencias`, `/conta` | voz/registo/profundidade/motor/tema e baralhos, exportação, pedidos de dados |
| `/diagnostico` | estado do sistema, banco, IA, arte, quotas, consumo e auto-teste do motor **no browser** |
| `/sobre`, `/acessibilidade`, `/privacidade`, `/termos` | como está feito, o que é acessível, o que é guardado, em que termos |

## Verificar

```bash
npm run check    # typecheck + eslint + 115 testes + auditorias de conteúdo, tokens e a11y
npm run verify   # check + next build + benchmark do motor determinístico
npm run test:e2e # Playwright (depois de: npm run test:e2e:install)
```

## Documentação

| Ficheiro | Trata de |
| --- | --- |
| [`docs/INSTALACAO.md`](docs/INSTALACAO.md) | requisitos, primeiro arranque, variáveis, build, Contentor, verificações |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | camadas, fronteiras, fluxo de uma leitura, decisões |
| [`docs/CONTEUDO.md`](docs/CONTEUDO.md) | `content/pt-PT`, schema de uma carta, auditoria de cobertura |
| [`docs/ARTE.md`](docs/ARTE.md) | motor de SVG, glifos, temas, camadas, selo do ritual |
| [`docs/SOM.md`](docs/SOM.md) | Web Audio generativo, ambientes, 21 efeitos, partículas, GSAP |
| [`docs/IA.md`](docs/IA.md) | modo híbrido, prompt, orçamento, degradação, auditoria de texto |
| [`docs/API.md`](docs/API.md) | contrato de todas as rotas, envelope de erro, CSRF, stream SSE |
| [`docs/SEGURANCA.md`](docs/SEGURANCA.md) | sessões, CSRF, quotas, cabeçalhos, deteção de crise, dados |
| [`docs/TESTES.md`](docs/TESTES.md) | as quatro camadas de teste e o que cada uma não prova |
| [`PROGRESS.md`](PROGRESS.md) | estado real do projeto, o que está feito, o que falta |

## Estrutura

```
content/pt-PT/   autorado tipado em TS (a fonte do significado)
scripts/         build-content, build-art, migrações, auditorias, benchmark
src/art/         svg.ts (primitivas) · glyphs.ts (léxico) · render.ts (composição)
src/audio/ src/vfx/  som generativo e partículas
src/domain/      conteúdo carregado, interpretação local, segurança, experiência, schemas
src/engine/      deck.ts · aspects.ts · cycle.ts · layout.ts · narrative.ts (determinístico)
src/ai/          providers · prompts · pipeline · schema
src/db/          DatabaseClient · SQLite · Postgres · migrações
src/server/      service · repositories · http (sessão/CSRF/quota) · api-schemas · zip
src/app/         rotas de página + rotas de API
src/components/  UI (mesa, leitura, catálogos, painéis de página, primitivas)
tests/           unit · integration · e2e
```

Licença: ainda não há `LICENSE` no repositório — é a única decisão de distribuição por tomar
(ver `PROGRESS.md`). O `/termos` distingue já código e conteúdo editorial, e a ilustração é
declarada como material original gerado a partir do registo simbólico do projeto.
