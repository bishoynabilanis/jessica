import { useEffect, useState } from 'react'
import { Check, Copy, QrCode, Sparkles, Users } from 'lucide-react'
import type { AssignmentPayload, AssignmentResult } from '@/lib/assignments'
import {
  CHAT_LINK_LIMIT,
  PACK_CARD_RULE,
  QR_LINK_LIMIT,
  cleanCards,
  decodeResult,
  fitPack,
  type PackFit,
} from '@/lib/assignments'
import type { GradeLevel } from '@/types'
import { gradeLabel } from '@/data/officialBooks'
import { BANK_SUBJECTS, buildDrill, type BankSubject } from '@/lib/questionBank'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { getQuizzes, saveQuiz } from '@/lib/db'
import { openChapter } from '@/lib/library'
import { generateJSON } from '@/lib/gemini'
import { flashcardsPrompt, quizPrompt } from '@/lib/prompts'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, uid } from '@/lib/utils'
import { tr } from '@/i18n'

const STORAGE = 'jessica-assignment-results'
const GRADES: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function Teacher() {
  const customBooks = useApp((s) => s.customBooks)
  const defaultGrade = useApp((s) => s.settings.gradeLevel)
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const pushToast = useUI((s) => s.pushToast)
  const books = customBooks
  const hasBookUnits = books.some((item) => (item.units || []).length > 0)
  const [source, setSource] = useState<'bank' | 'book'>(() => (hasBookUnits ? 'book' : 'bank'))
  const [bankSubject, setBankSubject] = useState<BankSubject>('Mathematics')
  const [bankGrade, setBankGrade] = useState<GradeLevel>(defaultGrade)
  const [bookId, setBookId] = useState(books[0]?.id || '')
  const [unitId, setUnitId] = useState('')
  const [count, setCount] = useState(8)
  const [busy, setBusy] = useState(false)
  const [assignment, setAssignment] = useState<AssignmentPayload | null>(null)
  const [url, setUrl] = useState('')
  const [qr, setQr] = useState('')
  const [withCards, setWithCards] = useState(true)
  const [fit, setFit] = useState<{ chat: PackFit; qr: PackFit } | null>(null)
  const [cardNote, setCardNote] = useState('')
  const [codes, setCodes] = useState('')
  const [results, setResults] = useState<AssignmentResult[]>([])
  const [author, setAuthor] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    explanation: '',
  })

  const book = books.find((item) => item.id === bookId)
  const units = book?.units || []
  const unit = units.find((item) => item.id === unitId) || units[0]

  useEffect(() => {
    if (!books.some((item) => item.id === bookId)) setBookId(books[0]?.id || '')
  }, [books, bookId])

  useEffect(() => {
    if (!units.some((item) => item.id === unitId)) setUnitId(units[0]?.id || '')
  }, [units, unitId])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || '[]') as AssignmentResult[]
      if (Array.isArray(saved)) setResults(saved)
    } catch {
      /* ignore */
    }
  }, [])

  const generate = async () => {
    if (source === 'book' && (!book || !unit)) return
    setBusy(true)
    setAssignment(null)
    setUrl('')
    setQr('')
    setFit(null)
    setCardNote('')
    try {
      let payload: AssignmentPayload
      if (source === 'bank') {
        const built = buildDrill(bankSubject, bankGrade, count).map((item) => ({
          question: item.prompt,
          options: item.options,
          answer: item.answer,
          explanation: item.explanation,
          topic: item.skill,
          difficulty: 'medium' as const,
        }))
        if (!built.length) throw new Error(tr('Could not build the assignment'))
        payload = {
          v: 2,
          id: uid('as_'),
          grade: bankGrade,
          subject: bankSubject,
          bookTitle: tr('Question bank'),
          unitTitle: `${tr(bankSubject)} · ${tr(gradeLabel(bankGrade))}`,
          unitKey: `bank:${bankSubject}:${bankGrade}`,
          questions: built,
          createdAt: Date.now(),
        }
      } else {
        if (!book || !unit) return
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
        let questions = bank?.questions || []
        if (questions.length < count && apiKey) {
          const data = await generateJSON<{ questions: AssignmentPayload['questions'] }>({
            apiKey,
            model,
            system: 'You write fair, curriculum-aligned quizzes for Egyptian students. Return only JSON.',
            parts: [{ text: quizPrompt(book, unitChapter, count) }],
            temperature: 0.5,
            maxOutputTokens: 2400,
          })
          const clean = (data.questions || []).filter(
            (q) => q.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer),
          )
          if (clean.length) {
            questions = clean
            await saveQuiz({ id: unitKey, bookId: book.id, subject: book.subject, questions: clean, createdAt: Date.now() }).catch(() => undefined)
          }
        }
        if (!questions.length) {
          throw new Error(tr('No question bank for this unit yet. Add a Gemini key or take the unit quiz once.'))
        }
        let cards: AssignmentPayload['cards'] = []
        if (withCards && apiKey) {
          try {
            const data = await generateJSON<{ cards?: unknown }>({
              apiKey,
              model,
              system: 'You write short study cards for Egyptian students, only from the given textbook pages. Return only JSON.',
              parts: [{ text: `${flashcardsPrompt(book, unitChapter, 8)}\n${PACK_CARD_RULE}` }],
              temperature: 0.3,
              maxOutputTokens: 1800,
            })
            cards = cleanCards(data.cards, 8)
          } catch {
            cards = []
          }
          if (!cards.length) setCardNote(tr('Study cards could not be made this time. The pack has the quiz only.'))
        } else if (withCards && !apiKey) {
          setCardNote(tr('Study cards need an AI key on this device. The pack has the quiz only.'))
        }
        payload = {
          v: 2,
          id: uid('as_'),
          grade: book.grade,
          subject: book.subject,
          bookTitle: book.title,
          unitTitle: unit.title,
          unitKey,
          questions: questions.slice(0, count),
          cards,
          createdAt: Date.now(),
        }
      }
      setAssignment(payload)
      const chat = fitPack(payload, CHAT_LINK_LIMIT)
      const small = fitPack(payload, QR_LINK_LIMIT)
      setFit({ chat, qr: small })
      setUrl(chat.link)
      const QRCode = (await import('qrcode')).default
      setQr(
        await QRCode.toDataURL(small.link, {
          errorCorrectionLevel: 'L' as const,
          margin: 1,
          width: 360,
          color: { dark: '#0b1220', light: '#ffffff' },
        }),
      )
    } catch (err) {
      pushToast({
        title: tr('Could not build the assignment'),
        description: err instanceof Error ? err.message : tr('Try again.'),
        type: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  const exportResultsCsv = () => {
    const rows = [
      ['Student', 'Score', 'Total', 'Percent', 'Date'],
      ...results.map((item) => [
        item.name || 'Student',
        String(item.score),
        String(item.total),
        `${Math.round((item.score / item.total) * 100)}%`,
        new Date(item.date).toISOString(),
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jessica-class-results-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const saveQuestion = async () => {
    if (!book || !unit || !author.question.trim() || author.options.some((option) => !option.trim())) {
      pushToast({ title: tr('Fill the question and all four options.'), type: 'info' })
      return
    }
    const unitKey = `${book.id}:${unit.id}`
    try {
      const bank = (await getQuizzes()).find((quiz) => quiz.id === unitKey)
      const questions = [
        ...(bank?.questions || []),
        {
          question: author.question.trim(),
          options: author.options.map((option) => option.trim()),
          answer: author.answer,
          explanation: author.explanation.trim() || tr('Review the unit.'),
          topic: author.topic.trim() || book.subject,
          difficulty: author.difficulty,
        },
      ]
      await saveQuiz({ id: unitKey, bookId: book.id, subject: book.subject, questions, createdAt: Date.now() })
      setAuthor({ question: '', options: ['', '', '', ''], answer: 0, topic: '', difficulty: 'medium', explanation: '' })
      pushToast({ title: tr('Question added to the bank'), type: 'success' })
    } catch {
      pushToast({ title: tr('Could not save the question'), type: 'error' })
    }
  }

  const parseResults = () => {
    const found: AssignmentResult[] = []
    for (const line of codes.split(/\s+/).filter(Boolean)) {
      const code = line.includes('r=') ? line.split('r=').pop() || '' : line
      const decoded = decodeResult(code)
      if (decoded) found.push(decoded)
    }
    if (!found.length) {
      pushToast({ title: tr('No valid result codes found'), type: 'info' })
      return
    }
    const merged = [...found, ...results.filter((item) => !found.some((entry) => entry.id === item.id && entry.name === item.name))]
    setResults(merged)
    try {
      localStorage.setItem(STORAGE, JSON.stringify(merged.slice(0, 200)))
    } catch {
      /* ignore */
    }
    setCodes('')
    pushToast({ title: tr('{n} results loaded', { n: found.length }), type: 'success' })
  }

  const average = results.length ? Math.round((results.reduce((sum, item) => sum + item.score / item.total, 0) / results.length) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Class mode')}
        title={tr('Teacher & class assignments')}
        subtitle={tr('Build a unit quiz, share it as a link or QR, then paste the result codes back to see the class. No server involved.')}
        icon={<Users className="h-5 w-5" />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
              <Sparkles className="h-4 w-4 text-aurora-300" /> {tr('Create an assignment')}
            </p>
            <div className="inline-flex rounded-xl border border-line bg-card-2 p-0.5">
              <button
                type="button"
                data-testid="teacher-source-bank"
                onClick={() => setSource('bank')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition',
                  source === 'bank' ? 'bg-aurora-400 text-ink-950' : 'text-muted hover:text-main',
                )}
              >
                {tr('Question bank')}
              </button>
              <button
                type="button"
                data-testid="teacher-source-book"
                onClick={() => setSource('book')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-extrabold transition',
                  source === 'book' ? 'bg-aurora-400 text-ink-950' : 'text-muted hover:text-main',
                )}
              >
                {tr('Book')}
              </button>
            </div>
          </div>

          {source === 'bank' ? (
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              <label className="block">
                <span className="label mb-1 block">{tr('Subject')}</span>
                <select
                  data-testid="teacher-bank-subject"
                  value={bankSubject}
                  onChange={(e) => setBankSubject(e.target.value as BankSubject)}
                  className="field text-xs"
                >
                  {BANK_SUBJECTS.map((item) => (
                    <option key={item} value={item}>
                      {tr(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Grade')}</span>
                <select
                  data-testid="teacher-bank-grade"
                  value={bankGrade}
                  onChange={(e) => setBankGrade(Number(e.target.value) as GradeLevel)}
                  className="field text-xs"
                >
                  {GRADES.map((item) => (
                    <option key={item} value={item}>
                      {tr(gradeLabel(item))}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Questions')}</span>
                <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="field text-xs">
                  {[5, 8, 10, 15].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="label mb-1 block">{tr('Book')}</span>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="field text-xs">
                  {books.map((item) => (
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
                  {[5, 8, 10, 15].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[11px] font-bold text-muted sm:col-span-2">
                <input type="checkbox" data-testid="teacher-with-cards" checked={withCards} onChange={(e) => setWithCards(e.target.checked)} />
                {tr('Add study cards from the unit pages (needs an AI key on this device)')}
              </label>
            </div>
          )}

          <Button
            className="mt-3"
            data-testid="teacher-generate"
            onClick={generate}
            loading={busy}
            disabled={source === 'book' && !unit}
          >
            <QrCode className="h-4 w-4" /> {tr('Generate link & QR')}
          </Button>

            {assignment && (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-line bg-card-2 p-3">
                  <p className="text-xs font-extrabold text-main">{assignment.unitTitle}</p>
                  <p className="text-[10px] text-muted">
                    {assignment.bookTitle} · {assignment.questions.length} {tr('questions')}{fit ? ` · ${fit.chat.payload.cards?.length || 0} ${tr('study cards')}` : ''} · {tr(assignment.subject)}
                  </p>
                </div>
                {cardNote && <p data-testid="pack-card-note" className="text-[10px] text-sun">{cardNote}</p>}
                {fit && (
                  <p data-testid="pack-size" className="text-[10px] leading-relaxed text-muted">
                    {tr('The QR carries {q} questions and {c} study cards. The link carries {q2} questions and {c2} study cards.', {
                      q: fit.qr.payload.questions.length,
                      c: fit.qr.payload.cards?.length || 0,
                      q2: fit.chat.payload.questions.length,
                      c2: fit.chat.payload.cards?.length || 0,
                    })}{' '}
                    {fit.qr.droppedQuestions + fit.qr.droppedCards > 0 || !fit.qr.explanations
                      ? tr('For the full pack, send the link and not the QR.')
                      : ''}
                  </p>
                )}
                {qr && <img src={qr} alt={tr('Assignment QR')} className="mx-auto h-48 w-48 rounded-2xl border border-line bg-white p-2" />}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await navigator.clipboard.writeText(url)
                      pushToast({ title: tr('Link copied'), type: 'success' })
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> {tr('Copy link')}
                  </Button>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      {tr('Open assignment')}
                    </Button>
                  </a>
                </div>
                <input readOnly value={url} className="field text-[10px]" dir="ltr" />
              </div>
            )}
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
              <Check className="h-4 w-4 text-aurora-300" /> {tr('Class results')}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              {tr('Paste the result codes students send you — one per line. They decode on this device.')}
            </p>
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              placeholder={tr('Paste result codes or links here…')}
              className="field mt-3 min-h-24 text-[10px]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={parseResults} disabled={!codes.trim()}>
                {tr('Load results')}
              </Button>
              <Button size="sm" variant="secondary" onClick={exportResultsCsv} disabled={!results.length}>
                {tr('Export CSV')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setResults([])
                  localStorage.removeItem(STORAGE)
                }}
              >
                {tr('Clear')}
              </Button>
              <span className="ms-auto self-center text-[10px] font-bold text-muted">
                {results.length} {tr('students')} · {tr('average')} {average}%
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {results.length === 0 ? (
                <p className="text-[11px] text-muted">{tr('No results loaded yet.')}</p>
              ) : (
                results
                  .slice()
                  .sort((a, b) => b.score / b.total - a.score / a.total)
                  .map((item) => {
                    const percent = Math.round((item.score / item.total) * 100)
                    return (
                      <div key={`${item.id}-${item.name}-${item.date}`} className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2">
                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black',
                            percent >= 80 ? 'bg-aurora-400/15 text-aurora-300' : percent >= 50 ? 'bg-sun/15 text-sun' : 'bg-coral/15 text-coral',
                          )}
                        >
                          {percent}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-main">{item.name || tr('Student')}</p>
                          <p className="text-[9px] text-muted">
                            {item.score}/{item.total} · {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
            <Sparkles className="h-4 w-4 text-aurora-300" /> {tr('Question studio')}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {tr('Add your own question to this unit’s bank. It becomes available for assignments and worksheets.')}
          </p>
          <div className="mt-3 grid gap-2">
            <textarea
              value={author.question}
              onChange={(e) => setAuthor({ ...author, question: e.target.value })}
              placeholder={tr('Question text')}
              className="field min-h-16 text-xs"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {author.options.map((option, index) => (
                <input
                  key={index}
                  value={option}
                  onChange={(e) => {
                    const options = [...author.options]
                    options[index] = e.target.value
                    setAuthor({ ...author, options })
                  }}
                  placeholder={`${String.fromCharCode(65 + index)}. ${tr('Option')}`}
                  className="field py-1.5 text-xs"
                />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <label className="block">
                <span className="label mb-1 block">{tr('Correct answer')}</span>
                <select value={author.answer} onChange={(e) => setAuthor({ ...author, answer: Number(e.target.value) })} className="field py-1.5 text-xs">
                  {[0, 1, 2, 3].map((index) => (
                    <option key={index} value={index}>
                      {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Skill')}</span>
                <input value={author.topic} onChange={(e) => setAuthor({ ...author, topic: e.target.value })} placeholder={tr('e.g. fractions')} className="field py-1.5 text-xs" />
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Difficulty')}</span>
                <select value={author.difficulty} onChange={(e) => setAuthor({ ...author, difficulty: e.target.value as typeof author.difficulty })} className="field py-1.5 text-xs">
                  <option value="easy">{tr('Easy')}</option>
                  <option value="medium">{tr('Medium')}</option>
                  <option value="hard">{tr('Hard')}</option>
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Explanation')}</span>
                <input value={author.explanation} onChange={(e) => setAuthor({ ...author, explanation: e.target.value })} className="field py-1.5 text-xs" />
              </label>
            </div>
            <Button className="w-fit" size="sm" onClick={saveQuestion}>
              {tr('Add question')}
            </Button>
          </div>
        </Card>
    </div>
  )
}
