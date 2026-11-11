import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Crown,
  Gem,
  Lock,
  Pencil,
  Sparkles,
  Star,
  Trophy,
  Wand2,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar, SectionTitle } from '@/components/ui/Card'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import {
  cosmeticUnlocks,
  mascotForXp,
  mascotLooks,
  mascotStages,
} from '@/data/mascots'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

export function MascotPage() {
  const {
    xp,
    coins,
    streak,
    mascotName,
    mascotLook,
    setMascot,
    completedTopics,
    exams,
  } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { level, into, needed, progress } = levelInfo(xp)
  const { current, next, index } = mascotForXp(xp)
  const [name, setName] = useState(mascotName)
  const [editing, setEditing] = useState(false)

  const nextThreshold = next?.threshold ?? current.threshold
  const toNext = Math.max(0, nextThreshold - xp)
  const stageProgress = next
    ? pct(xp - current.threshold, next.threshold - current.threshold)
    : 100

  const unlockedLooks = useMemo(
    () => new Set(mascotLooks.filter((l) => xp >= l.unlockXp).map((l) => l.id)),
    [xp],
  )

  const saveName = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setMascot({ name: trimmed })
    setEditing(false)
    pushToast({ title: tr("Companion renamed"), description: tr('{name} is ready to learn with you.', { name: trimmed }), type: 'success' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Your companion")}
        title={tr("Meet the creature that grows with you")}
        subtitle={tr("Every page, quiz and flashcard feeds your companion. Evolve through six stages, unlock looks and make it truly yours.")}
        icon={<Sparkles className="h-5 w-5" />}
        actions={
          <Link to="/library">
            <Button>
              {tr("Earn XP now")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="relative overflow-hidden p-0">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(520px 320px at 50% 20%, ${current.aura}33, transparent 65%), radial-gradient(420px 300px at 80% 90%, rgba(139,92,246,.2), transparent 60%)`,
            }}
          />
          <div className="relative flex flex-col items-center px-5 py-7 text-center sm:py-9">
            <span className="chip" style={{ borderColor: `${current.aura}55`, color: current.aura }}>
              <Star className="h-3 w-3" /> {tr("Stage")} {index + 1} {tr("of")} {mascotStages.length}
            </span>

            <div className="relative mt-3">
              <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: `${current.aura}22` }} />
              <Mascot xp={xp} size={240} look={mascotLook} mood="proud" />
            </div>

            <div className="mt-1 flex items-center justify-center gap-2">
              {editing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    maxLength={24}
                    autoFocus
                    className="field h-9 w-44 text-center text-sm font-bold"
                    aria-label={tr("Companion name")}
                  />
                  <Button size="sm" onClick={saveName}>
                    <Check className="h-3.5 w-3.5" /> {tr("Save")}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-extrabold text-main">{tr(mascotName)}</h2>
                  <button
                    onClick={() => {
                      setName(mascotName)
                      setEditing(true)
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-main"
                    aria-label={tr("Rename companion")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-sm font-bold" style={{ color: current.aura }}>
              {tr(current.name)} — {tr(current.title)}
            </p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">{tr(current.blurb)}</p>

            <div className="mt-5 w-full max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-muted">
                <span>{tr("Level")} {level}</span>
                <span>{into} / {needed} {tr("XP")}</span>
              </div>
              <ProgressBar value={progress} height="h-2.5" />
              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted">
                <span>{xp.toLocaleString()} {tr("total XP")}</span>
                <span>
                  {next ? `${toNext} ${tr('XP to')} ${tr(next.name)}` : tr('Final evolution reached')}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <p className="label mb-2">{tr("Companion stats")}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: tr("Total XP"), value: xp.toLocaleString(), icon: Zap, color: 'text-sun' },
                { label: tr("Day streak"), value: `${streak}`, icon: Sparkles, color: 'text-coral' },
                { label: tr("Chapters"), value: `${completedTopics.length}`, icon: Trophy, color: 'text-aurora-300' },
                { label: tr("Exams"), value: `${exams.length}`, icon: Crown, color: 'text-violet-glow' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-line bg-card-2 p-3">
                  <s.icon className={cn('mb-1.5 h-4 w-4', s.color)} />
                  <p className="font-display text-lg font-extrabold text-main">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-2">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-sun/20 bg-sun/10 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-sun">
                <Gem className="h-3.5 w-3.5" /> {coins} {tr("Jessica coins")}
              </span>
              <span className="text-[9px] text-sun/80">{tr("Earned with every XP gain")}</span>
            </div>
          </Card>

          <Card className="p-4">
            <p className="label mb-2">{tr("Stage progress")}</p>
            <div className="space-y-2">
              {mascotStages.map((stage, i) => {
                const unlocked = xp >= stage.threshold
                const active = stage.name === current.name
                return (
                  <div
                    key={stage.name}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-2.5 py-2',
                      active
                        ? 'border-aurora-400/35 bg-aurora-400/10'
                        : unlocked
                          ? 'border-line bg-card-2'
                          : 'border-line bg-card-2 opacity-60',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 text-base">
                      {stage.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-extrabold text-main">
                        {tr(stage.name)} {active && <span className="text-aurora-300">{tr("· now")}</span>}
                      </p>
                      <p className="truncate text-[9px] text-muted">{tr(stage.title)}</p>
                    </div>
                    <span className="shrink-0 text-[9px] font-bold text-muted-2">
                      {unlocked ? tr('Unlocked') : `${stage.threshold} XP`}
                    </span>
                    {unlocked ? <Check className="h-3.5 w-3.5 shrink-0 text-aurora-300" /> : <Lock className="h-3 w-3 shrink-0 text-muted-2" />}
                  </div>
                )
              })}
            </div>
            {next && (
              <div className="mt-3">
                <ProgressBar value={stageProgress} height="h-1.5" />
                <p className="mt-1 text-center text-[9px] font-semibold text-muted">
                  {stageProgress}{tr("% of the way to")} {tr(next.name)}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <SectionTitle
        eyebrow={tr("Wardrobe")}
        title={tr("Looks & accessories")}
        subtitle={tr("Unlocked automatically as your XP grows. Pick the one that matches today’s mood.")}
      />

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {mascotLooks.map((look) => {
          const unlocked = unlockedLooks.has(look.id)
          const active = mascotLook === look.id
          return (
            <button
              key={look.id}
              disabled={!unlocked}
              onClick={() => {
                setMascot({ look: look.id })
                pushToast({ title: tr('{name} equipped', { name: tr(look.label) }), type: 'success' })
              }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-3 text-center transition',
                active
                  ? 'border-aurora-400/50 bg-aurora-400/10 shadow-glow'
                  : unlocked
                    ? 'border-line bg-card-2 hover:border-line-strong'
                    : 'cursor-not-allowed border-line bg-card-2 opacity-60',
              )}
            >
              <div className="mx-auto w-fit">
                <Mascot xp={xp} size={78} look={look.id} animate={false} showAura={false} />
              </div>
              <p className="mt-1 text-[11px] font-extrabold text-main">{tr(look.label)}</p>
              <p className="text-[9px] text-muted">
                {unlocked ? (active ? tr('Equipped') : tr('Tap to wear')) : tr('Unlocks at {n} XP', { n: look.unlockXp })}
              </p>
              {!unlocked && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink-950/70 text-muted">
                  <Lock className="h-3 w-3" />
                </span>
              )}
              {active && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-aurora-400 text-ink-950">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-neon/15 text-violet-glow">
              <Wand2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr("Collectible cosmetics")}</p>
              <p className="text-[10px] text-muted">{tr("Little rewards for consistency.")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cosmeticUnlocks.map((item) => {
              const unlocked = xp >= item.xp
              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-2xl border p-3 text-center',
                    unlocked ? 'border-aurora-400/25 bg-aurora-400/5' : 'border-line bg-card-2 opacity-60',
                  )}
                >
                  <p className="text-2xl">{item.emoji}</p>
                  <p className="mt-1 text-[10px] font-bold text-main">{tr(item.label)}</p>
                  <p className="text-[9px] text-muted">{unlocked ? tr('Collected') : `${item.xp} XP`}</p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <p className="label mb-2">{tr("How to evolve faster")}</p>
          <div className="space-y-2">
            {[
              { title: tr("Master a chapter"), detail: tr("Finish a chapter in the reader and earn +50 XP."), xp: 50 },
              { title: tr("Keep the streak"), detail: tr("Open Jessica every day for a login bonus."), xp: 15 },
              { title: tr("Review flashcards"), detail: tr("Spaced repetition turns minutes into memory."), xp: 5 },
              { title: tr("Win a peer battle"), detail: tr("Beat a classmate’s target score for bonus XP."), xp: 45 },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5 rounded-xl border border-line bg-card-2 p-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sun/15 text-sun">
                  <Star className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-main">{item.title}</p>
                  <p className="text-[9px] leading-relaxed text-muted">{item.detail}</p>
                </div>
                <span className="text-[10px] font-extrabold text-sun">+{item.xp}</span>
              </div>
            ))}
          </div>
          <Link to="/study?tab=review">
            <Button variant="secondary" className="mt-3 w-full">
              <Sparkles className="h-4 w-4" /> {tr("Start a quick review")}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
