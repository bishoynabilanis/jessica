import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  Layers,
  Search,
  StickyNote,
  X,
} from 'lucide-react'
import { allCards } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { tr } from '@/i18n'

interface Result {
  id: string
  label: string
  hint: string
  to: string
  kind: 'book' | 'unit' | 'vault' | 'planner' | 'mistake' | 'card'
}

const KIND_LABEL: Record<Result['kind'], string> = {
  book: 'Book',
  unit: 'Unit',
  vault: 'Vault',
  planner: 'Planner',
  mistake: 'Mistake',
  card: 'Flashcard',
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const vault = useApp((s) => s.vault)
  const planner = useApp((s) => s.planner)
  const mistakes = useApp((s) => s.mistakes)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState<{ id: string; front: string; subject: string }[]>([])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('jessica-search', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('jessica-search', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    allCards()
      .then((list) => setCards(list.slice(0, 120).map((card) => ({ id: card.id, front: card.front, subject: card.subject }))))
      .catch(() => undefined)
  }, [open])

  const results = useMemo(() => {
    const list: Result[] = []
    for (const book of customBooks) {
      list.push({
        id: `book-${book.id}`,
        label: book.title,
        hint: tr(book.subject),
        to: `/reader/${book.id}`,
        kind: 'book',
      })
      for (const unit of book.units || []) {
        list.push({
          id: `unit-${book.id}-${unit.id}`,
          label: unit.title,
          hint: `${book.title} · ${tr('page')} ${unit.startPage}`,
          to: `/reader/${book.id}?page=${unit.startPage}`,
          kind: 'unit',
        })
      }
    }
    for (const entry of vault) {
      list.push({ id: `v-${entry.id}`, label: entry.title, hint: entry.content.slice(0, 80), to: '/vault', kind: 'vault' })
    }
    for (const task of planner) {
      list.push({ id: `p-${task.id}`, label: task.title, hint: `${task.subject} · ${task.day}`, to: '/study?tab=planner', kind: 'planner' })
    }
    for (const item of mistakes) {
      list.push({ id: `m-${item.id}`, label: item.question, hint: tr(item.subject), to: '/mistakes', kind: 'mistake' })
    }
    for (const card of cards) {
      list.push({ id: `c-${card.id}`, label: card.front, hint: tr(card.subject), to: '/study?tab=cards', kind: 'card' })
    }

    const q = query.trim().toLowerCase()
    if (!q) return list.slice(0, 12)
    return list
      .filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(q))
      .slice(0, 20)
  }, [customBooks, vault, planner, mistakes, cards, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-3 pt-[12vh] sm:p-6" role="dialog" aria-label={tr('Search')}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-app shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-aurora-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr('Search books, units, notes, cards and mistakes…')}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-main outline-none placeholder:text-muted-2"
            autoFocus
          />
          <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-main" aria-label={tr('Close')}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs font-semibold text-muted">{tr('No results. Try another word.')}</p>
          ) : (
            results.map((item) => {
              const Icon =
                item.kind === 'book'
                  ? BookOpen
                  : item.kind === 'unit'
                    ? Layers
                    : item.kind === 'vault'
                      ? StickyNote
                      : item.kind === 'planner'
                        ? CalendarCheck
                        : item.kind === 'mistake'
                          ? AlertTriangle
                          : Layers
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setOpen(false)
                    navigate(item.to)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-start transition hover:bg-white/5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-aurora-400/10 text-aurora-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-main" dir="auto">
                      {item.label}
                    </span>
                    <span className="block truncate text-[9px] text-muted">{item.hint}</span>
                  </span>
                  <span className="shrink-0 text-[8px] font-bold uppercase tracking-wide text-muted-2">{tr(KIND_LABEL[item.kind])}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-2" />
                </button>
              )
            })
          )}
        </div>
        <div className="border-t border-line px-3 py-1.5 text-[9px] font-semibold text-muted-2">
          ⌘K / Ctrl+K {tr('to open search')}
        </div>
      </div>
    </div>
  )
}
