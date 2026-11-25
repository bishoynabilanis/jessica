import { useEffect, useMemo, useState } from 'react'
import { onCelebrate } from '@/lib/celebrate'
import { useApp } from '@/store/useApp'
import { playFinish } from '@/lib/sound'

const COLORS = ['#21e6c9', '#6b8cff', '#fbbf24', '#fb7185', '#a78bfa', '#34d399']

interface Burst {
  id: number
  pieces: Array<{ left: number; delay: number; color: string; rotate: number; size: number }>
}

function makePieces() {
  return Array.from({ length: 36 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }))
}

/**
 * Full-screen confetti, mounted once per app shell. It fires when any screen
 * calls celebrate() and disappears on its own; reduced-motion users skip it.
 */
export function CelebrationLayer() {
  const reduceMotion = useApp((s) => s.settings.reduceMotion)
  const sound = useApp((s) => s.settings.sound !== false)
  const [bursts, setBursts] = useState<Burst[]>([])

  useEffect(() => {
    if (reduceMotion || useApp.getState().settings.weakPhone) return
    return onCelebrate(() => {
      const id = Date.now() + Math.random()
      setBursts((prev) => [...prev, { id, pieces: makePieces() }])
      if (sound) playFinish()
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id))
      }, 2600)
    })
  }, [reduceMotion, sound])

  const show = useMemo(() => bursts.length > 0, [bursts])

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden data-testid="confetti">
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute inset-0">
          {burst.pieces.map((piece, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={{
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * 1.6,
                background: piece.color,
                animationDelay: `${piece.delay}s`,
                transform: `rotate(${piece.rotate}deg)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
