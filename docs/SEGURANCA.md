# Segurança, privacidade e limites

Não há autenticação "de-framework": sessão, CSRF e quotas são implementadas em `src/server/http.ts`
e são ~300 linhas que dá para ler todas. O resto desta página explica as escolhas.

## Sessões e contas

- `sessions(id, user_id, created_at, expires_at, user_agent, ip_hash, revoked_at)` — a chave
  primária é o **HMAC do token** com `ARCANA_SESSION_SECRET` (`tokenHash`), nunca o token. O token
  vai na cookie `arcana_session` (`httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=30d`). Uma cópia da
  base não dá sessões válidas, e `sessionUser` reprova expiradas e revogadas. Um dump da base não dá sessões válidas.
- Em produção falta `ARCANA_SESSION_SECRET` = arranque ruidoso com aviso e valor efémero (as
  sessões morrem com o processo, de propósito).
- `POST /api/auth/logout` faz `revokeSession` (marca `revoked_at`) e limpa as cookies — uma sessão revogada no servidor deixa de servir mesmo com a cookie ainda no navegador.
- Palavras-passe com `scryptSync` (N=16384, r=8, p=1, keylen=32), salt de 16 bytes por utilizador, formato serializado `scrypt$N$r$p$salt$hex` e comparação com `timingSafeEqual`. O `hashPassword` custa ~80 ms, que é também a razão para não haver *rate limiting* agressivo extra no arranque de sessão. Bloqueio de login: 6 tentativas/minuto por handle + 30/min por rede.

## Convidados (sem conta)

Sem conta, o registo existe na mesma: cookie `arcana_device` (32–64 hex, `httpOnly`) é o
identificador, e as leituras ficam ligadas a ele por `readings.session_id`. Ao registar,
`claimDeviceReadings` faz `UPDATE readings SET user_id = ? WHERE session_id = ? AND user_id IS NULL`
e devolve `claimedReadings`. `POST /api/auth/claim` repete a operação (idempotente) para quem criou
conta noutro aparelho ou importou uma base antiga.

Consequência assumida e escrita em `/privacidade`: limpar as cookies do navegador desliga-te desse
registo — por isso a exportação está ao lado, não escondida.

## CSRF em three caminhos

Mutação autenticada exige: (1) `Origin`/`Sec-Fetch-Site` compatível com `same-origin` **ou** com o
`Host`/`x-forwarded-host`/`ARCANA_PUBLIC_URL`; (2) cookie legível `arcana_csrf`; (3) cabeçalho
`X-CSRF-Token` a repetir esse valor. A comparação é feita com o `Host` do pedido, e não com o
`req.url` interno do handler — com `next start -H 0.0.0.0` (e em contentores/preview) essa era a
diferença entre "login funciona" e "403 em tudo o que é POST". GET/HEAD/OPTIONS não passam nisto.

## Rate limiting e quotas

Baldes de tokens em memória (`takeQuota`), por chave lógica: leituras `{40, 6/min}`, IA `{12,
2/min}`, conversa `{30, 10/min}`, eventos `{240, 120/min}`, feedback `{6, 0,2/min}`, registo `{3,
0,05/min}`, login `{6 por handle + 30 por rede}`. `429` devolve `retryAfterSeconds`, e a UI mostra
isso em vez de "tenta mais tarde".

## Orçamento de IA

`prefs.ai.dailyBudgetUsd` comparado com o custo estimado de hoje
(`ARCANA_TOKEN_PRICES_USD`). Ao exceder: degrada para local + `budgetNote`. Nunca `402`.

## O que o servidor valida do cliente

- **Distribuição**: `POST /api/readings` recomputa a tiragem a partir de `seed`/`algorithm`/`cuts`/
  `cutSize`/`drawMode`/`positionOrder` e responde **409** se as cartas do cliente não baterem certo.
  Com escolha manual, o teste passa a ser "cada carta está no índice declarado" — o que continua a
  não permitir inventar uma tiragem.
- **Conteúdo**: limites por campo em `src/server/api-schemas.ts` (pergunta 600, nota 2000, diário
  4000, nome de baralho 60, posições de tiragem própria com rótulos e perguntas obrigatórios).
- **Baralhos**: ≥3 cartas; `cardIds` têm de ser ids do catálogo canónico; `onlyMajors` e filtros de
  naipe aplicados pelo servidor.
- **Ficheiros exportados**: o ZIP é escrito por `src/server/zip.ts` com entradas fixas e sem
  caminhos absolutos — não há `zip slip` porque não há nomes vindos do utilizador no interior do
  arquivo.

## Deteção de crise antes de ser criativo

`src/domain/safety.ts` corre sobre o texto da pergunta e do diário. `severity: 'critico'`
— ideação suicida, autolesão, violência de relação — **interrompe a camada interpretativa**: a
leitura é suspensa, são mostrados os contactos portugueses (SNS 24, Telefone da Esperança, 112) e o
motor local assume o texto. Categorias `alto`/`medio` (saúde, legal, financeiro, luto, menores,
vícios) não bloqueiam, mas injetam `modelDirectives` no prompt e obrigam o texto a manter-se no
registo simbólico. O teste `tests/unit/safety.spec.ts` prova que melancolia não é tratada como
emergência (o contrário de bloquear tudo é o que torna o bloqueio credível).

## Superfície externa

Sem analytics, sem scripts de terceiros, sem fontes remotas (stacks de sistema em
`src/styles/tokens.css`), sem URLs absolutas para imagens (a arte é local), sem `iframe`s. As
únicas ligações possíveis a outro computador são o endpoint de IA configurado e o PostgreSQL
configurado. Não há CSP global: a app escreve estilos em linha na mesa (animações GSAP com `--slot-*`) e uma
política estrita partiria isso. Em vez de CSP frouxa a fingir que existe, o que está aplicado é o
que se pode cumprir (`next.config.mjs`, `headers()` para `/(.*)`): `X-Content-Type-Options:
nosniff`, `Referrer-Policy: same-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(),
microphone=(), geolocation=(), browsing-topics=()`, `poweredByHeader: false`, e `Cache-Control:
public, max-age=31536000, immutable` em `/art/**`. Para o *optimizer* de imagens está definido
`contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox"` com
`dangerouslyAllowSVG` + `contentDispositionType: attachment` — que é o conjunto mínimo para servir
SVG próprios sem executar nada. A superfície de ataque real é pequena: não há `eval`, não há HTML
vindo de conteúdo (o texto vai como texto), e o conteúdo é versionado e auditado por build.

## Dados e apagamento

- `DELETE /api/readings/[id]` é soft-delete (`deleted_at`) e a linha desaparece de todas as
  listagens e estatísticas.
- A eliminação física (inclusive de conta) é pedida em `/conta` (`area: 'eliminacao-de-dados'`) e
  executada por quem administra a instância, porque não há prova de posse de email sem SMTP e
  recusa-mo a fazer de conta que há.
- `/api/export?format=json|csv|zip` leva tudo, incluindo `seed`, algoritmo e cortes.
