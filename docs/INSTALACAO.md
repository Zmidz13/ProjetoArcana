# Instalação e execução

O ARCANA foi desenhado para poder ser corrido **sem chaves de API, sem serviços externos e sem
dependências nativas**. O mínimo necessário é Node **22.6** e npm; recomendado **22.18+**
(verificado em 22.22.3).

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Para quê |
| --- | --- | --- |
| Node.js | 22.6 (recomendado 22.18+) | `node:sqlite` existe desde 22.5; os scripts `.ts` precisam de type-stripping (flag `--experimental-transform-types` em 22.6–22.17, por omissão a partir de 22.18) |
| npm | 10 | instalação e scripts |
| PostgreSQL | 16 (opcional) | só se não quiseres SQLite local |

O que está instalado e verificado nesta máquina (é disto que este documento fala; se o teu
`package.json` divergir, o `package.json` ganha):

| Peça | Versão instalada | Nota |
| --- | --- | --- |
| Next.js | **15.5.27** | App Router, `next build` + `next start`; **não** é Next 16 |
| React | **19.3.0** | React Compiler desligado (`next.config.mjs` sem a flag) |
| TypeScript | 5.9.3 | `moduleResolution: Bundler` + `allowImportingTsExtensions` (imports com `.ts` explícito) |
| Zod | 4.3.5 | único ponto de verdade dos limites de texto |
| Tailwind CSS | 3.4.21 | 32 tokens em `tailwind.config.mjs`; **não** é v4 (não há `@theme`) |
| `pg` | 8.23.1 | só usado quando `DATABASE_URL` existe (deploy — `docs/DEPLOY-VERCEL.md`) |
| `gsap` | 3.15.0 | única dependência de animação; não há `framer-motion` no projeto |
| Vitest / Playwright | 3.2.7 / 1.64.0 | o Playwright precisa de browser instalado à parte |
| Lighthouse | 13.5.0 (dev) | `npm run a11y:lighthouse`; sem Chrome no sistema avisa e sai 0 |

Fora `gsap`, `next`, `react` e `pg`, o resto do produto é escrito à mão:

- as fontes **não** são dependência nem `next/font` -- `globals.css` usa o *stack* do sistema
  (`ui-serif, Georgia, serif` para a display, `ui-sans-serif` para o corpo), com um guião inline
  em `layout.tsx` a ler `localStorage` antes da primeira pintura para não dar flash de tema;
- não há service worker nem IndexedDB. O que funciona sem servidor é o **motor e o catálogo**:
  `content.json` vem no bundle e `src/engine`/`src/domain/narrative` correm no browser
  (verificação `verify-local` na mesa e nos testes unitários);
- `localStorage` guarda apenas um **espelho** das preferências (`arcana:preferences`) e do tema de
  baralho para o arranque não piscar -- a fonte de verdade é a tabela `preferences` no servidor, e
  a sessão é cookie `httpOnly` assinada; nada de tokens no `localStorage`.

`package.json` declara `"engines": { "node": ">=22.6" }` — e é mesmo esse o mínimo *prático*:
o `next` sozinho correria em 20.11, mas os scripts do projeto (`build-content.ts`,
`build-art.ts`, `migrate.ts`) são TypeScript corrido por `node` sem compilação prévia, e o
base de dados local é `node:sqlite`. Não há binários nativos: o build funciona em CI sem
`apt-get install` de nada.

> **Deploy serverless**: a Vercel precisa de Postgres — `./var/arcana.db` não sobrevive lá.
> Está descrito ao detalhe em [`DEPLOY-VERCEL.md`](DEPLOY-VERCEL.md).

## 2. Primeira execução

```bash
npm ci
npm run setup        # conteúdo → arte → migrações
npm run dev          # http://localhost:3000
```

O `setup` é deliberadamente três passos visíveis:

1. `npm run content:build` — corre `scripts/build-content.ts`, que lê `content/pt-PT/*` e
   escreve `src/domain/data/content.json` (o único ficheiro que a UI lê).
2. `npm run art:build` — corre `scripts/build-art.ts`, que gera os 1106 SVG de
   `public/art/**` a partir do `src/art/` e escreve `public/art/manifest.json`.
3. `npm run db:migrate` — aplica as migrações em `src/db/migrations/` (SQLite em `var/arcana.db`).

Sem o passo 2 a aplicação ainda arranca: os componentes de arte têm
`renderCard`/`renderCardBack` como *fallback* de memória. O ficheiro de arte serve para
`<img>`, OG e exportações.

## 3. Configuração

Tudo é opcional em desenvolvimento. Copia `.env.example` para `.env` e ajusta:

- `ARCANA_SESSION_SECRET` — **obrigatório em produção** (32+ caracteres). Assina a cookie de
  sessão e o token CSRF. Sem ele fora de produção há um valor efémero com aviso no arranque, o
  que significa literalmente "as sessões morrem quando o processo reinicia".
- `DATABASE_URL` — PostgreSQL. Sem isto: `node:sqlite` em `var/arcana.db` (WAL).
- `ARCANA_DB_PATH` — caminho do SQLite; os testes e2e usam-no para correr isolados.
- `ARCANA_AI_API_KEY` + `ARCANA_AI_{PROVIDER,BASE_URL,MODEL,TEMPERATURE,MAX_TOKENS,TIMEOUT_MS,JSON_MODE}`
  — ver `docs/IA.md`. Sem chave, o motor local responde e o `/api/ai/status` di-lo.
- `ARCANA_TOKEN_PRICES_USD` — preços para o orçamento por utilizador.
- `ARCANA_PUBLIC_URL` — base absoluta em links de partilha e Open Graph.
- `ARCANA_ALLOW_BODY_KEY=1` — só para testes de contrato que enviam `apiKey` no corpo.

## 4. Build de produção

```bash
npm run build     # content:build + art:build + next build
npm start         # next start
```

O `next build` pré-renderiza o índice e a ficha das 78 cartas, os 76 esquemas de tiragem e as
páginas estáticas (início, preferências, som, conta, diagnóstico, sobre, acessibilidade,
privacidade, termos, histórico, diário, calendário, estatísticas, entrar, registar). Rotas de
leitura por id e todas as rotas `/api/*` são dinâmicas.

Atrás de proxy reverso: repara em `x-forwarded-proto` (as cookies são marcadas `Secure`
apenas quando o pedido é https) e no `Host`/`x-forwarded-host`, usados na verificação de origem
dos `POST` (ver `docs/SEGURANCA.md`, secção CSRF — a comparação é feita com o `Host`, não com o
URL interno do handler, para sobreviver a `next start -H 0.0.0.0`).

## 5. Deploy em Contentor / PaaS

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
```

Com SQLite num sistema de ficheiros efémero os dados morrem com o contentor: ou montas um volume
persistente em `var/`, ou defines `DATABASE_URL`. Não há uploads nem pastas de cache a gerir.

## 6. Verificações rápidas

```bash
npm run check    # typecheck + lint + vitest + auditorias de conteúdo/tokens/a11y
npm run verify   # check + build + benchmark do motor
curl -s localhost:3000/api/health | head -c 400
```

Se `npm run check` falhar em `audit:content`, o problema é conteúdo por autorar (ver
`docs/CONTEUDO.md`); se falhar em `audit:art`, um glifo deixou de resolver ou dois SVG partilham
hash.
