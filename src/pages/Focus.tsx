import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Timer, Volume2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { todayKey } from '@/lib/utils'
import { num, tr } from '@/i18n'

type Mode = 'focus' | 'break'

interface Saved {
  mode: Mode
  total: number
  endsAt: number
}

const PRESETS = [15, 25, 50] as const
const STORE_KEY = 'jessica-focus'

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Saved
    if (!parsed || typeof parsed.endsAt !== 'number' || typeof parsed.total !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    ;[0, 0.22, 0.44].forEach((offset, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = [660, 880, 990][index]
      gain.gain.setValueAtTime(0.0001, now + offset)
      gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.42)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.45)
    })
    window.setTimeout(() => void ctx.close(), 1400)
  } catch {
    /* sound is a bonus */
  }
}

export function Focus() {
  const recordStudy = useApp((s) => s.recordStudy)
  const dailyLog = useApp((s) => s.dailyLog)
  const pushToast = useUI((s) => s.pushToast)

  const saved = useRef<Saved | null>(readSaved())
  const [mode, setMode] = useState<Mode>(saved.current?.mode || 'focus')
  const [total, setTotal] = useState(saved.current?.total || 25 * 60)
  const [endsAt, setEndsAt] = useState<number>(saved.current?.endsAt || 0)
  const [running, setRunning] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [finished, setFinished] = useState(false)
  const [hasStarted, setHasStarted] = useState(Boolean(saved.current))
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null)

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : total
  const progress = total ? 1 - remaining / total : 0

  const minutesToday = useMemo(() => {
    const entry = dailyLog[todayKey()] || { seconds: 0 }
    return Math.round(entry.seconds / 60)
  }, [dailyLog])

  // Resume a session that was running when the tab closed.
  useEffect(() => {
    if (saved.current && saved.current.endsAt > Date.now()) {
      setRunning(true)
      setMode(saved.current.mode)
      setTotal(saved.current.total)
      setEndsAt(saved.current.endsAt)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [running])

  // Finish
  useEffect(() => {
    if (!running || !endsAt || now < endsAt) return
    setRunning(false)
    setEndsAt(0)
    setFinished(true)
    setHasStarted(false)
    localStorage.removeItem(STORE_KEY)
    chime()
    if (mode === 'focus') {
      recordStudy(total)
      pushToast({
        title: tr('{n} minutes logged', { n: num(Math.round(total / 60)) }),
        description: tr('That is {n} XP and another step on the plan.', { n: num(Math.round(total / 60)) }),
        type: 'success',
      })
    } else {
      pushToast({ title: tr('Break over — back to it.'), type: 'info' })
    }
  }, [running, endsAt, now, mode, total, recordStudy, pushToast])

  // Keep the screen awake while the timer runs (best effort).
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }
    if (running && nav.wakeLock) {
      nav.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLock.current = lock
        })
        .catch(() => undefined)
    }
    return () => {
      void wakeLock.current?.release().catch(() => undefined)
      wakeLock.current = null
    }
  }, [running])

  useEffect(() => {
    document.title = running ? `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')} · Jessica` : 'Jessica'
    return () => {
      document.title = 'Jessica'
    }
  }, [running, remaining])

  const start = () => {
    const nextEnds = Date.now() + total * 1000
    setEndsAt(nextEnds)
    setRunning(true)
    setFinished(false)
    setHasStarted(true)
    setNow(Date.now())
    localStorage.setItem(STORE_KEY, JSON.stringify({ mode, total, endsAt: nextEnds }))
  }

  const pause = () => {
    setRunning(false)
    setTotal(remaining)
    setEndsAt(0)
    localStorage.removeItem(STORE_KEY)
  }

  const reset = () => {
    setRunning(false)
    setEndsAt(0)
    setTotal(mode === 'focus' ? 25 * 60 : 5 * 60)
    setFinished(false)
    setHasStarted(false)
    localStorage.removeItem(STORE_KEY)
  }

  const pick = (minutes: number, nextMode: Mode = mode) => {
    setMode(nextMode)
    setRunning(false)
    setEndsAt(0)
    setTotal(minutes * 60)
    setFinished(false)
    setHasStarted(false)
    localStorage.removeItem(STORE_KEY)
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const ring = 2 * Math.PI * 132

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow={tr('Focus timer')}
        title={tr('Twenty-five minutes. That is the whole trick.')}
        subtitle={tr('Pick a length, close everything else, and let the timer count the minutes into your plan.')}
        icon={<Timer className="h-5 w-5" />}
      />

      <Card className="p-5 text-center">
        <div className="mx-auto flex max-w-[320px] items-center justify-center gap-2">
          <Button size="sm" variant={mode === 'focus' ? 'primary' : 'secondary'} onClick={() => pick(mode === 'focus' ? Math.round(total / 60) || 25 : 25, 'focus')}>
            {tr('Focus')}
          </Button>
          <Button size="sm" variant={mode === 'break' ? 'primary' : 'secondary'} onClick={() => pick(5, 'break')}>
            {tr('Break 5')}
          </Button>
        </div>

        <div className="relative mx-auto mt-6 h-[300px] w-[300px]">
          <svg viewBox="0 0 300 300" className="h-full w-full -rotate-90">
            <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
            <circle
              cx="150"
              cy="150"
              r="132"
              fill="none"
              stroke={mode === 'focus' ? '#21e6c9' : '#6b8cff'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={ring}
              strokeDashoffset={ring * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.4s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-6xl font-black tabular-nums text-main" dir="ltr">
              {num(mm)}:{num(ss)}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-2">
              {mode === 'focus' ? tr('Focus') : tr('Break')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {running ? (
            <Button size="lg" variant="secondary" onClick={pause}>
              <Pause className="h-4 w-4" /> {tr('Pause')}
            </Button>
          ) : (
            <Button size="lg" onClick={start}>
              <Play className="h-4 w-4" /> {hasStarted ? tr('Resume') : tr('Start')}
            </Button>
          )}
          <Button size="lg" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> {tr('Reset')}
          </Button>
        </div>

        {finished && (
          <p className="mt-4 rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-3 py-2 text-[11px] font-bold text-aurora-200">
            {mode === 'focus' ? tr('Session done. Stand up, drink water, come back for the next one.') : tr('Break over — back to it.')}
          </p>
        )}
      </Card>

      <Card className="p-4">
        <p className="label mb-2 text-aurora-300">{tr('Length')}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((minutes) => (
            <Button
              key={minutes}
              size="sm"
              variant={total === minutes * 60 ? 'primary' : 'secondary'}
              onClick={() => pick(minutes, 'focus')}
            >
              {tr('{n} min', { n: num(minutes) })}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-card-2 px-3 py-2">
          <span className="text-[11px] font-bold text-muted">{tr('Minutes on this device today')}</span>
          <span className="font-display text-lg font-extrabold text-main">{num(minutesToday)}</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-muted-2">
          <Volume2 className="mt-0.5 h-3 w-3 shrink-0" />
          {tr('The timer keeps counting if you switch tabs, and it survives a refresh. Sound plays at the end.')}
        </p>
      </Card>
    </div>
  )
}
