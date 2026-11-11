import { useEffect, useMemo, useState } from 'react'
import { FileText, Loader2, Printer, Sparkles } from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { getQuizzes, saveQuiz } from '@/lib/db'
import { openChapter } from '@/lib/library'
import { generateJSON } from '@/lib/gemini'
import { quizPrompt } from '@/lib/prompts'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { tr } from '@/i18n'

export function Worksheets() {
  const customBooks = useApp((s) => s.customBooks)
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const pushToast = useUI((s) => s.pushToast)
  const [bookId, setBookId] = useState(customBooks[0]?.id || '')
  const [unitId, setUnitId] = useState('')
  const [count, setCount] = useState(8)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [busy, setBusy] = useState(false)
  const [withKey, setWithKey] = useState(true)
  const book = customBooks.find((item) => item.id === bookId)
  const units = book?.units || []
  const unit = units.find((item) => item.id === unitId) || units[0]

  useEffect(() => {
    if (!customBooks.some((item) => item.id === bookId)) setBookId(customBooks[0]?.id || '')
  }, [customBooks, bookId])
  useEffect(() => {
    if (!units.some((item) => item.id === unitId)) setUnitId(units[0]?.id || '')
  }, [units, unitId])

  const title = useMemo(() => (unit ? `${book?.title || ''} — ${unit.title}` : book?.title || ''), [book, unit])

  const generate = async () => {
    if (!book || !unit) return
    setBusy(true)
    try {
      const chapter = await openChapter(book)
      if (!chapter) throw new Error(tr('Could not read the book'))
      const pages = chapter.pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage)
      const unitChapter = {
        bookId: `${book.id}:${unit.id}`,
        pages,
        text: pages.map((page) => `[Page ${page.page}]\n${page.text}`).join('\n\n'),
        extractedAt: Date.now(),
      }
      const unitKey = `${book.id}:${unit.id}`
      const bank = (await getQuizzes()).find((quiz) => quiz.id === unitKey)
      let next = bank?.questions || []
      if (next.length < count && apiKey) {
        const data = await generateJSON<{ questions: QuizQuestion[] }>({
          apiKey,
          model,
          system: 'You write printable school worksheets for Egyptian students. Return only JSON.',
          parts: [{ text: quizPrompt(book, unitChapter, count) }],
          temperature: 0.5,
          maxOutputTokens: 2600,
        })
        const clean = (data.questions || []).filter(
          (q) => q.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer),
        )
        if (clean.length) {
          next = clean
          await saveQuiz({ id: unitKey, bookId: book.id, subject: book.subject, questions: clean, createdAt: Date.now() }).catch(() => undefined)
        }
      }
      if (!next.length) throw new Error(tr('No question bank for this unit yet. Add a Gemini key or take the unit quiz once.'))
      setQuestions(next.slice(0, count))
    } catch (err) {
      pushToast({
        title: tr('Could not build the worksheet'),
        description: err instanceof Error ? err.message : tr('Try again.'),
        type: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Print studio')}
        title={tr('Worksheets & answer keys')}
        subtitle={tr('Build a printable worksheet from any imported unit, with or without an answer key.')}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <Button variant="secondary" onClick={() => window.print()} disabled={!questions.length}>
            <Printer className="h-4 w-4" /> {tr('Print / save PDF')}
          </Button>
        }
      />

      {!customBooks.length ? (
        <Card className="p-6 text-center text-xs font-bold text-main">{tr('Import a book first.')}</Card>
      ) : (
        <>
          <Card className="p-4 sm:p-5 print:hidden">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <label className="block sm:col-span-3">
                <span className="label mb-1 block">{tr('Book')}</span>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="field text-xs">
                  {customBooks.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Unit')}</span>
                <select value={unit?.id || ''} onChange={(e) => setUnitId(e.target.value)} className="field text-xs">
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Questions')}</span>
                <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="field text-xs">
                  {[5, 8, 10, 15, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-end gap-2 pb-2 text-[11px] font-bold text-main">
                <input type="checkbox" checked={withKey} onChange={(e) => setWithKey(e.target.checked)} className="h-4 w-4 accent-aurora-400" />
                {tr('Include answer key')}
              </label>
            </div>
            <Button className="mt-3" onClick={generate} loading={busy} disabled={!unit}>
              <Sparkles className="h-4 w-4" /> {tr('Build worksheet')}
            </Button>
          </Card>

          {busy && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-aurora-300" /> {tr('Building your worksheet…')}
            </div>
          )}

          {questions.length > 0 && (
            <div className="worksheet-print rounded-3xl border border-line bg-white p-6 text-ink-950">
              <div className="border-b border-ink-950/20 pb-3">
                <h1 className="font-display text-xl font-extrabold">{title}</h1>
                <p className="mt-1 text-[11px] text-ink-600">
                  {tr('Name')}: ______________________________ · {tr('Class')}: ______________ · {tr('Date')}: ____________
                </p>
                <p className="mt-1 text-[10px] text-ink-600">
                  {questions.length} {tr('questions')} · Jessica
                </p>
              </div>

              <ol className="mt-4 space-y-4">
                {questions.map((question, index) => (
                  <li key={index} className="break-inside-avoid">
                    <p className="text-[13px] font-bold leading-relaxed">
                      {index + 1}. {question.question}
                    </p>
                    <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <p key={optionIndex} className="text-[12px] text-ink-800">
                          <span className="font-bold">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              {withKey && (
                <div className="mt-6 border-t border-ink-950/20 pt-3">
                  <h2 className="font-display text-sm font-extrabold">{tr('Answer key')}</h2>
                  <p className="mt-1 text-[12px] leading-relaxed">
                    {questions.map((question, index) => `${index + 1}-${String.fromCharCode(65 + question.answer)}`).join(' · ')}
                  </p>
                  <div className="mt-2 space-y-1 text-[10px] text-ink-600">
                    {questions.map((question, index) => (
                      <p key={index}>
                        {index + 1}. {question.explanation}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
