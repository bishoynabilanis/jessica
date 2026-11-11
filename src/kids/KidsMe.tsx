import { useNavigate } from 'react-router-dom'
import { BookOpen, Flame, Lock, Sparkles, Star, Trophy } from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { mascotForXp } from '@/data/mascots'
import { useApp, levelInfo } from '@/store/useApp'
import { giftStickers } from '@/data/kids'
import { tr } from '@/i18n'

export function KidsMe() {
  const navigate = useNavigate()
  const { name, xp, streak, customBooks, completedTopics, mascotName, mascotLook, bookProgress, kidsStickers } = useApp()
  const { level, progress } = levelInfo(xp)
  const { current } = mascotForXp(xp)
  const books = customBooks.filter((b) => b.grade === 4)
  const booksStarted = books.filter((b) => (bookProgress[b.id]?.lastPage || 0) > 0).length

  const badges = [
    { id: 'streak', emoji: '🔥', label: tr('On a streak'), unlocked: streak >= 1 },
    { id: 'reader', emoji: '📖', label: tr('Little reader'), unlocked: booksStarted >= 1 },
    { id: 'unit', emoji: '⭐', label: tr('First unit'), unlocked: completedTopics.length >= 1 },
    { id: 'star', emoji: '🌟', label: tr('Star collector'), unlocked: xp >= 300 },
  ]

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden rounded-[32px] border-sun/30 bg-gradient-to-br from-sun/15 via-white to-aurora-400/10 p-5 text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sun/20 blur-3xl" />
        <div className="relative">
          <div className="mx-auto w-fit">
            <Mascot xp={xp} size={180} look={mascotLook} mood="celebrate" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-main">{tr(mascotName)}</h1>
          <p className="text-[11px] font-semibold text-sun">
            {tr(current.name)} · {tr('Level {n}', { n: level })}
          </p>
          <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-gradient-to-r from-sun to-coral" style={{ width: `${Math.max(4, progress)}%` }} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: tr('Stars'), value: xp, icon: Star, color: 'text-sun' },
          { label: tr('Streak'), value: streak, icon: Flame, color: 'text-coral' },
          { label: tr('My books'), value: books.length, icon: BookOpen, color: 'text-sky' },
          { label: tr('Units mastered'), value: completedTopics.length, icon: Trophy, color: 'text-aurora-300' },
        ].map((item) => (
          <Card key={item.label} className="p-3 text-center">
            <item.icon className={`mx-auto h-5 w-5 ${item.color}`} />
            <p className="mt-1 font-display text-xl font-extrabold text-main">{item.value}</p>
            <p className="text-[9px] font-bold text-muted">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-main">
          <Sparkles className="h-4 w-4 text-sun" /> {tr('My stickers')}
          <span className="ms-auto text-[10px] font-bold text-muted">{kidsStickers.length} / {giftStickers.length}</span>
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {giftStickers.map((sticker) => {
            const owned = kidsStickers.includes(sticker.id)
            return (
              <div
                key={sticker.id}
                className={`rounded-2xl border p-2 text-center ${
                  owned ? 'border-sun/40 bg-sun/10' : 'border-line bg-white/50 opacity-40 grayscale'
                }`}
                title={owned ? tr(sticker.label) : tr('Locked')}
              >
                <p className="text-2xl">{sticker.emoji}</p>
                <p className="mt-0.5 truncate text-[8px] font-bold text-main">{tr(sticker.label)}</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-main">
          <Sparkles className="h-4 w-4 text-sun" /> {tr('My badges')}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-3 text-center ${
                badge.unlocked ? 'border-sun/40 bg-sun/10' : 'border-line bg-white/50 opacity-50'
              }`}
            >
              <p className="text-2xl">{badge.emoji}</p>
              <p className="mt-1 text-[9px] font-bold text-main">{badge.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-main">{name ? tr('Hi {name}!', { name: name.split(' ')[0] }) : tr('Hi there!')}</p>
          <p className="text-[10px] text-muted">{tr('A grown-up can change settings and books.')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/kids/settings')}>
          <Lock className="h-4 w-4" /> {tr('Parent settings')}
        </Button>
      </Card>
    </div>
  )
}
