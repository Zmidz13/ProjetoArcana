# ARCANA — publicar na Vercel

> **A verdade primeiro**: a aplicação corre na Vercel **sem alterar código**, mas **não com a
> base de dados por omissão**. O `./var/arcana.db` do `SqliteAdapter` precisa de um sistema de
> ficheiros escrevível entre pedidos; um runtime serverless não tem isso (o diretório é
> somente-leitura e efémero por instância). Por isso a peça obrigatória é **Postgres** — o
> `PgAdapter` já existe, `pg` já é dependência declarada, e o arranque escolhe o condutor
> sozinho quando `DATABASE_URL` está definido (`src/db/index.ts::dbConfigFromEnv`).
>
> Se mesmo assim quiseres SQLite na Vercel, está no §8 — e é para brincar, não para utilizadores.

Tudo o que se segue foi lido do código deste repositório; o que depende do plano da Vercel está
marcado como *verifica o teu plano*, porque os limites de tempo e de compute mudam lá, não aqui.

---

## 1 · O que a Vercel tem de fazer, e porquê

| Necessidade | Estado no repositório |
| --- | --- |
| Compilar Next.js | `npm run build` = `content:build` → `art:build` → `next build` — **não** anules a build command por `next build`; os 1106 SVG de `public/art/**` estão no `.gitignore` e são *gerados* na build |
| Runtime de Node | `engines.node` = **`>=22.6`**: os scripts do projeto são `.ts` corridos por `node` sem compilação prévia, e `node:sqlite` precisa de 22.5+. Vercel: *Project → Settings → Runtime Environment* com Node 22.x |
| Base de dados | Postgres (ver §3). O `migrate()` corre automaticamente no primeiro pedido por processo e é idempotente (`schema_migrations`) |
| Build de pré-render | O `next build` abre a base (`ensureDb`) ao pré-renderizar as 100 páginas: **a variável `DATABASE_URL` tem de existir também no ambiente de *build***, senão a build falha antes de chegar ao deploy |
| Ficheiros estáticos | `public/**` (fontes + arte) é servido como estático com cache imutável em `/art/**` — já está certo no `next.config.mjs` |
| Segredo de sessão | `ARCANA_SESSION_SECRET` (≥ 32 caracteres) — o arranque falha ruidosamente sem ele |
| Cron | nada necessário: a carta do dia deriva da data no pedido e não há job agendado neste repositório (`ARCANA_CRON_SECRET` não existe no código) |

## 2 · Projeto na Vercel

Com o repositório no GitHub (é de onde ele vem):

```bash
npm i -g vercel
vercel login
cd ProjetoArcana && vercel link        # escolhe a team e o nome do projeto
```

No *dashboard*, confirma: **Framework Preset = Next.js**, *Root Directory* = raiz do repositório,
Build Command = `npm run build`, Output/Install Command por defeito (`npm ci`). Não há `server.js`
nem `middleware.ts` neste projeto — a Vercel serve as rotas de `src/app/api/**` como funções e o
restante como estático/`server-reference`.

## 3 · Base de dados (o passo que decide tudo)

Hoje a Vercel não aloja Postgres próprio: provisiona-se do **Marketplace** (Neon) ou ligas um
Postgres teu (Supabase, Neon, Railway, uma box tua). O que o nosso código precisa é apenas de uma
string de ligação.

1. *Project → Storage → Create Database → Postgres (Neon)*, região mais próxima.
   A Vercel injeta automaticamente `DATABASE_URL` (e variações) em todos os ambientes.
2. **Usa a string com pooler** (porta 6543 ou sufixo `-pooler`): em serverless cada instância fria
   abre o seu próprio pool. Por isso, desde já, `ARCANA_PG_POOL_MAX` vale **1** quando
   `VERCEL`/`AWS_LAMBDA_FUNCTION_NAME` estão no ambiente (`src/db/index.ts`), 10 noutro sítio.
3. Guarda também uma **string direta** (sem pooler, porta 5432) só para as migrações: o pooler
   costuma recusar DDL/`BEGIN…COMMIT` em modo transaction. Chama-a `DATABASE_URL_DIRECT` no
   teu shell — o código não a lê, é só para o §5.

Se preferires colar tu o endereço:

```bash
echo "postgresql://user:pass@ep-x-pooler.us-east-2.aws.neon.tech/db?sslmode=require" \
  | vercel env add DATABASE_URL production
echo "postgresql://user:pass@ep-x-pooler.us-east-2.aws.neon.tech/db?sslmode=require" \
  | vercel env add DATABASE_URL preview
```

> **Ambiente de build**: garante que `DATABASE_URL` está marcado também para *Production Build*
> e *Preview Build* (`vercel env ls` mostra o alcance). Sem ele, o `next build` rebenta no
> pré-render a tentar abrir `./var/arcana.db`.

## 4 · Variáveis obrigatórias (e as opcionais que doem quando faltam)

```bash
openssl rand -hex 32 | tr -d '\n' | vercel env add ARCANA_SESSION_SECRET production --sensitive
echo "https://o-teu-dominio.vercel.app" | vercel env add ARCANA_PUBLIC_URL production
# opcional, só se quiseres LLM real:
echo "openai"                 | vercel env add ARCANA_AI_PROVIDER production
echo "sk-..."                 | vercel env add ARCANA_AI_API_KEY production --sensitive
echo "gpt-4o-mini"            | vercel env add ARCANA_AI_MODEL production
echo "4096"                   | vercel env add ARCANA_AI_MAX_TOKENS production
echo "45000"                  | vercel env add ARCANA_AI_TIMEOUT_MS production
```

| Variável | Para quê aqui |
| --- | --- |
| `ARCANA_SESSION_SECRET` | assinatura do cookie de sessão (`src/server/http.ts`). **≥ 32 caracteres**; `AUTH_SECRET` é aceite como alternativa. Rota no site |
| `DATABASE_URL` | escolhe Postgres em vez de SQLite; se existir, o condutor é Postgres |
| `ARCANA_DB_DRIVER` | força `'sqlite'`/`'postgres'` (útil nos previews, §8) |
| `ARCANA_PG_POOL_MAX` | tamanho do pool `pg` por processo. Já vem 1 em serverless; só mexe se tiveres Postgres dedicado |
| `ARCANA_PG_SSL` / `PGSSLMODE` | `1`/`require` liga `ssl` no `pg`. Não é preciso se a string já levar `?sslmode=require` |
| `ARCANA_PUBLIC_URL` | origem canónica usada nas partilhas (`shared/[token]`) e nos cabeçalhos absolutos |
| `ARCANA_AI_*` | tabela em `docs/INSTALACAO.md` §3; clampes em `docs/API.md` §0.1. Sem `ARCANA_AI_API_KEY` a app corre 100 % determinística — é o modo recomendado para uma demo pública |
| `ARCANA_TOKEN_PRICES_USD` | `in,out` por 1 M de tokens; só alimenta a estimativa em `usage_events` |
| `ARCANA_DATA_DIR` | onde vive o SQLite local (ver §8) |
| `ARCANA_DB_VERBOSE` | `1` para registrar SQL; na Vercel vê-se em `vercel logs` |

`ARCANA_ALLOW_BODY_KEY=1` **não** se ativa em produção. Não há `ARCANA_ALLOWED_ORIGINS`,
`ARCANA_DB_RO`, `ARCANA_AI_DAILY_*` nem `NEXT_PUBLIC_*` obrigatórios neste projeto.

## 5 · Uma coisa antes do primeiro `--prod`: migrar à mão

O `migrate()` do arranque é transacional e idempotente, mas com 40 instâncias frias ao mesmo
tempo todas tentam o `CREATE TABLE`. Na primeira deploy, corre uma vez:

```bash
vercel env pull .env.local          # escreve DATABASE_URL & company num ficheiro local
set -a; . ./.env.local; set +a      # carrega-o neste shell
npm run db:migrate
```

(ou simplesmente com a string direta na mão, se não quiseres o ficheiro:)

```bash
DATABASE_URL="postgresql://user:pass@ep-x.us-east-2.aws.neon.tech/db?sslmode=require" npm run db:migrate
```

Deve imprimir `SQLite`/`Postgres` correto e `N migração(ões) aplicada(s)`. Repetir é seguro:
a segunda corrida diz `0 aplicada(s), 2 já presentes`.

Depois:

```bash
vercel                            # preview: prova a build, deixa os testes visíveis no log
vercel --prod                     # produção
```

## 6 · Limite de tempo das funções (o tropeção mais provável)

Duas rotas declaram `maxDuration` — `export const maxDuration = 300` em
`src/app/api/readings/[id]/interpret/route.ts:25` e `= 120` em `.../chat/route.ts:22`.
Planos pequenos não deixam funções correr tanto (o teto do Hobby é da ordem de **60 s**;
*verifica o teu plano*). Se a deploy reclamar, altera os dois números:

```bash
sed -i "s/export const maxDuration = 300/export const maxDuration = 60/" src/app/api/readings/*/interpret/route.ts
sed -i "s/export const maxDuration = 120/export const maxDuration = 60/" src/app/api/readings/*/chat/route.ts
```

e põe `ARCANA_AI_TIMEOUT_MS=45000` para o pedido ao provedor morrer **antes** da função,
devolvendo a interpretação local em vez de uma função cortada a meio. Sem `ARCANA_AI_API_KEY`
nada disto se aplica: a interpretação determinística demora milissegundos.

Outros limites de runtime a aceitar, documentados e com impacto real aqui:

- os baldes de `takeQuota` vivem na **memória do processo**: cada instância conta para si;
- o `usage-metering` e as quotas não são globais;
- `content_overrides` não tem endpoint de escrita — publicar uma tiragem alterada é rebuild.

## 7 · Checklist depois do deploy (curl, não fé)

```bash
export URL=https://o-teu-dominio.vercel.app

curl -s "$URL/api/health"            # { ok, version, uptime, database:{ready,kind:'postgres',migrations} }
curl -s "$URL/api/ai/status"        # provider/model/limites — se não configuraste IA: enabled:false
curl -sI "$URL/art/obsidiana/major-00-fool.svg" | head -5   # 200 + cache-control imutável
curl -s "$URL/og/arcana.png" -o /tmp/og.png && head -c 8 /tmp/og.png   # PNG válido (OG funciona)
```

No browser: registar conta → carta do dia → três cartas na mesa → cortar → gravar → interpretar
(modo local) → partilhar → abrir o link público → exportação JSON. Se algum passo vermelho, o
`/diagnostico` mostra o estado da base e do motor de IA sem precisares de logs.

Para os logs:

```bash
vercel logs --follow          # o arranque imprime `database ready (postgres)`
vercel inspect <deploy-url>   # porque uma função falhou
vercel rollback               # volta ao deploy anterior em segundos
```

## 8 · Previews, SQLite e o caso "só quero experimentar"

Os *preview deployments* partilham o projeto: **não** apuntes os previews para a base de
produção. Três opções, por ordem de bom senso:

1. banco de preview separado (o Neon faz branches para isto);
2. `ARCANA_DB_DRIVER=sqlite` + `ARCANA_DATA_DIR=/tmp/arcana-preview` **apenas no preview** —
   `/tmp` é escrevível no runtime, mas os dados **desaparecem** entre invocações: serve para
   ver a UI e os fluxos, não para guardar um diário;
3. apontar o preview para a produção e aceitar que vais escrever nela (má ideia com `auth`).

```bash
echo "sqlite"                 | vercel env add ARCANA_DB_DRIVER preview
echo "/tmp/arcana-preview"    | vercel env add ARCANA_DATA_DIR preview
```

## 9 · Quando NÃO usar Vercel

- se queres SQLite com `var/` persistente num volume (VPS, Fly, Docker): `docs/INSTALACAO.md` §5;
- se as tuas interpretações com LLM precisam de 5 minutos por leitura (o `maxDuration` de 300 s
  existe para isso) e o teu plano da Vercel não o permite;
- se precisas de quota de IA partilhada *global* entre instâncias — isso exige Redis, que este
  projeto não usa.

## 10 · Coisas que ainda não foram provadas noutro computador

- os 51 testes **Playwright** estão escritos mas nunca correram aqui (sem Chromium na caixa de
  areia): `npm run test:e2e:install && npm run test:e2e`;
- **Lighthouse** sem Chrome não mede nada (o `npm run a11y:lighthouse` avisa e sai 0) — corre-o
  na tua máquina para teres números reais de acessibilidade/performance;
- Postgres real: `npm run test:integration:postgres` com `PG_TEST_URL` (a suite SQLite corre com
  `npm run test` sem qualquer setup);
- um LLM real por `ARCANA_AI_*` (aqui os testes injetam um `provider` falso determinístico, que é
  o que prova o *contrato*, não a qualidade do texto).
