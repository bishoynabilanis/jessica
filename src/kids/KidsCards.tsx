import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Sparkles } from 'lucide-react'
import { allCards, dueCards } from '@/lib/db'
import { SrsReview } from '@/components/study/SrsReview'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { tr } from '@/i18n'

export function KidsCards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState(0)
  const [due, setDue] = useState(0)
  const [session, setSession] = useState(0)

  const load = async () => {
    const [all, dueNow] = await Promise.all([allCards(), dueCards()])
    setCards(all.length)
    setDue(dueNow.length)
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [session])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-main sm:text-3xl">🧠 {tr('My cards')}</h1>
        <p className="mt-1 text-xs text-muted">
          {tr('{n} cards ready · {m} to review now', { n: cards, m: due })}
        </p>
      </div>

      {cards === 0 ? (
        <Card className="p-5 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet-neon/10 text-3xl">🃏</span>
          <p className="mt-3 font-display text-lg font-extrabold text-main">{tr('No cards yet')}</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
            {tr('Play a quiz first, then Jessica turns your mistakes into memory cards.')}
          </p>
          <Button className="mt-4" onClick={() => navigate('/kids/play')}>
            <Sparkles className="h-4 w-4" /> {tr('Play now')}
          </Button>
        </Card>
      ) : (
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-neon/15 text-violet-glow">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr('Flip and remember')}</p>
              <p className="text-[10px] text-muted">{tr('Tap the card to see the answer.')}</p>
            </div>
          </div>
          <SrsReview key={`kids-${session}`} onDone={() => setSession((s) => s + 1)} />
        </Card>
      )}
    </div>
  )
}
