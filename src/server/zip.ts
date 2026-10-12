import { deflateRawSync } from 'node:zlib'

/**
 * Escrita de ZIP mínima (armazenamento `deflate`), sem dependências.
 *
 * Precisamos de um ficheiro único para «exportar tudo» (leituras, diário, tiragens,
 * preferências) e não há razão para trazer uma biblioteca para gerar um arquivo com
 * cinco entradas. Este módulo implementa o suficiente do formato: local file header,
 * central directory e end-of-central-directory, com CRC-32 correcto.
 */

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >> 1) : value >> 1
    table[index] = value >>> 0
  }
  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  name: string
  content: string | Uint8Array
  /** 0 = só guardar; 8 = deflate. */
  method?: 0 | 8
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >> 8) & 0xff])
}

function u32(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff])
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

/** DOS date/time fixos (2026-01-01 00:00) — suficiente para um export determinístico. */
const DOS_TIME = 0
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1

export function createZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const raw = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content
    const method = entry.method ?? 8
    const compressed = method === 8 ? deflateRawSync(raw, { level: 9 }) : raw
    const nameBytes = encoder.encode(entry.name)
    const crc = crc32(raw)

    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800), // flag: nomes em UTF-8
      u16(method),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(crc),
      u32(compressed.length),
      u32(raw.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      compressed,
    ])
    locals.push(local)

    centrals.push(
      concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(method),
        u16(DOS_TIME),
        u16(DOS_DATE),
        u32(crc),
        u32(compressed.length),
        u32(raw.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ]),
    )
    offset += local.length
  }

  const central = concat(centrals)
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(central.length),
    u32(offset + central.length),
    u16(0),
  ])
  return concat([...locals, central, end])
}

/** CSV com escaping RFC-4180 (aspas duplicadas); separador `;` por conveniência PT. */
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return ''
  const keys = columns ?? Object.keys(rows[0]!)
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [keys.join(';'), ...rows.map((row) => keys.map((key) => escape(row[key])).join(';'))].join('\n')
}
