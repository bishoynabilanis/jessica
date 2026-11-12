import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Gamepad2, Layers, Sparkles, Star, Flame, Trophy } from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { RiddleCard } from '@/components/RiddleModal'
import { BookCard } from '@/components/common/BookCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useUI } from '@/store/useUI'
import { Modal } from '@/components/ui/Modal'
import { giftStickers } from '@/data/kids'
import { levelLabel } from '@/lib/curriculum'
import { useApp, levelInfo } from '@/store/useApp'
import { firstName, pct, todayKey } from '@/lib/utils'
import { tr } from '@/i18n'

export function KidsHome() {
  const navigate = useNavigate()
  const { name, xp, streak, customBooks, quests, dailyLog, kidsGift, claimKidsGift, bookProgress, parentTasks, completeParentTask, settings } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [giftOpen, setGiftOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const setName = useApp((s) => s.setName)
  const [giftId, setGiftId] = useState<string | null>(null)
  const { level, progress } = levelInfo(xp)
  const books = customBooks.filter((b) => b.grade === 4)
  const quest = quests.find((q) => !q.claimed)
  const activeTasks = parentTasks.filter((task) => !task.done).slice(0, 2)
  const todayXp = dailyLog[todayKey()]?.xp || 0
  const goal = Math.max(30, Math.ceil((todayXp + 10) / 10) * 10)
  const goalPercent = pct(todayXp, goal)
  const giftAvailable = kidsGift !== todayKey()
  const gift = giftStickers.find((item) => item.id === giftId)
  const latest = books
    .filter((book) => (bookProgress[book.id]?.lastPage || 0) > 0)
    .sort((a, b) => (bookProgress[b.id]?.updatedAt || 0) - (bookProgress[a.id]?.updatedAt || 0))[0]
  const latestPage = latest ? bookProgress[latest.id]?.lastPage || 1 : 1

  const openGift = () => {
    if (!giftAvailable) return
    const won = claimKidsGift()
    if (!won) return
    setGiftId(won)
    setGiftOpen(true)
  }

  const actions = [
    {
      label: tr('Open my book'),
      hint: tr('Read with Jessica'),
      icon: BookOpen,
      to: '/kids/library',
      bg: 'bg-sky/15 text-sky',
    },
    {
      label: tr('Play and learn'),
      hint: tr('Fun quiz game'),
      icon: Gamepad2,
      to: '/kids/play',
      bg: 'bg-aurora-400/15 text-aurora-600',
    },
    {
      label: tr('My cards'),
      hint: tr('Remember more'),
      icon: Layers,
      to: '/kids/cards',
      bg: 'bg-violet-neon/15 text-violet-neon',
    },
    {
      label: tr('My buddy'),
      hint: tr('Grow together'),
      icon: Sparkles,
      to: '/kids/me',
      bg: 'bg-coral/15 text-coral',
    },
  ]

  return (
    <div className="space-y-4">
      {!name && (
        <Card className="border-2 border-sun/50 bg-gradient-to-r from-sun/20 via-white to-aurora-400/15 p-4">
          <p className="text-sm font-extrabold text-ink-950">👋 {tr('What’s your name?')}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-ink-600">
            {tr('Jessica will call you by your first name.')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value.slice(0, 40))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftName.trim()) setName(draftName.trim())
              }}
              placeholder={tr('Your first name')}
              className="field max-w-xs flex-1 text-sm"
            />
            <Button
              onClick={() => draftName.trim() && setName(draftName.trim())}
              disabled={!draftName.trim()}
            >
              {tr('Save my name')}
            </Button>
          </div>
        </Card>
      )}

      <Card className="relative overflow-hidden rounded-[36px] border-2 border-white bg-gradient-to-b from-sky/35 via-sun/15 to-aurora-400/25 p-0 shadow-[0_20px_60px_-30px_rgba(92,200,255,0.55)]">
        <span className="kids-float pointer-events-none absolute left-5 top-5 text-3xl opacity-90">☁️</span>
        <span className="kids-float kids-float-slow pointer-events-none absolute right-24 top-10 text-2xl opacity-80">☁️</span>
        <span className="pointer-events-none absolute right-6 top-4 h-12 w-12 rounded-full bg-sun shadow-[0_0_40px_rgba(255,209,102,0.8)]" />
        <span className="kids-float pointer-events-none absolute bottom-16 left-8 text-xl opacity-70">⭐</span>
        <span className="kids-float kids-float-slow pointer-events-none absolute bottom-24 right-10 text-xl opacity-70">🎈</span>

        <div className="relative flex flex-col items-center gap-4 p-5 sm:flex-row sm:p-7">
          <div className="min-w-0 flex-1 text-center sm:text-start">
            <span className="chip border-white/70 bg-white/70 text-amber-700 shadow-sm">
              🧸 {levelLabel(4, settings.curriculum)}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-4xl">
              {name ? tr('Hi {name}!', { name: firstName(name) }) : tr('Hi there!')}{' '}
              <span className="block text-transparent [background:linear-gradient(100deg,#0284c7,#08c9b1,#8b5cf6)] [-webkit-background-clip:text] [background-clip:text]">
                {tr('Let’s learn and play')}
              </span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-ink-700 sm:mx-0">
              {tr('I’m Jessica! Let’s read your book, play a quiz and grow your buddy together.')}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                onClick={() => navigate('/kids/library')}
                className="kids-sticker inline-flex items-center gap-2 rounded-2xl bg-sun px-4 py-3 text-sm font-black text-ink-950"
              >
                <BookOpen className="h-5 w-5" /> {tr('Open my book')}
              </button>
              <button
                onClick={() => navigate('/kids/play')}
                className="kids-sticker inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-aurora-600"
              >
                <Gamepad2 className="h-5 w-5" /> {tr('Play')}
              </button>
            </div>

            <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-white/70 bg-white/70 p-2.5 text-start sm:mx-0">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-ink-700">
                <span>⭐ {tr('Today’s goal')}</span>
                <span>
                  {todayXp} / {goal} {tr('stars')}
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sun via-coral to-violet-neon transition-all"
                  style={{ width: `${Math.max(5, goalPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <div className="absolute inset-x-2 bottom-2 h-10 rounded-full bg-aurora-400/30 blur-xl" />
            <div className="kids-bob relative">
              <Mascot xp={xp} size={200} mood="celebrate" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="chip border-coral/30 bg-white text-coral">
          <Flame className="h-3 w-3" /> {tr('{n} day streak', { n: streak })}
        </span>
        <span className="chip border-sun/40 bg-white text-amber-600">
          <Star className="h-3 w-3" /> {xp} {tr('stars')}
        </span>
        <span className="chip border-violet-neon/25 bg-white text-violet-neon">
          <Trophy className="h-3 w-3" /> {tr('Level {n}', { n: level })}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          onClick={openGift}
          disabled={!giftAvailable}
          className={`kids-sticker flex items-center gap-3 rounded-[26px] border-2 border-white p-3.5 text-start ${
            giftAvailable ? 'bg-gradient-to-r from-sun/25 to-coral/15' : 'bg-white/70 opacity-70'
          }`}
        >
          <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl ${giftAvailable ? 'kids-bob' : ''}`}>
            {giftAvailable ? '🎁' : '✅'}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold text-ink-950">
              {giftAvailable ? tr('Open today’s gift') : tr('Come back tomorrow')}
            </span>
            <span className="text-[10px] font-semibold text-ink-600">
              {giftAvailable ? tr('A sticker and 10 stars are waiting') : tr('Your next gift is tomorrow')}
            </span>
          </span>
        </button>

        {latest ? (
          <button
            onClick={() => navigate(`/kids/reader/${latest.id}?page=${latestPage}`)}
            className="kids-sticker flex items-center gap-3 rounded-[26px] border-2 border-white bg-white p-3.5 text-start"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/15 text-2xl">{latest.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold text-ink-950">{tr('Continue reading')}</span>
              <span className="truncate text-[10px] font-semibold text-ink-600">
                {latest.title} · {tr('page {n}', { n: latestPage })}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-sky" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/kids/play')}
            className="kids-sticker flex items-center gap-3 rounded-[26px] border-2 border-white bg-white p-3.5 text-start"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aurora-400/15 text-2xl">⏱️</span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink-950">{tr('3-minute play')}</span>
              <span className="text-[10px] font-semibold text-ink-600">{tr('One quick quiz, lots of stars')}</span>
            </span>
          </button>
        )}
      </div>

      {books[0] && (
        <button
          onClick={() => navigate(`/kids/lesson/${books[0].id}`)}
          className="kids-sticker flex w-full items-center gap-3 rounded-[26px] border-2 border-white bg-gradient-to-r from-violet-neon/15 via-white to-sky/15 p-4 text-start"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-neon/15 text-2xl">⏱️</span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold text-ink-950">{tr('Start a 5-minute lesson')}</span>
            <span className="text-[10px] font-semibold text-ink-600">{tr('One page, a tiny quiz, and stars.')}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-violet-neon" />
        </button>
      )}

      <button
        onClick={() => navigate('/kids/labs')}
        className="kids-sticker flex w-full items-center gap-3 rounded-[26px] border-2 border-white bg-gradient-to-r from-sky/15 via-white to-sun/15 p-4 text-start"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky/15 text-2xl">🧪</span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-ink-950">{tr('Little labs')}</span>
          <span className="text-[10px] font-semibold text-ink-600">{tr('Fractions, matter, water and plants.')}</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-sky" />
      </button>

      <button
        onClick={() => navigate('/kids/map')}
        className="kids-sticker flex w-full items-center gap-3 rounded-[26px] border-2 border-white bg-gradient-to-r from-aurora-400/15 via-white to-sky/15 p-4 text-start"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-aurora-400/15 text-2xl">🗺️</span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-ink-950">{tr('Adventure map')}</span>
          <span className="text-[10px] font-semibold text-ink-600">{tr('Follow the path, stop by stop.')}</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-aurora-600" />
      </button>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.to}
            onClick={() => navigate(action.to)}
            className="kids-sticker relative rounded-[26px] border-2 border-white bg-white p-3.5 text-start"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${action.bg}`}>
              <action.icon className="h-6 w-6" />
            </span>
            <p className="mt-2 font-display text-sm font-extrabold text-ink-950">{action.label}</p>
            <p className="text-[9px] font-semibold text-ink-600">{action.hint}</p>
            <ArrowRight className="absolute end-3 top-4 h-4 w-4 text-ink-400" />
          </button>
        ))}
      </div>

      {activeTasks.length > 0 && (
        <Card className="border-2 border-aurora-400/40 bg-aurora-400/10 p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <Sparkles className="h-4 w-4 text-aurora-600" /> {tr('Tasks from a grown-up')}
          </p>
          <div className="mt-2 space-y-2">
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">
                  <Star className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-ink-950">{task.title}</p>
                  <p className="text-[9px] font-bold text-amber-700">+{task.reward} {tr('stars')}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const reward = completeParentTask(task.id)
                    if (reward) {
                      pushToast({ title: tr('Great job! +{n} stars', { n: reward }), type: 'xp', xp: reward })
                    }
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {tr('Done!')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-2 border-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink-950">📚 {tr('My books')}</h2>
            <button onClick={() => navigate('/kids/library')} className="text-[10px] font-extrabold text-sky hover:underline">
              {tr('All books')}
            </button>
          </div>
          {books.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {books.slice(0, 2).map((book) => (
                <BookCard key={book.id} book={book} compact to={`/kids/reader/${book.id}`} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-sky/30 bg-sky/5 p-4 text-center">
              <p className="text-sm font-extrabold text-ink-950">{tr('No books yet')}</p>
              <p className="mt-1 text-[10px] text-ink-600">{tr('Ask a grown-up to add your school book from the Library.')}</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/kids/library')}>
                {tr('Open my books')}
              </Button>
            </div>
          )}
        </Card>

        <RiddleCard compact />
      </div>

      <Modal open={giftOpen} onClose={() => setGiftOpen(false)} title={tr('A gift for you!')} size="sm">
        <div className="text-center">
          <div className="mx-auto flex justify-center gap-1 text-xl">
            <span className="kids-bob">✨</span>
            <span className="kids-bob">🎉</span>
            <span className="kids-bob">⭐</span>
          </div>
          <p className="mt-2 text-6xl">{gift?.emoji || '🎁'}</p>
          <p className="mt-2 font-display text-lg font-extrabold text-main">{tr(gift?.label || 'New sticker')}</p>
          <p className="mt-1 text-xs font-semibold text-muted">{tr('You earned 10 stars and a new sticker!')}</p>
          <Button className="mt-4 w-full" onClick={() => setGiftOpen(false)}>
            {tr('Yay!')}
          </Button>
        </div>
      </Modal>

      {quest && (
        <Card className="flex flex-wrap items-center gap-3 border-2 border-sun/40 bg-sun/10 p-4">
          <span className="kids-bob grid h-12 w-12 place-items-center rounded-2xl bg-sun/25 text-2xl">🎯</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">{tr('Today’s mission')}</p>
            <p className="truncate text-sm font-extrabold text-ink-950">{tr(quest.title)}</p>
            <p className="text-[10px] text-ink-600">{tr(quest.description)}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/kids/play')}>
            {tr('Start')} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      )}
    </div>
  )
}
