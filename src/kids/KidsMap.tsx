import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Gamepad2, Sparkles, Star } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

export function KidsMap() {
  const navigate = useNavigate()
  const { bookId: routeBook } = useParams()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const lessonProgress = useApp((s) => s.lessonProgress)
  const unitMastery = useApp((s) => s.unitMastery)
  const completedTopics = useApp((s) => s.completedTopics)
  const books = useMemo(() => customBooks.filter((b) => b.grade === grade), [customBooks, grade])
  const [bookId, setBookId] = useState(routeBook || books[0]?.id || '')
  const book = books.find((item) => item.id === bookId) || books[0]
  const units = book?.units || []

  const done = book ? units.filter((unit) => lessonProgress[`${book.id}:${unit.id}`]?.done).length : 0

  if (!books.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-extrabold text-ink-950">🗺️ {tr('No map yet')}</p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] text-ink-600">
          {tr('Ask a grown-up to add your school book, then your adventure map appears here.')}
        </p>
        <Button className="mt-4" onClick={() => navigate('/kids/library')}>
          {tr('Open my books')}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">🗺️ {tr('Adventure map')}</h1>
          <p className="mt-1 text-xs font-semibold text-ink-600">
            {tr('{n} of {total} lessons finished', { n: done, total: units.length })}
          </p>
        </div>
        {books.length > 1 && (
          <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="field max-w-xs text-xs">
            {books.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <Card className="relative overflow-hidden border-2 border-white p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_200px_at_10%_0%,rgba(255,209,102,.25),transparent_60%),radial-gradient(400px_220px_at_90%_100%,rgba(33,230,201,.18),transparent_60%)]" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2 rounded-3xl border-2 border-sun/40 bg-white/80 p-3">
            <Mascot xp={0} size={58} mood="proud" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink-950">{tr('You are here!')}</p>
              <p className="text-[10px] font-semibold text-ink-600">{tr('Finish a stop to light it up.')}</p>
            </div>
            <Sparkles className="h-5 w-5 text-sun" />
          </div>

          {units.map((unit, index) => {
            const key = `${book!.id}:${unit.id}`
            const lessonDone = !!lessonProgress[key]?.done
            const stat = unitMastery[key]
            const best = stat ? pct(stat.best, stat.total) : 0
            const mastered = completedTopics.includes(key) || best >= 80
            const status = mastered ? 'mastered' : lessonDone ? 'read' : 'new'
            return (
              <div key={unit.id} className={cn('flex items-stretch gap-2', index % 2 === 0 ? 'sm:pe-16' : 'sm:ps-16')}>
                <div className="flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black',
                      status === 'mastered'
                        ? 'border-aurora-400 bg-aurora-400 text-ink-950'
                        : status === 'read'
                          ? 'border-violet-neon bg-violet-neon/20 text-violet-neon'
                          : 'border-white bg-white text-ink-500',
                    )}
                  >
                    {status === 'mastered' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="my-1 h-4 w-0.5 rounded-full bg-black/10" />
                </div>

                <div className="kids-sticker flex-1 rounded-3xl border-2 border-white bg-white p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-ink-950">{unit.title}</p>
                      <p className="text-[9px] font-semibold text-ink-500">
                        {tr('Pages {from}–{to}', { from: unit.startPage, to: unit.endPage })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold',
                        status === 'mastered'
                          ? 'bg-aurora-400/15 text-aurora-600'
                          : status === 'read'
                            ? 'bg-violet-neon/10 text-violet-neon'
                            : 'bg-black/5 text-ink-500',
                      )}
                    >
                      {status === 'mastered' ? tr('Mastered') : status === 'read' ? tr('Lesson done') : tr('New')}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button size="sm" onClick={() => navigate(`/kids/lesson/${book!.id}?unit=${unit.id}`)}>
                      <BookOpen className="h-3.5 w-3.5" /> {tr('Lesson')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/kids/play?book=${book!.id}&unit=${unit.id}`)}
                    >
                      <Gamepad2 className="h-3.5 w-3.5" /> {tr('Quiz')}
                    </Button>
                    {stat && (
                      <span className="chip border-sun/30 bg-sun/10 text-[8px] text-amber-700">
                        <Star className="h-2.5 w-2.5" /> {best}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-aurora-400/40 bg-aurora-400/10 p-3 text-center">
            <ArrowRight className="h-4 w-4 text-aurora-600" />
            <p className="text-[10px] font-bold text-ink-700">{tr('Finish all stops to complete the map!')}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
