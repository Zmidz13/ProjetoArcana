import { ensureDb } from '@/server/bootstrap.ts'
import { authContext, HttpError, json, queryRows, route } from '@/server/http.ts'
import { getDb } from '@/db/index.ts'
import { createZip, toCsv } from '@/server/zip.ts'
import { mergePreferences } from '@/domain/experience.ts'
import { CONTENT_STATS, contentMeta } from '@/domain/content.ts'

/**
 * `GET /api/export?format=json|zip|csv`
 *
 * Exportação completa e legível por humanos: nada fica em formato proprietário.
 *  - `json` → um documento com tudo o que a conta tem;
 *  - `zip`  → arquivo com cada tabela em JSON *e* CSV separados + um LEIA-ME;
 *  - `csv`  → só as leituras (para abrir numa folha de cálculo).
 *
 * O `zip` é escrito por `src/server/zip.ts` (deflate nativo do Node): nenhuma dependência
 * externa é precisa para levar os dados daqui para fora.
 */
export const dynamic = 'force-dynamic'

const LEIA_ME = `ARCANA — exportação de dados
================================

Conteúdo deste arquivo:
  leituras.json / leituras.csv     o registo de cada ritual: seed, algoritmo, cortes,
                                   ordem do baralho, cartas por posição e orientação.
  interpretacoes.json              os textos A–G, com o gerador que os produziu
                                   ('local' = motor simbólico; 'hibrido' = reescritos
                                   pelo modelo), custo e latência.
  conversa.json                    as perguntas e respostas depois de cada leitura.
  diario.json                      estado reportado por dia (humor/sono/energia/clareza).
  tiragens.json                    tiragens criadas no criador de tiragens.
  baralhos.json                    baralhos próprios (subconjuntos do baralho canónico).
  preferencias.json                preferências de voz, registo, ambiente, áudio e IA.
  meta.json                        versão do conteúdo simbólico e data do export.

Reprodutibilidade: cada leitura guarda seed, algorithm, cuts e drawMode. Com o
mesmo baralho, esses quatro campos reproduzem exactamente as mesmas cartas, na mesma
ordem e com as mesmas orientações — sem recorrer a nenhum serviço nosso.

Enquadramento: os textos são leitura simbólica. Nada aqui é previsão, diagnóstico ou
aconselhamento clínico, jurídico ou financeiro.
`

export const GET = route(async (req: Request) => {
  await ensureDb()
  const ctx = await authContext(req)
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') ?? 'json') as 'json' | 'zip' | 'csv'
  if (!['json', 'zip', 'csv'].includes(format)) throw new HttpError(422, 'Formatos disponíveis: json, zip, csv.', 'formato')
  await getDb()

  if (!ctx.user && !ctx.deviceId) throw new HttpError(401, 'Não há dados para exportar nesta sessão.', 'nao_autenticado')
  const userId = ctx.user?.id ?? null
  const owner = userId ? ['user_id', userId] as const : ['session_id', ctx.deviceId] as const

  const readings = await queryRows<Record<string, unknown>>(
    `SELECT id, spread_id, spread_name, question, querent_note, seed, shuffle_algorithm, cuts, allow_reversed, draw_mode,
            deck_order, cards, audit, environment, created_at, starred, share_token, duration_seconds, deleted_at
       FROM readings WHERE ${owner[0]} = ? ORDER BY created_at DESC LIMIT 5000`,
    [owner[1]],
  )
  const readingIds = readings.map((row) => String(row.id))
  const interpretations = readingIds.length
    ? await queryRows<Record<string, unknown>>(
        `SELECT reading_id, generator, provider, model, voice, register, depth, body, tokens_in, tokens_out, cost_usd, latency_ms, created_at
           FROM interpretations WHERE reading_id IN (${readingIds.map(() => '?').join(',')}) ORDER BY created_at ASC`,
        readingIds,
      )
    : []
  const chat = readingIds.length
    ? await queryRows<Record<string, unknown>>(
        `SELECT reading_id, role, content, created_at FROM chat_messages WHERE reading_id IN (${readingIds.map(() => '?').join(',')}) ORDER BY created_at ASC`,
        readingIds,
      )
    : []
  const journal = userId
    ? await queryRows<Record<string, unknown>>('SELECT date, reading_id, mood, sleep_hours, energy, clarity, note, created_at, updated_at FROM journal_entries WHERE user_id = ? ORDER BY date DESC', [userId])
    : []
  const spreads = userId ? await queryRows<Record<string, unknown>>("SELECT id, name, definition, source, shared, created_at, updated_at FROM spreads WHERE user_id = ?", [userId]) : []
  const decks = userId ? await queryRows<Record<string, unknown>>('SELECT id, name, deck_kind, size, allow_reversed, card_ids, theme, created_at, updated_at FROM decks WHERE user_id = ?', [userId]) : []

  const meta = {
    exportedAt: new Date().toISOString(),
    account: ctx.user ? { handle: ctx.user.handle, tier: ctx.user.tier } : { anonimo: true, deviceId: ctx.deviceId.slice(0, 12) },
    content: { hash: contentMeta.hash, builtAt: contentMeta.builtAt, ...CONTENT_STATS },
    counts: { readings: readings.length, interpretations: interpretations.length, chat: chat.length, journal: journal.length, spreads: spreads.length, decks: decks.length },
    gerador: 'ARCANA (motor simbólico determinístico + camada de IA opcional)',
  }

  if (format === 'csv') {
    const csv = toCsv(
      readings.map((row) => ({
        id: row.id,
        data: row.created_at,
        tiragem: row.spread_name,
        pergunta: row.question,
        cartas: jsonCards(row.cards),
        invertidas: countReversed(row.cards),
        seed: row.seed,
        algoritmo: row.shuffle_algorithm,
        cortes: row.cuts,
      })),
    )
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="arcana-leituras-${stamp()}.csv"`,
        'cache-control': 'no-store',
      },
    })
  }

  const document = {
    meta,
    preferences: ctx.user ? mergePreferences(ctx.user.preferences) : null,
    readings,
    interpretations,
    chat,
    journal,
    spreads,
    decks,
  }

  if (format === 'json') return json(document)

  const archive = createZip([
    { name: 'LEIA-ME.txt', content: LEIA_ME },
    { name: 'meta.json', content: JSON.stringify(meta, null, 2) },
    { name: 'leituras.json', content: JSON.stringify(readings, null, 2) },
    { name: 'leituras.csv', content: toCsv(readings) },
    { name: 'interpretacoes.json', content: JSON.stringify(interpretations, null, 2) },
    { name: 'conversa.json', content: JSON.stringify(chat, null, 2) },
    { name: 'diario.json', content: JSON.stringify(journal, null, 2) },
    { name: 'diario.csv', content: toCsv(journal) },
    { name: 'tiragens.json', content: JSON.stringify(spreads, null, 2) },
    { name: 'baralhos.json', content: JSON.stringify(decks, null, 2) },
    { name: 'preferencias.json', content: JSON.stringify(document.preferences ?? {}, null, 2) },
  ])
  return new Response(Buffer.from(archive), {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="arcana-export-${stamp()}.zip"`,
      'content-length': String(archive.length),
      'cache-control': 'no-store',
    },
  })
})

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

function jsonCards(raw: unknown): string {
  try {
    const cards = JSON.parse(String(raw)) as { cardId: string; orientation: string }[]
    return cards.map((card) => `${card.cardId}${card.orientation === 'reversed' ? ' (inv)' : ''}`).join(' | ')
  } catch {
    return String(raw ?? '')
  }
}

function countReversed(raw: unknown): number {
  try {
    const cards = JSON.parse(String(raw)) as { orientation: string }[]
    return cards.filter((card) => card.orientation === 'reversed').length
  } catch {
    return 0
  }
}
