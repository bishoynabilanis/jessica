import { Suspense, useCallback, useEffect, useRef } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Onboarding } from '@/components/Onboarding'
import { SetupGate } from '@/components/SetupGate'
import { TermsGate } from '@/components/TermsGate'
import { TERMS_VERSION } from '@/data/terms'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dashboard } from '@/pages/Dashboard'
import { Mascot } from '@/components/Mascot'
import {
  LazyAsk,
  LazyAssignment,
  LazyBattle,
  LazyBubbleSheet,
  LazyConstellation,
  LazyDailyPlan,
  LazyDisclaimer,
  LazyExamCalendar,
  LazyGames,
  LazyFeedback,
  LazyHelp,
  LazyInstall,
  LazyKidsApp,
  LazyLabs,
  LazyLibrary,
  LazyMascotPage,
  LazyMistakes,
  LazyPractice,
  LazyReader,
  LazyReadingCoach,
  LazySettings,
  LazySkills,
  LazyStudyHub,
  LazyTeacher,
  LazyVault,
  LazyWorksheets,
} from '@/pages/lazy'
import { useApp } from '@/store/useApp'
import { sendLocalNotification, useDailyRiddleNotification } from '@/hooks/usePlatform'
import { riddleForDate } from '@/data/riddles'
import { todayKey } from '@/lib/utils'
import { tr } from '@/i18n'
import { useKidsWorld } from '@/lib/stage'
import { registerInstall, registerOpen } from '@/lib/counter'

function RouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <Mascot xp={0} size={92} mood="thinking" animate={false} />
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-aurora-400" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-2">{tr('Loading')}</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <Card className="p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-neon/15 text-violet-glow">
          <Compass className="h-7 w-7" />
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-main">{tr("This star isn’t on the map")}</h1>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {tr("The page you followed doesn’t exist. Jump back to your dashboard and keep the streak alive.")}
        </p>
        <Link to="/" className="mt-4 inline-block">
          <Button>
            <Home className="h-4 w-4" /> {tr("Back to home")}
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default function App() {
  const onboarded = useApp((s) => s.onboarded)
  const acceptedTerms = useApp((s) => s.acceptedTerms)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const primaryUi = useApp((s) => s.settings.primaryUi)
  const apiKey = useApp((s) => s.apiKey)
  const customBooks = useApp((s) => s.customBooks)
  const notifications = useApp((s) => s.settings.notifications)
  const bootstrap = useApp((s) => s.bootstrap)
  const booted = useRef(false)

  useEffect(() => {
    // Warm the most-used routes on idle connections only; skip on save-data/2G.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /2g/i.test(connection?.effectiveType || '')) return
    const prefetch = () => {
      void import('@/pages/Library')
      void import('@/pages/StudyHub')
      void import('@/pages/DailyPlan')
      void import('@/pages/ExamCalendar')
    }
    let idle: number
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(prefetch, { timeout: 4000 })
    } else {
      idle = window.setTimeout(prefetch, 2500)
    }
    return () => {
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    void registerOpen()
    const onInstall = () => {
      void registerInstall()
    }
    window.addEventListener('appinstalled', onInstall)
    return () => window.removeEventListener('appinstalled', onInstall)
  }, [])

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    bootstrap()
  }, [bootstrap])

  const notifyRiddle = useCallback(() => {
    const riddle = riddleForDate(todayKey())
    sendLocalNotification(tr('Your daily riddle is ready 🌙'), riddle.question, 'jessica-daily-riddle')
  }, [])

  useDailyRiddleNotification(notifications && onboarded, notifyRiddle)

  if (!onboarded) return <Onboarding />

  // Mandatory disclaimer: every learner accepts before entering.
  if (acceptedTerms < TERMS_VERSION) return <TermsGate />

  // Hard gate: a Gemini key and at least one imported book are required.
  if (!apiKey.trim() || customBooks.length === 0) return <SetupGate />

  if (useKidsWorld(gradeLevel, primaryUi))
    return (
      <Suspense fallback={<RouteFallback />}>
        <LazyKidsApp />
      </Suspense>
    )

  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<LazyLibrary />} />
          <Route path="reader/:bookId" element={<LazyReader />} />
          <Route path="study" element={<LazyStudyHub />} />
          <Route path="games" element={<LazyGames />} />
          <Route path="labs" element={<LazyLabs />} />
          <Route path="constellation" element={<LazyConstellation />} />
          <Route path="vault" element={<LazyVault />} />
          <Route path="mascot" element={<LazyMascotPage />} />
          <Route path="settings" element={<LazySettings />} />
          <Route path="battle" element={<LazyBattle />} />
          <Route path="worksheets" element={<LazyWorksheets />} />
          <Route path="reading" element={<LazyReadingCoach />} />
          <Route path="teacher" element={<LazyTeacher />} />
          <Route path="assign" element={<LazyAssignment />} />
          <Route path="mistakes" element={<LazyMistakes />} />
          <Route path="skills" element={<LazySkills />} />
          <Route path="plan" element={<LazyDailyPlan />} />
          <Route path="calendar" element={<LazyExamCalendar />} />
          <Route path="ask" element={<LazyAsk />} />
          <Route path="practice" element={<LazyPractice />} />
          <Route path="help" element={<LazyHelp />} />
          <Route path="install" element={<LazyInstall />} />
          <Route path="scan" element={<LazyBubbleSheet />} />
          <Route path="disclaimer" element={<LazyDisclaimer />} />
          <Route path="feedback" element={<LazyFeedback />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </HashRouter>
  )
}
