import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Brain,
  Share2,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Printer,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { getQuizzes } from '@/lib/db'
import { PageHeader } from '@/components/common/PageHeader'
import { QuizGame } from '@/components/tools/QuizGame'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { cn, pct, todayKey } from '@/lib/utils'
import { tr } from '@/i18n'
import { shareAchievement } from '@/lib/shareCard'

interface StoredBank {
  id: string
  subject: string
  questions: QuizQuestion[]
  createdAt: number
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim()
}

export function Skills() {
  const {
    name,
    xp,
    streak,
    customBooks,
    unitMastery,
    skillStats,
    completedTopics,
    exams,
    lessonProgress,
  } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [banks, setBanks] = useState<StoredBank[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('All')
  const [practice, setPractice] = useState<QuizQuestion[] | null>(null)

  useEffect(() => {
    getQuizzes()
      .then((list) => setBanks(list as StoredBank[]))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  const subjects = useMemo(
    () => ['All', ...new Set([...customBooks.map((book) => book.subject), ...Object.keys(skillStats).map((key) => key.split('|')[0])])],
    [customBooks, skillStats],
  )

  const skills = useMemo(() => {
    return Object.entries(skillStats)
      .map(([key, value]) => {
        const [subjectName, topic] = key.split('|')
        return { subject: subjectName, topic, ...value, accuracy: pct(value.correct, value.total) }
      })
      .filter((item) => subject === 'All' || item.subject === subject)
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
  }, [skillStats, subject])

  const readiness = useMemo(() => {
    const books = customBooks.filter((book) => subject === 'All' || book.subject === subject)
    return books.map((book) => {
      const units = book.units || []
      const scores = units.map((unit) => {
        const stat = unitMastery[`${book.id}:${unit.id}`]
        const best = stat ? pct(stat.best, stat.total) : 0
        const lesson = lessonProgress[`${book.id}:${unit.id}`]?.done ? 100 : 0
        const progress = useApp.getState().bookProgress[book.id]
        const read = progress && progress.lastPage >= unit.startPage ? 100 : 0
        return Math.round(best * 0.6 + lesson * 0.2 + read * 0.2)
      })
      const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      return { book, average, units: units.length }
    })
  }, [customBooks, unitMastery, lessonProgress, subject])

  const unitTitle = (unitKey: string) => {
    const [bookId, unitId] = unitKey.split(':')
    const book = customBooks.find((item) => item.id === bookId)
    const unit = book?.units?.find((item) => item.id === unitId)
    return { book, unit }
  }

  const filteredBanks = banks.filter((bank) => {
    const { book } = unitTitle(bank.id)
    return subject === 'All' || book?.subject === subject
  })

  const practiceSkill = (skill: { subject: string; topic: string }) => {
    const topic = normalize(skill.topic)
    const questions = banks
      .filter((bank) => {
        const { book } = unitTitle(bank.id)
        return !book || book.subject === skill.subject
      })
      .flatMap((bank) => bank.questions)
      .filter((question) => normalize(question.topic || '') === topic || normalize(question.topic || '').includes(topic))
    if (!questions.length) {
      pushToast({
        title: tr('No saved questions for this skill yet'),
        description: tr('Take a unit quiz for this skill first, then come back.'),
        type: 'info',
      })
      return
    }
    setPractice(questions.slice(0, 10))
  }

  const exportCsv = () => {
    const rows = [
      ['Subject', 'Skill', 'Correct', 'Total', 'Accuracy', 'Last activity'],
      ...skills.map((item) => [
        item.subject,
        item.topic,
        String(item.correct),
        String(item.total),
        `${item.accuracy}%`,
        new Date(item.lastAt).toISOString(),
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jessica-skills-${todayKey()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (practice) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-extrabold text-main">{tr('Skill practice')}</h1>
          <Button size="sm" variant="ghost" onClick={() => setPractice(null)}>
            <X className="h-3.5 w-3.5" /> {tr('Close')}
          </Button>
        </div>
        <Card className="p-4">
          <QuizGame questions={practice} subject={subject === 'All' ? 'Review' : subject} title={tr('Skill practice')} />
        </Card>
      </div>
    )
  }

  const totalCorrect = Object.values(skillStats).reduce((sum, item) => sum + item.correct, 0)
  const { level } = levelInfo(xp)
  const badges = [
    { emoji: '🔥', label: tr('On a streak'), unlocked: streak >= 1 },
    { emoji: '📚', label: tr('First unit'), unlocked: completedTopics.length >= 1 },
    { emoji: '🧠', label: tr('100 correct'), unlocked: totalCorrect >= 100 },
    { emoji: '🏆', label: tr('Exam ready'), unlocked: exams.some((exam) => pct(exam.score, exam.total) >= 80) },
    { emoji: '🎓', label: tr('Book finished'), unlocked: customBooks.some((book) => !!book.units?.length && book.units.every((unit) => completedTopics.includes(`${book.id}:${unit.id}`))) },
    { emoji: '⭐', label: tr('Level 5'), unlocked: level >= 5 },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Mastery & readiness')}
        title={tr('Skills map')}
        subtitle={tr('See every skill, how ready you are for each unit, and exactly what to practise next.')}
        icon={<Target className="h-5 w-5" />}
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={exportCsv} disabled={!skills.length}>
              <Download className="h-3.5 w-3.5" /> {tr('Export CSV')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> {tr('Certificate')}
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const result = await shareAchievement({
                  title: tr('Certificate of achievement'),
                  subtitle: name || tr('Student'),
                  emoji: '🏆',
                  lines: [
                    `${tr('Level')} ${level}`,
                    `${xp} XP`,
                    `${streak} ${tr('day streak')}`,
                    `${completedTopics.length} ${tr('units mastered')}`,
                  ],
                })
                if (result === 'downloaded') {
                  pushToast({ title: tr('Certificate downloaded'), type: 'success' })
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" /> {tr('Share')}
            </Button>
          </>
        }
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map((item) => (
          <button
            key={item}
            onClick={() => setSubject(item)}
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
              subject === item ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
            )}
          >
            {tr(item)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
            <Trophy className="h-4 w-4 text-sun" /> {tr('Exam readiness')}
          </p>
          {readiness.length === 0 ? (
            <p className="mt-2 text-[11px] text-muted">{tr('Import a book first.')}</p>
          ) : (
            <div className="mt-3 space-y-3">
              {readiness.map((item) => (
                <div key={item.book.id}>
                  <div className="flex items-center justify-between text-[10px] font-bold text-main">
                    <Link to={`/reader/${item.book.id}`} className="truncate hover:underline">
                      {item.book.title}
                    </Link>
                    <span className={item.average >= 80 ? 'text-aurora-300' : item.average >= 50 ? 'text-sun' : 'text-coral'}>
                      {item.average}%
                    </span>
                  </div>
                  <ProgressBar value={item.average} height="h-1.5" className="mt-1" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
            <Brain className="h-4 w-4 text-violet-glow" /> {tr('Skill mastery')}
          </p>
          {skills.length === 0 ? (
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              {tr('Answer some quiz questions and your skills will appear here automatically.')}
            </p>
          ) : (
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pe-1">
              {skills.slice(0, 16).map((item) => (
                <div key={`${item.subject}-${item.topic}`} className="rounded-xl border border-line bg-card-2 p-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                    <span className="truncate text-main">{item.topic}</span>
                    <span className={item.accuracy >= 80 ? 'text-aurora-300' : item.accuracy >= 50 ? 'text-sun' : 'text-coral'}>
                      {item.accuracy}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar value={item.accuracy} height="h-1" className="flex-1" />
                    <button
                      onClick={() => practiceSkill(item)}
                      className="shrink-0 rounded-lg border border-line px-1.5 py-0.5 text-[8px] font-bold text-muted hover:text-main"
                    >
                      {tr('Practise')}
                    </button>
                  </div>
                  <p className="mt-0.5 text-[8px] text-muted-2">
                    {item.correct}/{item.total} · {tr(item.subject)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
            <FileText className="h-4 w-4 text-sky" /> {tr('Saved question banks')}
          </p>
          <span className="text-[9px] font-bold text-muted">{filteredBanks.length} {tr('banks')}</span>
        </div>
        {loading ? (
          <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-aurora-300" /> {tr('Loading banks…')}
          </p>
        ) : filteredBanks.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={tr('No saved banks yet')}
            description={tr('Take a unit quiz or build a worksheet — its questions are saved automatically.')}
            action={
              <Link to="/games">
                <Button size="sm">{tr('Start a quiz')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBanks.map((bank) => {
              const { book, unit } = unitTitle(bank.id)
              return (
                <div key={bank.id} className="rounded-2xl border border-line bg-card-2 p-3">
                  <p className="truncate text-[11px] font-extrabold text-main">{unit?.title || bank.id}</p>
                  <p className="truncate text-[9px] text-muted">{book?.title || tr(bank.subject)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {[...new Set(bank.questions.map((question) => question.topic).filter(Boolean))]
                      .slice(0, 4)
                      .map((topic) => (
                        <span key={topic} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-muted">
                          {topic}
                        </span>
                      ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted">{bank.questions.length} {tr('questions')}</span>
                    <Button size="sm" variant="ghost" onClick={() => setPractice(bank.questions.slice(0, 10))}>
                      {tr('Practise')}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
          <Award className="h-4 w-4 text-sun" /> {tr('Achievements')}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={cn(
                'rounded-2xl border p-3 text-center',
                badge.unlocked ? 'border-sun/40 bg-sun/10' : 'border-line bg-card-2 opacity-45 grayscale',
              )}
            >
              <p className="text-2xl">{badge.emoji}</p>
              <p className="mt-1 text-[8px] font-bold text-main">{badge.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="certificate-print" dir="rtl">
        <div style={{ border: '6px double #e0a800', padding: 40, textAlign: 'center', fontFamily: 'Cairo, sans-serif' }}>
          <p style={{ letterSpacing: 4, fontSize: 12, color: '#777' }}>JESSICA LEARNING</p>
          <h1 style={{ fontSize: 30, margin: '12px 0', color: '#0b1220' }}>شهادة إنجاز</h1>
          <p style={{ fontSize: 14 }}>تُمنح هذه الشهادة إلى</p>
          <p style={{ fontSize: 26, fontWeight: 800, margin: '8px 0', color: '#047a6d' }}>{name || '—'}</p>
          <p style={{ fontSize: 13, lineHeight: 1.9 }}>
            لإتمام {completedTopics.length} وحدة دراسية، والوصول إلى المستوى {level}،
            <br />والمحافظة على سلسلة {streak} يوم من التعلم المستمر.
          </p>
          <p style={{ marginTop: 20, fontSize: 11, color: '#666' }}>
            {new Date().toLocaleDateString('ar-EG')} · Jessica — عالم تعلّم ذكي
          </p>
        </div>
      </div>
    </div>
  )
}
