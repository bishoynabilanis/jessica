import { useEffect, useState } from 'react'
import { Brain, Layers, RefreshCw, Sparkles, Save } from 'lucide-react'
import type { Book, ChapterText, FlashcardSeed, SRSCard } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState, Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { flashcardsPrompt } from '@/lib/prompts'
import { newCard } from '@/lib/srs'
import { putCards, cardsByBook } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { SrsReview } from '@/components/study/SrsReview'
import { tr } from '@/i18n'

export function FlashcardsModal({
  open,
  onClose,
  book,
  chapter,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addXP } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeds, setSeeds] = useState<FlashcardSeed[]>([])
  const [saved, setSaved] = useState<SRSCard[]>([])
  const [mode, setMode] = useState<'generate' | 'preview' | 'review'>('generate')
  const [existing, setExisting] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    cardsByBook(book.id).then((cards) => setExisting(cards.length))
    setMode('generate')
    setSeeds([])
    setSaved([])
    setError('')
  }, [open, book.id])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("Wait for the PDF text to load, then try again."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateJSON<{ cards: FlashcardSeed[] }>({
        apiKey,
        model,
        system: 'You are an expert spaced-repetition deck designer for a 13-year-old student. Return only JSON.',
        parts: [{ text: flashcardsPrompt(book, chapter, 8) }],
        temperature: 0.65,
        maxOutputTokens: 1800,
      })
      const cards = (data.cards || [])
        .filter((c) => c.front?.trim() && c.back?.trim())
        .slice(0, 10)
        .map((c) => ({ front: c.front.trim().slice(0, 220), back: c.back.trim().slice(0, 400) }))
      if (!cards.length) throw new Error('The AI did not return usable cards. Try again.')
      setSeeds(cards)
      setMode('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate flashcards.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const cards = seeds.map((seed) =>
        newCard({
          bookId: book.id,
          subject: book.subject,
          front: seed.front,
          back: seed.back,
          source: `${book.title} · AI`,
        }),
      )
      await putCards(cards)
      setSaved(cards)
      setExisting((n) => n + cards.length)
      addXP(15, true)
      pushToast({ title: `${cards.length} cards added to SRS`, description: tr("They are due right now — review while it’s fresh."), type: 'xp', xp: 15 })
      setMode('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save cards.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Smart flashcards + SRS")}
      subtitle={tr("AI turns this chapter into memory cards, then schedules them at the perfect moment.")}
      icon={<Layers className="h-4.5 w-4.5" />}
      size="lg"
    >
      {mode === 'generate' && (
        <div>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-gradient-to-br from-violet-neon/10 via-card-2 to-aurora-400/10 p-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-violet-neon/15 text-violet-glow">
              <Brain className="h-8 w-8" />
            </span>
            <div>
              <p className="font-display text-lg font-extrabold text-main">{tr("Turn this chapter into memory")}</p>
              <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
                {tr("Jessica extracts the highest-yield terms, rules and formulas from")} <span className="font-semibold text-main">{book.title}</span> {tr("and builds an Anki-style deck. Your progress lives in IndexedDB — even offline.")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={generate} loading={loading}>
                <Sparkles className="h-4 w-4" /> {tr("Generate 8 cards")}
              </Button>
              {existing > 0 && (
                <Button variant="secondary" onClick={() => setMode('review')}>
                  <Layers className="h-4 w-4" /> {tr("Review")} {existing} {tr("existing")}
                </Button>
              )}
            </div>
            {loading && <Spinner label={tr("Designing your deck…")} className="py-2" />}
            {error && <p className="text-[11px] text-coral">{error}</p>}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: tr("AI-made"), text: tr("Grounded in your actual textbook extract.") },
              { icon: Brain, title: tr("SM-2 scheduler"), text: tr("Again, hard, good or easy — Jessica handles timing.") },
              { icon: Layers, title: tr("Offline forever"), text: tr("Cards stay in IndexedDB on this device.") },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-card-2 p-3">
                <f.icon className="mb-1.5 h-4 w-4 text-aurora-300" />
                <p className="text-xs font-bold text-main">{f.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'preview' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-main">{seeds.length} {tr("cards ready")}</p>
              <p className="text-[10px] text-muted">{tr("Check the backs, then add them to your spaced-repetition deck.")}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("Regenerate")}
            </Button>
          </div>
          <div className="grid max-h-[45vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {seeds.map((seed, i) => (
              <div key={i} className="rounded-2xl border border-line bg-card-2 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-aurora-300">{tr("Front")}</p>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-main">{seed.front}</p>
                <div className="my-2 border-t border-dashed border-line" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-glow">{tr("Back")}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{seed.back}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={save} loading={saving}>
            <Save className="h-4 w-4" /> {tr("Add")} {seeds.length} {tr("cards & review now")}
          </Button>
          {error && <p className="mt-2 text-[11px] text-coral">{error}</p>}
        </div>
      )}

      {mode === 'review' && (
        <div>
          <SrsReview deck={saved.length ? saved : undefined} bookId={book.id} compact />
          <div className="mt-3 flex justify-between">
            <Button size="sm" variant="ghost" onClick={() => setMode('generate')}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("Generate more")}
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              {tr("Done")}
            </Button>
          </div>
        </div>
      )}

      {mode === 'generate' && existing === 0 && (
        <EmptyState icon={<Layers className="h-6 w-6" />} title={tr("Your deck is a blank canvas")} description={tr("Generate your first set above. Reviewing just 10 cards a day compounds into serious memory.")} className="mt-4 py-6" />
      )}
    </Modal>
  )
}
