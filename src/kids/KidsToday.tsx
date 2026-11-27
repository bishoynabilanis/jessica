import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/store/useApp'
import { summarizeDay } from '@/lib/kidsDay'
import { todayKey } from '@/lib/utils'
import { num, tr } from '@/i18n'
import { ParentNoteCard } from '@/kids/ParentNoteCard'

/** A calm end-of-day screen for children: time today, what was learned, what comes next, one star. */
export function KidsToday() {
  const navigate = useNavigate()
  const kidsUsage = useApp((s) => s.kidsUsage)
  const lessonProgress = useApp((s) => s.lessonProgress)
  const topicLog = useApp((s) => s.topicLog)
  const customBooks = useApp((s) => s.customBooks)
  const dailyLog = useApp((s) => s.dailyLog)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const today = todayKey()

  const day = useMemo(
    () =>
      summarizeDay({
        today,
        kidsUsage,
        lessonProgress,
        topicLog,
        books: customBooks,
        gradeLevel,
        starsToday: dailyLog[today]?.xp || 0,
      }),
    [today, kidsUsage, lessonProgress, topicLog, customBooks, gradeLevel, dailyLog],
  )
  const { next } = day

  return (
    <div className="space-y-4" data-testid="kids-today">
      <div className="rounded-[32px] border-2 border-white bg-white/85 p-5 text-center shadow-[0_18px_40px_-24px_rgba(15,23,42,.4)]">
        <p className="text-3xl">🌙</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-950">{tr('My day')}</h1>
        <p className="mt-1 text-xs font-semibold text-ink-600">{tr('A quick look at today. Nothing leaves this phone.')}</p>
      </div>

      <ParentNoteCard />

      <div className="rounded-3xl border-2 border-white bg-white/85 p-4" data-testid="kids-today-minutes">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-600">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-ink-950">
              {day.minutes > 0 ? tr('{n} minutes with Jessica today', { n: num(day.minutes) }) : tr('Just getting started today')}
            </p>
            <p className="text-[10px] font-semibold text-ink-500">{tr('Counts the time the app is open on this screen.')}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-white bg-white/85 p-4" data-testid="kids-today-learned">
        <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-950">
          <Sparkles className="h-4 w-4 text-violet-500" /> {tr('New things I finished today')}
        </p>
        {day.learned.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {day.learned.map((title) => (
              <li key={title} className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-ink-800">
                ✅ {title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs font-semibold text-ink-600">{tr('Nothing finished yet today. One small lesson is enough.')}</p>
        )}
      </div>

      <div className="rounded-3xl border-2 border-white bg-white/85 p-4" data-testid="kids-today-next">
        <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-950">
          <ArrowRight className="h-4 w-4 text-teal-500" /> {tr('Tomorrow')}
        </p>
        {next.kind === 'lesson' && (
          <>
            <p className="mt-2 text-xs font-bold text-ink-800">
              {next.started ? tr('We continue from: {title}', { title: next.title }) : tr('Next lesson: {title}', { title: next.title })}
            </p>
            <Button size="sm" className="mt-3" onClick={() => navigate(`/kids/lesson/${next.bookId}?unit=${encodeURIComponent(next.unitId)}`)}>
              {tr('Start it now')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {next.kind === 'finished' && (
          <p className="mt-2 text-xs font-bold text-ink-800">{tr('You finished every lesson in {book}. Pick another book tomorrow.', { book: next.bookTitle })}</p>
        )}
        {next.kind === 'none' && <p className="mt-2 text-xs font-semibold text-ink-600">{tr('Pick a book tomorrow and start your first lesson.')}</p>}
      </div>

      <div
        className={'rounded-[28px] border-2 p-5 text-center ' + (day.active ? 'border-amber-200 bg-amber-50/80' : 'border-white bg-white/60')}
        data-testid="kids-today-star"
      >
        <Star className={'mx-auto h-14 w-14 ' + (day.active ? 'kids-bob fill-amber-300 text-amber-400' : 'text-ink-300')} />
        <p className="mt-2 text-sm font-extrabold text-ink-950">
          {day.active ? tr('Here is your star for today!') : tr('Do one small lesson and a star is waiting for you.')}
        </p>
        {day.starsToday > 0 && <p className="mt-1 text-[11px] font-bold text-ink-600">{tr('You collected {n} stars today.', { n: num(day.starsToday) })}</p>}
      </div>

      <button onClick={() => navigate('/kids')} className="mx-auto block text-xs font-extrabold text-ink-600 underline">
        {tr('Back home')}
      </button>
    </div>
  )
}
