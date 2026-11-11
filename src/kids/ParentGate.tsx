import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { hashPin } from '@/lib/pin'
import { tr } from '@/i18n'

const KEY = 'jessica-parent-ok'

export function hasParentAccess() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function grantParentAccess() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* ignore */
  }
}

export function ParentGate({ children }: { children: React.ReactNode }) {
  const pinHash = useApp((s) => s.settings.parentPinHash)
  const [problem] = useState(() => {
    if (Math.random() < 0.5) {
      const a = 12 + Math.floor(Math.random() * 18)
      const b = 12 + Math.floor(Math.random() * 18)
      const c = 3 + Math.floor(Math.random() * 7)
      const d = 5 + Math.floor(Math.random() * 15)
      return { text: `(${a} + ${b}) × ${c} − ${d}`, answer: (a + b) * c - d }
    }
    const a = 7 + Math.floor(Math.random() * 13)
    const b = 6 + Math.floor(Math.random() * 14)
    const c = 11 + Math.floor(Math.random() * 19)
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c }
  })
  const [answer, setAnswer] = useState('')
  const [pin, setPin] = useState('')
  const [useMath, setUseMath] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [checking, setChecking] = useState(false)
  const [unlocked, setUnlocked] = useState(() => hasParentAccess())

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  if (unlocked) return <>{children}</>

  const fail = (message: string) => {
    const next = attempts + 1
    if (next >= 3) {
      setAttempts(0)
      setCooldown(45)
      setError(tr('Too many tries — wait a moment and ask a grown-up.'))
    } else {
      setAttempts(next)
      setError(message)
    }
  }

  const tryMath = () => {
    if (cooldown > 0) return
    if (Number(answer) === problem.answer) {
      grantParentAccess()
      setUnlocked(true)
    } else {
      fail(tr('Try again'))
    }
  }

  const tryPin = async () => {
    if (cooldown > 0 || checking) return
    if (!pinHash) {
      setUseMath(true)
      return
    }
    setChecking(true)
    try {
      const hashed = await hashPin(pin)
      if (hashed === pinHash) {
        grantParentAccess()
        setUnlocked(true)
      } else {
        fail(tr('Wrong PIN'))
      }
    } finally {
      setChecking(false)
    }
  }

  const pinMode = !!pinHash && !useMath

  return (
    <div className="mx-auto mt-6 max-w-md">
      <Card className="rounded-[32px] p-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-sun/15 text-sun">
          <Lock className="h-8 w-8" />
        </span>
        <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr('For grown-ups')}</h1>

        {pinMode ? (
          <>
            <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
              {tr('Enter the parent PIN to open the parent area.')}
            </p>
            <input
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && tryPin()}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="field mx-auto mt-4 max-w-[180px] text-center text-xl font-extrabold tracking-[0.5em]"
              placeholder="••••"
              autoFocus
              disabled={cooldown > 0}
            />
            <p className="mt-1 text-[9px] font-semibold text-muted-2">{tr('4–6 digits · chosen by a parent')}</p>
            <button
              onClick={() => {
                setUseMath(true)
                setError('')
              }}
              className="mt-3 text-[10px] font-bold text-sky hover:underline"
            >
              {tr('Forgot the PIN? Use the math question')}
            </button>
          </>
        ) : (
          <>
            <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
              {tr('Solve this small sum to open the parent area.')}
            </p>
            <p className="mt-4 font-display text-2xl font-extrabold text-main" dir="ltr">
              {problem.text} = ?
            </p>
            <input
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && tryMath()}
              inputMode="numeric"
              className="field mx-auto mt-3 max-w-[160px] text-center text-lg font-extrabold"
              placeholder="?"
              autoFocus
              disabled={cooldown > 0}
            />
            {pinHash && (
              <button
                onClick={() => {
                  setUseMath(false)
                  setError('')
                }}
                className="mt-2 block w-full text-[10px] font-bold text-sky hover:underline"
              >
                {tr('Use the parent PIN instead')}
              </button>
            )}
          </>
        )}

        {error && <p className="mt-2 text-[11px] font-semibold text-coral">{error}</p>}
        {cooldown > 0 && (
          <p className="mt-2 text-[11px] font-bold text-coral">
            {tr('Wait {n} seconds before trying again.', { n: cooldown })}
          </p>
        )}

        <Button
          className="mt-4"
          onClick={() => (pinMode ? tryPin() : tryMath())}
          disabled={cooldown > 0}
          loading={checking}
        >
          {cooldown > 0 ? tr('Please wait…') : tr('Open parent area')}
        </Button>
      </Card>
    </div>
  )
}
