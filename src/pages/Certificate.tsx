import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Flame,
  GraduationCap,
  Lock,
  Printer,
  QrCode,
  Share2,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui/Card'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { levelLabel } from '@/lib/curriculum'
import { shareAchievement } from '@/lib/shareCard'
import { tr, num, getLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

/** Everything a printed certificate needs, so the QR copy can rebuild it. */
interface CertRecord {
  /** name */
  n: string
  /** level */
  l: number
  /** xp */
  x: number
  /** units mastered */
  u: number
  /** streak */
  s: number
  /** skills practised */
  k: number
  /** grade label */
  g: string
  /** issued on (ISO date) */
  d: string
}

const APP_URL = 'https://bishoynabilanis.github.io/jessica/'

function base64url(text: string) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(value: string) {
  try {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

function certificateId(record: CertRecord) {
  let hash = 0
  for (const char of `${record.n}${record.d}${record.x}`) hash = (hash * 31 + char.charCodeAt(0)) % 46656
  return `JSC-${record.x.toString(36).toUpperCase()}-${hash.toString(36).toUpperCase().padStart(3, '0')}`
}

function readRecord(value: string | null): CertRecord | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(fromBase64url(value)) as CertRecord
    if (!parsed || typeof parsed.n !== 'string' || typeof parsed.l !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

const STAT_ICONS = [Zap, Award, GraduationCap, Flame, Target]

export function Certificate() {
  const state = useApp()
  const { name, xp, streak, completedTopics, skillStats, settings } = state
  const pushToast = useUI((s) => s.pushToast)
  const [params] = useSearchParams()
  const [qr, setQr] = useState('')

  const { level } = levelInfo(xp)
  const grade = levelLabel(settings.gradeLevel, settings.curriculum)
  const skills = Object.keys(skillStats).length
  const units = completedTopics.length
  const issued = new Date()
  const dateISO = issued.toISOString().slice(0, 10)

  const own = useMemo<CertRecord>(
    () => ({
      n: name || tr('Student'),
      l: level,
      x: xp,
      u: units,
      s: streak,
      k: skills,
      g: grade,
      d: dateISO,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, level, xp, units, streak, skills, grade, dateISO],
  )

  // A scanned code rebuilds the exact record it was printed with.
  const scanned = useMemo(() => readRecord(params.get('v')), [params])
  const record = scanned || own
  const id = certificateId(record)
  const earned = scanned ? true : units > 0 || xp >= 200

  const link = `${APP_URL}#/certificate?v=${base64url(JSON.stringify({ ...own, d: dateISO }))}`

  useEffect(() => {
    if (!earned) return
    let cancelled = false
    void import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(link, {
          width: 420,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#0b1220', light: '#ffffff' },
        }),
      )
      .then((data) => {
        if (!cancelled) setQr(data)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [earned, link])

  const dateText = new Date(`${record.d}T00:00:00`).toLocaleDateString(
    getLanguage() === 'ar' ? 'ar-EG' : getLanguage(),
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  const stats = [
    { label: tr('Level'), value: num(record.l), icon: Award },
    { label: tr('XP'), value: num(record.x), icon: Zap },
    { label: tr('units mastered'), value: num(record.u), icon: GraduationCap },
    { label: tr('Day streak'), value: num(record.s), icon: Flame },
    { label: tr('Skills practised'), value: num(record.k), icon: Target },
  ]

  const share = async () => {
    const result = await shareAchievement({
      title: tr('Certificate of achievement'),
      subtitle: record.n,
      emoji: '🏆',
      lines: [
        `${tr('Level')} ${num(record.l)}`,
        `${num(record.x)} ${tr('XP')}`,
        `${num(record.u)} ${tr('units mastered')}`,
        `${tr(record.g)}`,
      ],
    })
    if (result === 'downloaded') pushToast({ title: tr('Certificate downloaded'), type: 'success' })
    if (result === 'shared') pushToast({ title: tr('Certificate shared'), type: 'success' })
  }

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <PageHeader
          eyebrow={tr('Certificate')}
          title={tr('Your certificate')}
          subtitle={tr('A printable A4 record of everything you have earned — print it, save it as PDF, or scan the code to check it.')}
          icon={<Award className="h-5 w-5" />}
          actions={
            <Link to="/skills">
              <Button variant="secondary" size="md">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {tr('Back to skills')}
              </Button>
            </Link>
          }
        />
      </div>

      {scanned && (
        <Card className="print:hidden border-aurora-400/30 bg-aurora-400/10 p-4">
          <div className="flex items-start gap-2.5">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-aurora-300" />
            <div>
              <p className="text-sm font-extrabold text-main">{tr('Verified copy')}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {tr('This copy was opened from the certificate code, so the details match the original.')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {!earned && (
        <Card className="print:hidden border-sun/30 bg-sun/10 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-main">{tr('Not earned yet')}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {tr('Earn it by finishing your first unit or reaching 200 XP.')}
              </p>
              <ProgressBar value={Math.min(xp, 200)} max={200} height="h-1.5" className="mt-2" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/plan">
                  <Button size="sm">
                    <Sparkles className="h-3.5 w-3.5" /> {tr('See my plan')}
                  </Button>
                </Link>
                <Link to="/diagnostic">
                  <Button size="sm" variant="secondary">
                    <Target className="h-3.5 w-3.5" /> {tr('Start the test')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="print:hidden flex flex-wrap gap-2">
        <Button size="md" onClick={() => window.print()} disabled={!earned}>
          <Printer className="h-4 w-4" /> {tr('Print / Save as PDF')}
        </Button>
        <Button size="md" variant="secondary" onClick={share} disabled={!earned}>
          <Share2 className="h-4 w-4" /> {tr('Share')}
        </Button>
        <span className="ms-auto self-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
          {tr('A4 · print ready')}
        </span>
      </div>

      {/* ------------------------------- the sheet ------------------------------- */}
      <div
        data-testid="certificate-sheet"
        className={cn(
          'cert-print relative mx-auto flex w-full max-w-[820px] flex-col overflow-hidden bg-white text-[#0b1220] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)] lg:aspect-[210/297]',
          !earned && 'select-none',
        )}
        dir={getLanguage() === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* guilloche-ish frame */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-3 border-[3px] border-[#c8a24a]" />
          <div className="absolute inset-[18px] border border-[#c8a24a]/50" />
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#0f766e] via-[#c8a24a] to-[#0f766e]" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-[#0f766e] via-[#c8a24a] to-[#0f766e]" />
          {[
            'left-6 top-6 border-s-[3px] border-t-[3px]',
            'right-6 top-6 border-e-[3px] border-t-[3px]',
            'left-6 bottom-6 border-s-[3px] border-b-[3px]',
            'right-6 bottom-6 border-e-[3px] border-b-[3px]',
          ].map((position) => (
            <div key={position} className={cn('absolute h-8 w-8 border-[#c8a24a]', position)} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
          <span className="select-none font-display text-[22rem] font-black leading-none text-[#0f766e]/[0.035]">J</span>
        </div>

        <div className="relative flex h-full flex-col justify-between px-8 py-10 text-center sm:px-14 sm:py-12">
          <div className="flex w-full flex-1 flex-col justify-center">
          <div className="flex items-center justify-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f766e] font-display text-lg font-black text-white">
              J
            </span>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0f766e]">Jessica</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7a53]">{tr('Learning universe')}</p>
            </div>
          </div>

          <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.32em] text-[#8a7a53]">
            {tr('Certificate')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black text-[#0b1220] sm:text-[3rem]">
            {tr('Certificate of achievement')}
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-14 bg-[#c8a24a]" />
            <span className="text-[11px]">🏆</span>
            <span className="h-px w-14 bg-[#c8a24a]" />
          </div>

          <p className="mt-6 text-[12px] text-[#4b5563]">{tr('This certificate is awarded to')}</p>
          <p className="mt-2 font-display text-[1.9rem] font-black leading-tight text-[#0f766e] sm:text-[2.7rem]">
            {record.n}
          </p>

          <p className="mx-auto mt-5 max-w-[600px] text-[12.5px] leading-[1.9] text-[#374151]">
            {tr(
              'for reaching level {level} in {grade}, mastering {units} units and practising {skills} skills across {xp} XP.',
              {
                level: num(record.l),
                grade: tr(record.g),
                units: num(record.u),
                skills: num(record.k),
                xp: num(record.x),
              },
            )}
          </p>

          <div className="mx-auto mt-9 grid max-w-[640px] grid-cols-2 gap-2.5 sm:grid-cols-5">
            {stats.map((stat, index) => {
              const Icon = STAT_ICONS[index]
              return (
                <div key={stat.label} className="rounded-xl border border-[#e7dcc0] bg-[#fdfaf1] px-2 py-3">
                  <Icon className="mx-auto h-3.5 w-3.5 text-[#0f766e]" />
                  <p className="mt-1 font-display text-xl font-black text-[#0b1220]">{stat.value}</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8a7a53]">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div className="relative grid h-24 w-24 place-items-center rounded-full border-[3px] border-[#c8a24a] bg-[#fdfaf1] shadow-[inset_0_0_0_4px_#fff]">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-[#c8a24a]/60" />
              <div className="text-center">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#8a7a53]">{tr('Level')}</p>
                <p className="font-display text-2xl font-black leading-none text-[#0f766e]">{num(record.l)}</p>
              </div>
            </div>
          </div>
          </div>

          <div>
          <div className="flex items-end justify-between gap-4 text-start">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a7a53]">{tr('Issued on')}</p>
              <p className="mt-0.5 text-[11px] font-bold text-[#0b1220]">{dateText}</p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a7a53]">{tr('Certificate ID')}</p>
              <p className="mt-0.5 font-mono text-[11px] font-bold text-[#0b1220]" dir="ltr">
                {id}
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="text-center">
                <p className="font-display text-base italic text-[#0f766e]">Jessica</p>
                <span className="mt-1 block h-px w-24 bg-[#c8a24a]" />
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a7a53]">
                  {tr('Your learning companion')}
                </p>
              </div>
            </div>

            <div className="text-center">
              {earned && qr ? (
                <img src={qr} alt={tr('Scan to verify')} className="h-20 w-20 rounded-md border border-[#e7dcc0] bg-white p-1" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-md border border-dashed border-[#c8a24a]/60 text-[8px] font-bold text-[#8a7a53]">
                  {tr('Locked')}
                </div>
              )}
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8a7a53]">{tr('Scan to verify')}</p>
            </div>
          </div>

          <p className="mt-5 text-[8px] leading-relaxed text-[#9a8f78]">
            {tr('A digital certificate from Jessica — generated on this device, no server involved.')}
          </p>
          </div>

          {!earned && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="select-none rounded-xl border-2 border-[#c8a24a]/40 bg-white/60 px-6 py-2 font-display text-2xl font-black uppercase tracking-[0.35em] text-[#c8a24a]/50">
                {tr('Preview')}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="print:hidden text-center text-[10px] text-muted-2">
        {tr('The code opens a read-only copy of this certificate on any device.')}
      </p>
    </div>
  )
}
