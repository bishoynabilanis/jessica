import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Loader2, Quote, Search, Sparkles } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/Markdown'
import { buildLibraryIndex, searchLibrary, scoreText } from '@/lib/librarySearch'
import { generateJSON, generateText } from '@/lib/gemini'
import { languageRule } from '@/lib/prompts'
import { tr } from '@/i18n'

interface Source {
  ref: number
  title: string
  hint: string
  text: string
  to: string
}

const EXAMPLES = [
  'What is photosynthesis?',
  'Explain the present perfect simply',
  'What does the book say about the Nile?',
  'ما معنى الكثافة؟',
]

export function Ask() {
  const customBooks = useApp((s) => s.customBooks)
  const vault = useApp((s) => s.vault)
  const mistakes = useApp((s) => s.mistakes)
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)

  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [mode, setMode] = useState<'idle' | 'ai' | 'search'>('idle')
  const [error, setError] = useState('')
  const [ranked, setRanked] = useState(false)

  const coverage = useMemo(() => {
    const books = customBooks.length
    const pages = customBooks.reduce((sum, book) => sum + book.pageCount, 0)
    const notes = vault.length + mistakes.length
    return { books, pages, notes }
  }, [customBooks, vault.length, mistakes.length])

  const run = async (rawQuery?: string) => {
    const q = (rawQuery ?? query).trim()
    if (!q) return
    setBusy(true)
    setError('')
    setAnswer('')
    setSources([])
    try {
      const index = await buildLibraryIndex(customBooks)
      let passages = searchLibrary(index, q, 12)
      let aiRanked = false
      if (apiKey.trim() && passages.length > 3) {
        try {
          const list = passages
            .map((passage, position) => `[${position}] (${passage.bookTitle}, page ${passage.page}) ${passage.text.slice(0, 300)}`)
            .join('\n')
          const ranking = await generateJSON<{ ids: number[] }>({
            apiKey,
            model,
            temperature: 0,
            maxOutputTokens: 200,
            system: 'You rank textbook passages by how directly they answer a student question. Return only JSON.',
            parts: [
              {
                text: `Question: ${q}\n\nPassages:\n${list}\n\nReturn {"ids":[the 6 most relevant passage indices, best first]}`,
              },
            ],
          })
          const ids = (ranking.ids || []).filter(
            (value) => Number.isInteger(value) && value >= 0 && value < passages.length,
          )
          const unique = [...new Set(ids)].slice(0, 6)
          if (unique.length) {
            passages = unique.map((position) => passages[position])
            aiRanked = true
          }
        } catch {
          /* keep keyword order */
        }
      }
      setRanked(aiRanked)

      const noteHits = [
        ...vault.map((entry) => ({
          kind: 'note' as const,
          title: entry.title,
          hint: entry.tag || tr('Saved note'),
          text: `${entry.title}\n${entry.content}`,
          score: scoreText(`${entry.title} ${entry.content}`, q),
          to: '/vault',
        })),
        ...mistakes.map((entry) => ({
          kind: 'mistake' as const,
          title: entry.question,
          hint: tr('Saved mistake'),
          text: `${entry.question}\n${entry.options[entry.answer] || ''}\n${entry.explanation}`,
          score: scoreText(`${entry.question} ${entry.options[entry.answer] || ''} ${entry.explanation}`, q),
          to: '/mistakes',
        })),
      ]
        .filter((item) => item.score > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      const collected: Source[] = passages.map((passage, index) => ({
        ref: index + 1,
        title: passage.bookTitle,
        hint: `${passage.subject} · ${tr('page')} ${passage.page}`,
        text: passage.text,
        to: `/reader/${passage.bookId}?page=${passage.page}`,
      }))

      for (const hit of noteHits) {
        collected.push({
          ref: collected.length + 1,
          title: hit.title,
          hint: hit.hint,
          text: hit.text,
          to: hit.to,
        })
      }

      setSources(collected)

      if (!collected.length) {
        setMode('search')
        setError(tr('No matches in your library yet. Add a book or try different words.'))
        return
      }

      if (!apiKey.trim()) {
        setMode('search')
        return
      }

      const context = collected
        .map((source) => `[${source.ref}] ${source.title} — ${source.hint}\n${source.text.slice(0, 1400)}`)
        .join('\n\n')

      const text = await generateText({
        apiKey,
        model,
        temperature: 0.25,
        maxOutputTokens: 1000,
        system: `You are Jessica, a warm study tutor. Answer the student's question using ONLY the numbered context passages from their own books and notes. Cite the passages you use as [1], [2]… after each fact. If the context does not contain the answer, say you could not find it in their library and suggest which book or page to open. Be concise (max 180 words). ${languageRule('tutor')}`,
        parts: [
          {
            text: `Context from the student's library:\n\n${context}\n\nQuestion: ${q}\n\nAnswer in the app language with citations.`,
          },
        ],
      })

      setAnswer(text)
      setMode('ai')
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('Try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Ask across everything')}
        title={tr('Ask all your books')}
        subtitle={tr('One question searches your textbooks, saved notes and mistakes — then answers with the exact page as a source.')}
        icon={<Search className="h-5 w-5" />}
      />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && run()}
            placeholder={tr('e.g. Explain photosynthesis from my science book')}
            className="field flex-1 text-sm"
          />
          <Button onClick={() => run()} loading={busy} className="shrink-0">
            <Sparkles className="h-4 w-4" /> {tr('Ask')}
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example)
                void run(example)
              }}
              className="rounded-full border border-line bg-card-2 px-2.5 py-1 text-[10px] font-semibold text-muted transition hover:text-main"
            >
              {example}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[10px] text-muted-2">
          {tr('{books} books · {pages} pages · {notes} notes and mistakes indexed', {
            books: coverage.books,
            pages: coverage.pages,
            notes: coverage.notes,
          })}
        </p>
      </Card>

      {error && (
        <Card className="border-sun/25 bg-sun/5 p-4 text-[11px] leading-relaxed text-sun">{error}</Card>
      )}

      {mode === 'ai' && answer && (
        <Card className="p-4 sm:p-5">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-aurora-300">
            <Sparkles className="h-3.5 w-3.5" /> {tr('Answer from your library')}
          </p>
          <Markdown>{answer}</Markdown>
        </Card>
      )}

      {!!sources.length && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-main">
              {mode === 'ai' ? tr('Sources') : tr('Matches in your library')}
            </h2>
            <span className="flex items-center gap-1.5">
              {ranked && (
                <span className="chip border-violet-neon/30 bg-violet-neon/10 text-violet-glow">
                  {tr('AI-ranked')}
                </span>
              )}
              <span className="chip border-aurora-400/25 text-aurora-200">
                <BookOpen className="h-3 w-3" /> {sources.length}
              </span>
            </span>
          </div>
          {sources.map((source) => (
            <Card key={`${source.ref}-${source.hint}`} className="p-3.5">
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-aurora-400/10 text-[10px] font-black text-aurora-300">
                  {source.ref}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={source.to} className="block truncate text-[12px] font-extrabold text-main hover:text-aurora-300">
                    {source.title}
                  </Link>
                  <p className="text-[10px] text-muted">{source.hint}</p>
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted" dir="auto">
                    {source.text}
                  </p>
                  <Link to={source.to} className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-aurora-300">
                    <BookOpen className="h-3 w-3" /> {tr('Open the page')}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mode === 'idle' && (
        <Card className="flex items-start gap-3 border-line bg-card-2 p-4">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-violet-glow" />
          <p className="text-[11px] leading-relaxed text-muted">
            {tr('Works offline as a smart search. With an AI key it writes a short answer and cites the page it used.')}
          </p>
        </Card>
      )}

      {busy && !answer && (
        <div className="flex items-center justify-center gap-2 py-6 text-[11px] font-bold text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {tr('Searching your books…')}
        </div>
      )}
    </div>
  )
}
