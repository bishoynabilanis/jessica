import { useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Copy, Home, RefreshCw, Swords, Trophy, Zap } from 'lucide-react'
import { decodeBattle, battleShareUrl } from '@/lib/battle'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mascot } from '@/components/Mascot'
import { QuizGame } from '@/components/tools/QuizGame'
import { PageHeader } from '@/components/common/PageHeader'
import { useState } from 'react'
import { tr } from '@/i18n'

export function Battle() {
  const [params] = useSearchParams()
  const payload = useMemo(() => decodeBattle(params.get('d') || ''), [params])
  const { xp, name, addXP } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [score, setScore] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const rewarded = useRef(false)

  if (!payload) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <Card className="p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral/15 text-coral">
            <Swords className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr("This battle link is incomplete")}</h1>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {tr("Ask your classmate to send the full link or scan their QR code again.")}
          </p>
          <Link to="/games">
            <Button className="mt-4">
              <Home className="h-4 w-4" /> {tr("Back to the arcade")}
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const won = score !== null && score >= payload.target

  const handleFinish = (finalScore: number, finalTotal: number) => {
    setScore(finalScore)
    setTotal(finalTotal)
    if (rewarded.current) return
    rewarded.current = true
    const bonus = finalScore >= payload.target ? 45 : 15
    addXP(bonus, true)
    pushToast({
      title: finalScore >= payload.target ? tr('Battle won! ⚔️') : tr('Good fight!'),
      description:
        finalScore >= payload.target
          ? `You beat ${payload.challenger}'s target of ${payload.target}. +${bonus} XP`
          : `Target was ${payload.target}/${payload.questions.length}. Study the misses and demand a rematch.`,
      type: 'xp',
      xp: bonus,
    })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        back
        eyebrow={tr("Peer battle")}
        title={`${payload.challenger} vs ${name || 'you'}`}
        subtitle={tr('{subject} · {n} questions · target {target} correct.', { subject: tr(payload.subject), n: payload.questions.length, target: payload.target })}
        icon={<Swords className="h-5 w-5" />}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(battleShareUrl(payload))
              pushToast({ title: tr("Battle link copied"), type: 'success' })
            }}
          >
            <Copy className="h-3.5 w-3.5" /> {tr("Share")}
          </Button>
        }
      />

      {score === null ? (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="p-4 sm:p-5">
            <QuizGame
              questions={payload.questions}
              subject={payload.subject}
              title={tr("Head-to-head challenge")}
              xpPerCorrect={10}
              onFinish={handleFinish}
            />
          </Card>
          <div className="space-y-3">
            <Card className="p-4 text-center">
              <Mascot xp={xp} size={130} mood="thinking" />
              <p className="mt-2 text-sm font-extrabold text-main">{tr("The target is")} {payload.target}/{payload.questions.length}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {tr("Beat it and you take the win. Every correct answer also earns XP, win or lose.")}
              </p>
            </Card>
            <Card className="p-4">
              <p className="label mb-2">{tr("Battle rules")}</p>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted">
                <li className="flex gap-1.5"><Trophy className="mt-0.5 h-3 w-3 shrink-0 text-sun" /> {tr("Winner gets +45 XP.")}</li>
                <li className="flex gap-1.5"><Zap className="mt-0.5 h-3 w-3 shrink-0 text-aurora-300" /> {tr("+10 XP per correct answer.")}</li>
                <li className="flex gap-1.5"><RefreshCw className="mt-0.5 h-3 w-3 shrink-0 text-violet-glow" /> {tr("Lose? Read the explanations and rematch.")}</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="mx-auto max-w-xl p-6 text-center">
          <Mascot xp={xp} size={150} mood={won ? 'celebrate' : 'thinking'} />
          <p className="mt-2 font-display text-2xl font-extrabold text-main">{won ? tr('Victory is yours!') : tr('So close!')}</p>
          <p className="mt-1 text-sm font-semibold text-aurora-300">
            {score}/{total} {tr("correct · target")} {payload.target}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-muted">
            {won
              ? `${payload.challenger} set the bar at ${payload.target}. You cleared it. Send the screenshot and claim your bragging rights.`
              : `${payload.challenger} set the bar at ${payload.target}. Revise the explanations, then challenge them to a rematch.`}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(battleShareUrl(payload))
                pushToast({ title: tr("Link copied — send your rematch demand"), type: 'success' })
              }}
            >
              <Copy className="h-4 w-4" /> {tr("Share result link")}
            </Button>
            <Link to="/games">
              <Button>
                <RefreshCw className="h-4 w-4" /> {tr("Make my own battle")}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" /> {tr("Home")}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
