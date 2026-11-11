import { useEffect, useState } from 'react'
import { BookmarkPlus, Copy, Loader2, RefreshCw, Sparkles, StopCircle, Volume2 } from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Markdown } from '@/components/Markdown'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateText } from '@/lib/gemini'
import { unitSummaryPrompt } from '@/lib/prompts'
import { kvGet, kvSet } from '@/lib/db'
import { speakable, useSpeech } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

interface CachedSummary {
  markdown: string
  createdAt: number
}

export function UnitSummaryModal({
  open,
  onClose,
  book,
  chapter,
  unitKey,
  unitTitle,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
  unitKey: string
  unitTitle: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addVault } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop, speaking } = useSpeech()
  const [summary, setSummary] = useState('')
  const [cachedAt, setCachedAt] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSummary('')
    setCachedAt(0)
    setError('')
    setLoading(false)
    let alive = true
    kvGet<CachedSummary>(`summary:${unitKey}`)
      .then((hit) => {
        if (!alive || !hit?.markdown) return
        setSummary(hit.markdown)
        setCachedAt(hit.createdAt)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [open, unitKey])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr('The unit text is still loading'), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    stop()
    try {
      const markdown = await generateText({
        apiKey,
        model,
        system:
          'You are Jessica, a precise Egyptian preparatory tutor. Return clean Markdown only, grounded in the provided unit text.',
        parts: [{ text: unitSummaryPrompt(book, chapter) }],
        temperature: 0.4,
        maxOutputTokens: 1600,
      })
      const clean = markdown.trim()
      if (!clean) throw new Error('The AI returned an empty summary. Try again.')
      setSummary(clean)
      setCachedAt(Date.now())
      await kvSet(`summary:${unitKey}`, { markdown: clean, createdAt: Date.now() } satisfies CachedSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('Could not build the summary.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr('Unit summary')}
      subtitle={`${book.title} · ${unitTitle}`}
      icon={<Sparkles className="h-4.5 w-4.5" />}
      size="lg"
    >
      {!summary ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-aurora-400/15 text-aurora-300">
            <Sparkles className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr('A revision page for this unit')}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr('Big idea, key concepts, formulas, vocabulary, common mistakes and three quick questions — built from the exact unit pages and saved for offline reading.')}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr('Build the summary')}
          </Button>
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="chip border-aurora-400/25 text-aurora-200">
              {tr('Cached on this device · works offline')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => (speaking ? stop() : speak(speakable(summary)))}
              >
                {speaking ? <StopCircle className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {speaking ? tr('Stop') : tr('Listen')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(summary)
                    pushToast({ title: tr('Copied'), type: 'success' })
                  } catch {
                    pushToast({ title: tr('Copy failed'), type: 'error' })
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" /> {tr('Copy')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  addVault({
                    title: `${unitTitle} — ${tr('Summary')}`,
                    content: summary,
                    tag: book.subject,
                    bookId: book.id,
                  })
                  pushToast({ title: tr('Saved to Knowledge Vault'), type: 'success' })
                }}
              >
                <BookmarkPlus className="h-3.5 w-3.5" /> {tr('Save to vault')}
              </Button>
              <Button size="sm" variant="ghost" onClick={generate} loading={loading}>
                <RefreshCw className="h-3.5 w-3.5" /> {tr('Regenerate')}
              </Button>
            </div>
          </div>
          {cachedAt > 0 && (
            <p className="text-[9px] text-muted-2">
              {tr('Generated {date}', { date: new Date(cachedAt).toLocaleString() })}
            </p>
          )}
          {loading && (
            <div className="flex items-center gap-2 rounded-xl border border-line bg-card-2 p-3 text-[11px] font-semibold text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-aurora-300" /> {tr('Writing the summary…')}
            </div>
          )}
          <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-line bg-card-2 p-4">
            <Markdown>{summary}</Markdown>
          </div>
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
