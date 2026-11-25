import { useEffect, useState } from 'react'
import { Check, Flame, HelpCircle, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { getQuizzes } from '@/lib/db'
import { chooseDaily, dailyStreak, loadDaily, saveDaily, type DailyState } from '@/lib/dailyQuestion'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, todayKey } from '@/lib/utils'
import { num, tr } from '@/i18n'

/** One question a day from the student's own curriculum. Stays on this device. */
export function DailyQuestionCard() {
  const books = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)
  const [state, setState] = useState<DailyState | null>(null)
  const today = todayKey()

  useEffect(() => {
    let alive = true
    const saved = loadDaily()
    const keep = saved.today?.date === today
    const upgradable = keep && saved.today?.source.kind === 'bank' && saved.today.picked === undefined
    if (keep) setState(saved)
    if (keep && !upgradable) return
    getQuizzes()
      .catch(() => [])
      .then((quizzes) => {
        if (!alive) return
        const chosen = chooseDaily(today, quizzes, books, grade)
        // An unanswered practice question is swapped for a book question once the book has one.
        if (upgradable && chosen?.source.kind !== 'book') return
        const next: DailyState = { history: saved.history, today: chosen || undefined }
        saveDaily(next)
        setState(next)
      })
    return () => {
      alive = false
    }
    // The question is fixed for the day once chosen, so only the date and grade matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, grade])

  const daily = state?.today
  if (!state || !daily) return null
  const answered = daily.picked !== undefined
  const streak = dailyStreak(state.history, today)

  const pick = (index: number) => {
    if (answered) return
    const correct = index === daily.question.answer
    const next: DailyState = {
      history: { ...state.history, [today]: correct },
      today: { ...daily, picked: index },
    }
    saveDaily(next)
    setState(next)
    const xp = correct ? 10 : 3
    addXP(xp, true)
    pushToast({ title: correct ? tr('Right! Daily question done') : tr('Daily question done'), description: `+${num(xp)} XP`, type: 'xp', xp })
  }

  const source =
    daily.source.kind === 'book'
      ? tr('From your book: {title}', { title: daily.source.bookTitle || tr(daily.source.subject) })
      : tr('Grade skills practice: {subject}. Not from a book page.', { subject: tr(daily.source.subject) })

  return (
    <Card className="p-4 sm:p-5" data-testid="daily-question">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-main">
          <HelpCircle className="h-4 w-4 text-aurora-300" /> {tr('Daily question')}
        </p>
        {streak > 0 && (
          <span data-testid="daily-streak" className="chip border-sun/30 bg-sun/10 text-sun">
            <Flame className="h-3 w-3" /> {num(streak)}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-muted" data-testid="daily-source">{source}</p>
      <p className="mt-3 text-sm font-bold leading-relaxed text-main">{daily.question.question}</p>
      <div className="mt-3 space-y-2">
        {daily.question.options.map((option, index) => {
          const isRight = index === daily.question.answer
          const isPicked = daily.picked === index
          return (
            <button
              key={index}
              type="button"
              data-testid="daily-option"
              disabled={answered}
              onClick={() => pick(index)}
              className={cn(
                'flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-start text-[12px] font-medium transition',
                !answered && 'border-line bg-card-2 text-main hover:border-aurora-400/40',
                answered && isRight && 'border-aurora-400/60 bg-aurora-400/15 text-main',
                answered && isPicked && !isRight && 'border-coral/50 bg-coral/10 text-main',
                answered && !isRight && !isPicked && 'border-line bg-card-2 opacity-50',
              )}
            >
              {answered && isRight ? <Check className="h-3.5 w-3.5 shrink-0 text-aurora-300" /> : answered && isPicked ? <X className="h-3.5 w-3.5 shrink-0 text-coral" /> : null}
              <span className="min-w-0">{option}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-3 rounded-2xl border border-line bg-card-2 p-3" data-testid="daily-result">
          {daily.question.explanation && <p className="text-[11px] leading-relaxed text-muted">{daily.question.explanation}</p>}
          <p className="mt-1.5 text-[10px] font-bold text-aurora-300">{tr('Come back tomorrow for the next one.')}</p>
        </div>
      )}
      <p className="mt-2 text-[9px] text-muted-2">{tr('Picked and kept on this device only. Nothing is sent anywhere.')}</p>
    </Card>
  )
}
