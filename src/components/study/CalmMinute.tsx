import { useEffect, useState } from 'react'
import { Wind } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { num, tr } from '@/i18n'

const TOTAL_SECONDS = 60
const PHASE_SECONDS = 4

function reducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * One quiet minute of paced breathing (4s in, 4s out). No sound, no storage,
 * no network. General calm tips only, not treatment.
 */
export function CalmMinute({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const still = reducedMotion()

  useEffect(() => {
    if (!open) {
      setRunning(false)
      setElapsed(0)
      setFinished(false)
    }
  }, [open])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= TOTAL_SECONDS) {
          setRunning(false)
          setFinished(true)
          return TOTAL_SECONDS
        }
        return value + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const breatheIn = Math.floor(elapsed / PHASE_SECONDS) % 2 === 0
  const expanded = running && breatheIn
  const label = !running ? tr('Ready') : breatheIn ? tr('Breathe in') : tr('Breathe out')

  const start = () => {
    setElapsed(0)
    setFinished(false)
    setRunning(true)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr('A calm minute before the exam')}
      subtitle={tr('One minute of slow breathing. Nothing is saved and no sound plays.')}
      icon={<Wind className="h-4 w-4" />}
      size="sm"
    >
      <div className="space-y-4" data-testid="calm-minute">
        <div className="grid place-items-center py-2">
          <div className="grid h-44 w-44 place-items-center">
            <div
              data-testid="calm-circle"
              data-phase={running ? (breatheIn ? 'in' : 'out') : 'idle'}
              className="grid h-44 w-44 place-items-center rounded-full border border-aurora-400/30 bg-aurora-400/10"
              style={{
                transform: `scale(${still ? 1 : expanded ? 1 : 0.62})`,
                transition: still ? 'none' : `transform ${PHASE_SECONDS}s ease-in-out`,
              }}
              aria-hidden
            />
            <p className="absolute text-lg font-extrabold text-main" data-testid="calm-label">
              {label}
            </p>
          </div>
          {running && (
            <p className="text-[11px] font-bold text-muted" data-testid="calm-left">
              {tr('Seconds left: {n}', { n: num(TOTAL_SECONDS - elapsed) })}
            </p>
          )}
        </div>

        {finished && (
          <p role="status" className="rounded-2xl border border-line bg-card-2 p-3 text-center text-xs font-bold text-main" data-testid="calm-done">
            {tr('Well done. Carry on at your own pace.')}
          </p>
        )}

        {running ? (
          <Button variant="secondary" className="w-full" onClick={() => setRunning(false)}>
            {tr('Stop the breathing minute')}
          </Button>
        ) : (
          <Button className="w-full" onClick={start} data-testid="calm-start">
            <Wind className="h-4 w-4" /> {tr('Start the calm minute')}
          </Button>
        )}

        <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted">
          <li>{tr('Drink some water and loosen your shoulders.')}</li>
          <li>{tr('Read each question twice before you answer.')}</li>
          <li>{tr('Start with the easiest question for you.')}</li>
        </ul>

        <p className="text-[10px] leading-relaxed text-muted-2">
          {tr('This is general breathing and calm tips, not treatment. If worry stays strong, talk to someone you trust.')}
        </p>
      </div>
    </Modal>
  )
}
