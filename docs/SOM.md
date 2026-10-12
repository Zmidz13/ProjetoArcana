# Som, partículas e movimento

Dois módulos pequenos, nenhum ficheiro de áudio nem de imagem: **o som é sintetizado no
navegador com Web Audio e as partículas são canvas 2D**. Isto é simultaneamente a assinatura do
produto e a razão pela qual a aplicação pesa o que pesa.

## `src/audio/engine.ts` — `AmbienceEngine`

- **Um grafo, uma vez.** `master → {ambienceBus, effectsBus}` com um `ConvolverNode` de reverb
  cujo *impulse response* é gerado por ruído filtrado (duração = `reverbSeconds` do ambiente).
- **Nada arranca sem gesto.** `resume()` é chamado no primeiro clique/toque relevante. Enquanto não
  houver gesto, o estado é `running: false` e nada soa. `autoplay` existe como preferência, mas só
  controla se a ambulência continua depois do primeiro gesto — não ignora o bloqueio do navegador.
- **Ambientes** (`ENVIRONMENT_LIST`, 7): `templo, jardim-noturno, lareira, observatorio,
  praia-lunar, biblioteca, montanha`. Cada um declara `ambience{root, scale[], pad, texture,
  density, brightness}`, `vfx{particles, intensity, drift}`, `reverbSeconds` e uma paleta. O pad é
  construído por cima da escala (cordas/sino/flauta/drone/harpa) e a textura é o ruído filtrado
  correspondente (vento/água/fogo/grilos/relojó/sino-ao-longe/sala-oca) — é por isso que mudar de
  ambiente na mesa muda som, luz e partículas ao mesmo tempo, sem três sistemas separados.
- **21 efeitos** (`SFX_LIST`), um por acção do ritual: `shuffle-start, shuffle-loop, riffle,
  overhand, fan-open, cut, deal, pick, flip, flip-reversed, hover, select, drag-start, drop,
  confirm, reveal, moon-chime, sabbat-bell, error, stream-tick, toggle`. Todos com receita escrita à
  mão (ataques, filtros, envelopes) — nenhum ficheiro `.wav` existe no repositório.
- **Desligar não desmonta.** `setEnabled(false)` corta o ganho e pára a ambulência, mas o grafo fica
  intacto: voltar a ligar não recria nós nem reinicia o pad, o que evita os cliques de reconexão.
- **Movimento reduzido corta vozes** do pad para 2, porque com `prefers-reduced-motion` o utilizador
  pediu explicitamente menos estímulos contínuos.
- **Sem Web Audio?** O construtor marca `supported: false` com `lastError`, `resume()` sai na hora e
  tudo o resto se torna no-op. Há teste unitário a provar que nenhum método rebenta em Node — é o
  mesmo caminho de quem abre a app num browser sem `AudioContext`.

Instância única por aba (`getAmbience()`), partilhada pelo header, pela mesa e pelas páginas:
nunca há dois motores de ambulência a somar-se.

## `src/vfx/engine.ts` — partículas

Um canvas por página, com um `ResizeObserver`, densidade escalada por `motion.vfx` (0…1) e
`requestAnimationFrame` suspenso quando o separador não está visível. API mínima:
`emit(kind, {x, y})`, `attach(canvas)`, `setDensity()`, `setReducedMotion()`. Os tipos são
`poeira, fascas, vaga-lumes, estrelas, espuma, neve, incenso`, escolhidos pelo ambiente; as acções
do ritual emitem `queda` quando uma carta é largada na mesa (repara no nome: `'queda'`, não `'drop'`
— o vocabulário é português também aqui dentro).

Com `motion.vfx === 0` o canvas não monta: não é "animação quase invisível", é ausência de loop de
pintura. É também o que `prefers-reduced-motion` + `motion.respectSystem` produz automaticamente.

## GSAP: onde e porquê

Usado só onde a timeline é o conteúdo — o ritual (baralhar → cortar → distribuir → virar) e as
transições de painel com `timeline()` encadeada. O resto é CSS (transições de `transform/opacity`
dentro de `@keyframes`/classes em `src/app/globals.css`). Motivo: a timeline do ritual precisa de
*scrub*, de velocidade partilhada com a preferência `motion.speed` e de matar tweens anteriores no
`Recomeçar`, que é caro de fazer bem em CSS e trivial em GSAP.

Regras que o CSS/JS cumprem: nenhuma animação fora de um bloco `prefers-reduced-motion`; nada anima
`width/height/top/left` (só `transform` e `opacity`); a viragem em modo reduzido passa de rotação 3D
a um corte seco, porque a informação — a carta — nunca pode depender da animação.

## Página `/som`

`src/components/pages/sound-panel.tsx`: os 7 ambientes como cartões (escolher →
`patchPrefs({environment})` + sino do sabbat para ouvido imediato), interruptores de
`audio.enabled`/`autoplay`, um slider mestre (o valor é `max(ambience, effects)` porque o grafo tem
dois barramentos), retomar/suspender, sinos pela Lua (a afinação vem da `previousFullMoons` do dia),
os 21 efeitos um a um com a receita escrita ao lado, e uma pré-visualização de partículas que emite
o tipo do ambiente selecionado. No fundo, um bloco a dizer o que é original aqui: nenhum ficheiro de
áudio, nenhum sprite de partículas, tudo derivado de números.
