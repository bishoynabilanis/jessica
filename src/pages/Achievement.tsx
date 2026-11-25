import { useEffect, useMemo, useState } from 'react'
import { Award, Download, MessageCircle, Share2, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp, weekLog } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { levelLabel } from '@/lib/curriculum'
import { buildWhatsAppUrl } from '@/lib/battle'
import { canvasToFile, saveSheetFile, shareSheetFile } from '@/lib/studySheet'
import { drawAchievementCard, earnedAchievements, type Achievement } from '@/lib/achievementCard'
import { num, tr } from '@/i18n'

const APP_URL = 'https://bishoynabilanis.github.io/jessica/'

function describe(a: Achievement) {
  switch (a.kind) {
    case 'streak':
      return { big: num(a.value), caption: tr('days of studying in a row'), pick: tr('{n} days in a row', { n: num(a.value) }) }
    case 'topics':
      return { big: num(a.value), caption: tr('topics finished'), pick: tr('{n} topics finished', { n: num(a.value) }) }
    case 'level':
      return { big: num(a.value), caption: tr('my level in Jessica'), pick: tr('Level {n}', { n: num(a.value) }) }
    default:
      return { big: num(a.value), caption: tr('minutes studied this week'), pick: tr('{n} minutes this week', { n: num(a.value) }) }
  }
}

export function Achievement() {
  const state = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [showName, setShowName] = useState(false)
  const [index, setIndex] = useState(0)
  const [url, setUrl] = useState('')
  const rtl = document.documentElement.dir === 'rtl'

  const list = useMemo(
    () =>
      earnedAchievements({
        streak: state.streak,
        completedTopics: state.completedTopics.length,
        xp: state.xp,
        weekSeconds: weekLog(state).reduce((sum, d) => sum + d.seconds, 0),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.streak, state.completedTopics, state.xp, state.dailyLog],
  )
  const chosen = list[Math.min(index, Math.max(0, list.length - 1))]

  const labels = useMemo(() => {
    if (!chosen) return null
    const d = describe(chosen)
    return {
      headline: tr('I did it in Jessica!'),
      big: d.big,
      caption: d.caption,
      name: showName ? state.name || undefined : undefined,
      grade: levelLabel(state.settings.gradeLevel, state.settings.curriculum),
      privacy: tr('Made on this device. Nothing was uploaded.'),
      rtl,
    }
  }, [chosen, showName, state.name, state.settings.gradeLevel, state.settings.curriculum, rtl])

  useEffect(() => {
    if (!labels) return
    let alive = true
    const timer = window.setTimeout(() => {
      if (alive) setUrl(drawAchievementCard(labels).toDataURL('image/png'))
    }, 50)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [labels])

  const make = async () => (labels ? canvasToFile(drawAchievementCard(labels), 'jessica-achievement.png') : null)

  const share = async () => {
    const file = await make()
    if (!file) return
    const outcome = await shareSheetFile(file, tr('I did it in Jessica!'))
    if (outcome === 'downloaded') pushToast({ title: tr('Card saved as an image'), type: 'success' })
  }
  const save = async () => {
    const file = await make()
    if (!file) return
    saveSheetFile(file)
    pushToast({ title: tr('Card saved as an image'), type: 'success' })
  }
  const whatsapp = () => {
    if (!chosen) return
    const text = tr('Look what I did in Jessica: {what}!', { what: describe(chosen).pick }) + `\n${APP_URL}`
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back
        eyebrow={tr('Parent report')}
        title={tr('Share a win with your parents')}
        subtitle={tr('A small card with something you really did. Pick one and send it.')}
        icon={<Award className="h-5 w-5" />}
      />

      <Card className="flex items-start gap-3 border-aurora-400/25 bg-aurora-400/5 p-4" data-testid="achievement-privacy">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-aurora-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-main" dir="auto">
          {tr('Nothing is saved or sent by Jessica. The card is drawn on this device and leaves only if you press Share or WhatsApp, and then you choose who gets it.')}
        </p>
      </Card>

      {!chosen || !labels ? (
        <Card className="p-6 text-center" data-testid="achievement-empty">
          <p className="text-sm font-bold text-main">{tr('No win to share yet.')}</p>
          <p className="mt-1 text-[12px] text-muted">
            {tr('Study 3 days in a row, finish a topic, reach level 2 or study 30 minutes in a week, and your card shows up here.')}
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={tr('Pick a win')}>
            {list.map((a, i) => (
              <button
                key={a.kind}
                role="radio"
                aria-checked={i === index}
                data-testid={`achievement-pick-${a.kind}`}
                onClick={() => setIndex(i)}
                className={
                  i === index
                    ? 'rounded-xl border border-aurora-400/60 bg-aurora-400/15 px-3 py-1.5 text-xs font-extrabold text-main'
                    : 'rounded-xl border border-line bg-card-2 px-3 py-1.5 text-xs font-bold text-muted'
                }
              >
                {describe(a).pick}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] font-bold text-main">
              <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} data-testid="achievement-name" className="h-4 w-4" />
              {tr('Put the child’s name on the card')}
            </label>
            <div className="ms-auto flex flex-wrap gap-2">
              <Button size="sm" onClick={whatsapp} data-testid="achievement-whatsapp">
                <MessageCircle className="h-3.5 w-3.5" /> {tr('Send on WhatsApp')}
              </Button>
              <Button size="sm" variant="secondary" onClick={share} data-testid="achievement-share">
                <Share2 className="h-3.5 w-3.5" /> {tr('Share the card')}
              </Button>
              <Button size="sm" variant="secondary" onClick={save} data-testid="achievement-save">
                <Download className="h-3.5 w-3.5" /> {tr('Save image')}
              </Button>
            </div>
          </div>
          <Card className="mx-auto max-w-sm overflow-hidden p-2">
            {url && <img src={url} alt={tr('Achievement card')} className="w-full rounded-xl" data-testid="achievement-image" />}
          </Card>
        </>
      )}
    </div>
  )
}
