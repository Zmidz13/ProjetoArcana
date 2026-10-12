'use client'

/**
 * Criador de tiragens. O formulário não guarda um formato próprio: envia o mesmo objecto
 * que o servidor passa pelo `SpreadSchema` canónico, derivando layout normalizado, ordem de
 * leitura, estrutura em blocos e adaptabilidade mobile com o mesmo motor do catálogo.
 * Resultado: uma tiragem criada aqui é interpretada, animada e partilhada igual às outras.
 */

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Badge, Button, Field, Panel, Select, Switch, TextArea, TextInput } from '@/components/ui/primitives.tsx'
import { SpreadMap } from '@/components/ui/art.tsx'
import { useApp } from '@/components/providers.tsx'
import { ApiError, api } from '@/lib/api.ts'
import { layoutFor } from '@/engine/layout.ts'
import { SPREAD_CATEGORIES, SPREAD_SHAPES } from '@/domain/schema.ts'
import type { SpreadCategory, SpreadDef, SpreadShape } from '@/domain/types.ts'

interface PositionDraft {
  id: string
  label: string
  description: string
  group: string
  meaningWhenReversed: string
  linkTo: string
  x?: number
  y?: number
}

interface Draft {
  id?: string
  name: string
  summary: string
  purpose: string
  whenToUse: string
  category: SpreadCategory
  shape: SpreadShape
  occasion: string
  allowReversed: boolean
  positions: PositionDraft[]
}

const SHAPES_LIST = SPREAD_SHAPES as readonly string[]

function emptyPosition(index: number): PositionDraft {
  return { id: `p${index + 1}`, label: '', description: '', group: '', meaningWhenReversed: '', linkTo: '' }
}

function initialDraft(): Draft {
  const points = layoutFor('row', { count: 3 })
  return {
    name: '',
    summary: '',
    purpose: '',
    whenToUse: '',
    category: 'autoconhecimento',
    shape: 'row',
    occasion: '',
    allowReversed: true,
    positions: [1, 2, 3].map((_, index) => ({ ...emptyPosition(index), x: points[index]?.x, y: points[index]?.y })),
  }
}

export function SpreadCreator() {
  const { toast, sfx, session } = useApp()
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [mine, setMine] = useState<SpreadDef[]>([])
  const [loaded, setLoaded] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const editId = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) editId.current = id
    void api<{ spreads: SpreadDef[] }>('/api/catalog')
      .then((catalog) => {
        const builtin = new Set(catalog.spreads.filter((spread) => spread.author !== 'utilizador').map((spread) => spread.id))
        const own = catalog.spreads.filter((spread) => !builtin.has(spread.id))
        setMine(own)
        const target = id ? own.find((spread) => spread.id === id) : undefined
        if (target) {
          setDraft({
            id: target.id,
            name: target.name,
            summary: target.summary,
            purpose: target.purpose,
            whenToUse: target.whenToUse,
            category: target.category,
            shape: target.shape,
            occasion: '',
            allowReversed: target.allowReversed !== false,
            positions: target.positions.map((position) => ({
              id: position.id,
              label: position.label,
              description: position.description,
              group: position.group ?? '',
              meaningWhenReversed: position.meaningWhenReversed ?? '',
              linkTo: position.links?.[0] ?? '',
              x: position.x,
              y: position.y,
            })),
          })
          setLoaded(target.id)
        }
      })
      .catch(() => setMine([]))
  }, [])

  const setShape = useCallback((shape: SpreadShape) => {
    const points = layoutFor(shape as never, { count: draft.positions.length })
    setDraft((current) => ({ ...current, shape, positions: current.positions.map((position, index) => ({ ...position, x: points[index]?.x, y: points[index]?.y })) }))
    sfx('select')
  }, [draft.positions.length, sfx])

  const addPosition = () => {
    const points = layoutFor(draft.shape as never, { count: draft.positions.length + 1 })
    setDraft((current) => ({ ...current, positions: [...current.positions, { ...emptyPosition(current.positions.length), x: points[current.positions.length]?.x, y: points[current.positions.length]?.y }] }))
  }

  const removePosition = (index: number) => {
    setDraft((current) => {
      const positions = current.positions.filter((_, position) => position !== index)
      const points = layoutFor(current.shape as never, { count: positions.length })
      return { ...current, positions: positions.map((position, next) => ({ ...position, x: points[next]?.x, y: points[next]?.y })) }
    })
  }

  const move = (index: number, delta: number) => {
    setDraft((current) => {
      const positions = [...current.positions]
      const target = index + delta
      if (target < 0 || target >= positions.length) return current
      const [item] = positions.splice(index, 1)
      positions.splice(target, 0, item!)
      return { ...current, positions }
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (draft.name.trim().length < 3) next.name = 'Dá um nome com pelo menos 3 caracteres.'
    if (draft.summary.trim().length < 20) next.summary = 'O resumo precisa de 20 caracteres: aparece no catálogo.'
    if (draft.purpose.trim().length < 40) next.purpose = 'A finalidade precisa de 40 caracteres — é o texto que a interpretação usa.'
    if (draft.whenToUse.trim().length < 20) next.whenToUse = 'Explica em 20 caracteres quando se recorre a esta tiragem.'
    if (draft.positions.length < 1) next.positions = 'No mínimo uma posição.'
    draft.positions.forEach((position, index) => {
      if (position.label.trim().length < 1) next[`positions.${index}.label`] = 'Falta a etiqueta.'
      if (position.description.trim().length < 8) next[`positions.${index}.description`] = 'Descreve em 8+ caracteres o que a posição pergunta.'
    })
    const ids = draft.positions.map((position) => position.id)
    if (new Set(ids).size !== ids.length) next.positions = 'Há identificadores internos repetidos.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = async () => {
    if (!session?.user) {
      toast('Criares tiragens fica na tua conta: entra ou regista-te.', 'erro', { label: 'Entrar', onClick: () => window.location.assign('/entrar?next=' + encodeURIComponent('/tiragens/criar')) })
      return
    }
    if (!validate()) {
      toast('Faltam campos obrigatórios.', 'erro')
      sfx('error')
      return
    }
    setSaving(true)
    try {
      const body = {
        id: editId.current ?? undefined,
        name: draft.name.trim(),
        summary: draft.summary.trim(),
        purpose: draft.purpose.trim(),
        whenToUse: draft.whenToUse.trim(),
        category: draft.category,
        shape: draft.shape,
        occasion: draft.occasion.trim(),
        allowReversed: draft.allowReversed,
        readingOrder: draft.positions.map((position) => position.id),
        positions: draft.positions.map((position) => ({
          id: position.id,
          label: position.label.trim(),
          description: position.description.trim(),
          group: position.group.trim() || undefined,
          meaningWhenReversed: position.meaningWhenReversed.trim() || undefined,
          linkTo: position.linkTo.trim() || undefined,
          x: position.x,
          y: position.y,
        })),
      }
      const saved = await api<SpreadDef>('/api/spreads', { method: 'POST', body })
      sfx('confirm')
      toast(`Tiragem “${saved.name}” guardada com ${saved.positions.length} posições.`, 'ok')
      setMine((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
      setLoaded(saved.id)
    } catch (caught) {
      if (caught instanceof ApiError) {
        const mapped: Record<string, string> = {}
        Object.entries(caught.fieldErrors ?? {}).forEach(([key, messages]) => {
          mapped[key] = messages[0] ?? 'valor inválido'
        })
        if (Object.keys(mapped).length === 0) mapped.__global = caught.message
        setErrors((current) => ({ ...current, ...mapped }))
        toast(caught.message, 'erro')
      } else {
        toast('Não foi possível guardar.', 'erro')
      }
      sfx('error')
    } finally {
      setSaving(false)
    }
  }

  const removeMine = async (id: string) => {
    try {
      await api(`/api/spreads?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      setMine((current) => current.filter((item) => item.id !== id))
      toast('Tiragem removida.', 'ok')
    } catch (caught) {
      toast(caught instanceof ApiError ? caught.message : 'Falha ao remover.', 'erro')
    }
  }

  const previewPoints = useMemo(() => draft.positions.map((position) => ({ x: position.x ?? 0.5, y: position.y ?? 0.5, label: position.label || '—' })), [draft.positions])

  const onPreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex === null || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    setDraft((current) => ({ ...current, positions: current.positions.map((position, index) => (index === dragIndex ? { ...position, x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) } : position)) }))
  }

  return (
    <div className="space-y-4">
      <Panel
        title={loaded ? `A editar “${draft.name}”` : 'Criar uma tiragem'}
        subtitle="Define posições, o que cada uma pergunta e a forma na mesa. O resto (layout normalizado, blocos, mobile, ordem) é derivado pelo motor."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={draft.positions.length >= 1 ? 'neutral' : 'warn'}>{draft.positions.length} posições</Badge>
            <Button variant="gold" onClick={() => void save()} loading={saving}>
              {loaded ? 'Guardar alterações' : 'Guardar tiragem'}
            </Button>
          </div>
        }
      >
        {!session?.user ? (
          <p className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
            Precisas de conta para guardar tiragens (ficam no teu histórico e podem ser partilhadas).{' '}
            <Link href="/entrar" className="underline underline-offset-2">
              Entrar
            </Link>{' '}
            ou{' '}
            <Link href="/registar" className="underline underline-offset-2">
              registar
            </Link>
            .
          </p>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <Field label="Nome" error={errors.name}>
              <TextInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ex.: Três luas do conflito" />
            </Field>
            <Field label="Resumo (catálogo)" hint="Uma ou duas frases: o que alguém lê na lista antes de abrir." error={errors.summary}>
              <TextArea rows={2} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
            </Field>
            <Field label="Finalidade (usa-a a interpretação)" hint="Texto que entra no contexto do motor simbólico e do LLM. Sê específico: é isto que modula a leitura." error={errors.purpose}>
              <TextArea rows={3} value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} />
            </Field>
            <Field label="Quando usar" error={errors.whenToUse}>
              <TextArea rows={2} value={draft.whenToUse} onChange={(event) => setDraft({ ...draft, whenToUse: event.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoria">
                <Select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as SpreadCategory })} options={SPREAD_CATEGORIES.map((value) => ({ value, label: value }))} />
              </Field>
              <Field label="Ocasião" hint="Opcional: festa, lua nova, transição de trabalho…">
                <TextInput value={draft.occasion} onChange={(event) => setDraft({ ...draft, occasion: event.target.value })} />
              </Field>
            </div>
            <Switch label="Permitir invertidas" hint="Se desligares, o motor ignora a orientação nesta tiragem." checked={draft.allowReversed} onChange={(next) => setDraft({ ...draft, allowReversed: next })} />
            {errors.positions ? <p className="text-xs text-rose-300">{errors.positions}</p> : null}
            {errors.__global ? <p role="alert" className="rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-sm text-rose-200">{errors.__global}</p> : null}
          </div>

          <div className="space-y-3">
            <Field label="Forma na mesa" hint="Arrasta as cartas no esboço para ajustar; a forma só define o ponto de partida.">
              <div className="flex flex-wrap gap-1">
                {SHAPES_LIST.map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setShape(shape as SpreadShape)}
                    aria-pressed={draft.shape === shape}
                    className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${draft.shape === shape ? 'border-gold bg-gold text-[#12100a]' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-gold/60'}`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </Field>
            <div
              ref={previewRef}
              onPointerMove={onPreviewPointerMove}
              onPointerUp={() => setDragIndex(null)}
              onPointerLeave={() => setDragIndex(null)}
              className="relative h-52 touch-none rounded-xl border border-[var(--line)] bg-black/30"
              aria-label="Esboço da disposição; arrasta uma posição para a mover"
            >
              {previewPoints.map((point, index) => (
                <button
                  key={`${point.label}-${index}`}
                  type="button"
                  onPointerDown={() => setDragIndex(index)}
                  className="absolute h-14 w-9 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-[4px] border border-gold/50 bg-[#101425] text-[10px] text-gold-bright active:cursor-grabbing"
                  style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                  title={`${point.label} — x ${point.x.toFixed(2)}, y ${point.y.toFixed(2)}`}
                >
                  {index + 1}
                </button>
              ))}
              <div className="pointer-events-none absolute bottom-1 right-1 opacity-40">
                <SpreadMap points={previewPoints} size={64} showNumbers={false} />
              </div>
            </div>

            <ul className="space-y-2">
              {draft.positions.map((position, index) => (
                <li key={`${position.id}-${index}`} className="rounded-lg border border-[var(--line)] bg-black/20 p-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/45 text-[11px] text-gold-bright">{index + 1}</span>
                    <code className="text-[10px] text-[var(--text-muted)]">{position.id}</code>
                    <div className="ml-auto flex gap-1">
                      <Button size="sm" variant="ghost" sound="none" onClick={() => move(index, -1)} aria-label="Subir posição">
                        ↑
                      </Button>
                      <Button size="sm" variant="ghost" sound="none" onClick={() => move(index, 1)} aria-label="Descer posição">
                        ↓
                      </Button>
                      <Button size="sm" variant="ghost" sound="none" onClick={() => removePosition(index)} aria-label="Remover posição" disabled={draft.positions.length <= 1}>
                        ✕
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput value={position.label} onChange={(event) => update(index, 'label', event.target.value)} placeholder="Etiqueta (ex.: O que está a crescer)" aria-label={`Etiqueta da posição ${index + 1}`} />
                    <TextInput value={position.group} onChange={(event) => update(index, 'group', event.target.value)} placeholder="Grupo (opcional)" aria-label={`Grupo da posição ${index + 1}`} />
                  </div>
                  <TextArea className="mt-2" rows={2} value={position.description} onChange={(event) => update(index, 'description', event.target.value)} placeholder="O que esta posição pergunta, e que recorte dá à carta" aria-label={`Descrição da posição ${index + 1}`} />
                  {errors[`positions.${index}.label`] || errors[`positions.${index}.description`] ? (
                    <p className="mt-1 text-xs text-rose-300">{errors[`positions.${index}.label`] ?? errors[`positions.${index}.description`]}</p>
                  ) : null}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <TextInput value={position.meaningWhenReversed} onChange={(event) => update(index, 'meaningWhenReversed', event.target.value)} placeholder="Nota para invertida (opcional)" aria-label={`Nota para invertida da posição ${index + 1}`} />
                    <TextInput value={position.linkTo} onChange={(event) => update(index, 'linkTo', event.target.value)} placeholder="Ligação a outra posição (id)" aria-label={`Ligação da posição ${index + 1}`} />
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={addPosition}>
              + Adicionar posição
            </Button>
          </div>
        </div>
      </Panel>

      {mine.length > 0 ? (
        <Panel title="As tuas tiragens" subtitle="Guardadas na conta; podem abrir na mesa, ser editadas, exportadas e partilhadas.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {mine.map((spread) => (
              <li key={spread.id} className="flex items-start justify-between gap-3 rounded-lg border border-[var(--line)] p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{spread.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {spread.positions.length} posições · {spread.shape} · {spread.category}
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <Link href={`/ritual/${spread.id}`} className="text-xs text-gold-bright underline-offset-4 hover:underline">
                      Abrir na mesa
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        editId.current = spread.id
                        setDraft({
                          id: spread.id,
                          name: spread.name,
                          summary: spread.summary,
                          purpose: spread.purpose,
                          whenToUse: spread.whenToUse,
                          category: spread.category,
                          shape: spread.shape,
                          occasion: '',
                          allowReversed: spread.allowReversed !== false,
                          positions: spread.positions.map((position) => ({
                            id: position.id,
                            label: position.label,
                            description: position.description,
                            group: position.group ?? '',
                            meaningWhenReversed: position.meaningWhenReversed ?? '',
                            linkTo: position.links?.[0] ?? '',
                            x: position.x,
                            y: position.y,
                          })),
                        })
                        setLoaded(spread.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="text-xs text-[var(--text-muted)] underline-offset-4 hover:underline"
                    >
                      Editar
                    </button>
                    <button type="button" onClick={() => void removeMine(spread.id)} className="text-xs text-rose-300 underline-offset-4 hover:underline">
                      Apagar
                    </button>
                  </div>
                </div>
                <Badge tone="astral">minha</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )

  function update(index: number, key: keyof PositionDraft, value: string) {
    setDraft((current) => ({ ...current, positions: current.positions.map((position, otherIndex) => (otherIndex === index ? { ...position, [key]: value } : position)) }))
  }
}
