import { useCallback, useEffect, useRef } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Onboarding } from '@/components/Onboarding'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dashboard } from '@/pages/Dashboard'
import { KidsApp } from '@/kids/KidsApp'
import { Library } from '@/pages/Library'
import { Reader } from '@/pages/Reader'
import { StudyHub } from '@/pages/StudyHub'
import { Games } from '@/pages/Games'
import { Labs } from '@/pages/Labs'
import { Constellation } from '@/pages/Constellation'
import { Vault } from '@/pages/Vault'
import { MascotPage } from '@/pages/MascotPage'
import { Settings } from '@/pages/Settings'
import { Battle } from '@/pages/Battle'
import { Worksheets } from '@/pages/Worksheets'
import { ReadingCoach } from '@/pages/ReadingCoach'
import { Teacher } from '@/pages/Teacher'
import { Assignment } from '@/pages/Assignment'
import { Mistakes } from '@/pages/Mistakes'
import { Skills } from '@/pages/Skills'
import { DailyPlan } from '@/pages/DailyPlan'
import { useApp } from '@/store/useApp'
import { sendLocalNotification, useDailyRiddleNotification } from '@/hooks/usePlatform'
import { riddleForDate } from '@/data/riddles'
import { todayKey } from '@/lib/utils'
import { tr } from '@/i18n'
import { stageForGrade } from '@/lib/stage'

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
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const notifications = useApp((s) => s.settings.notifications)
  const bootstrap = useApp((s) => s.bootstrap)
  const booted = useRef(false)

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
  if (stageForGrade(gradeLevel) === 'primary') return <KidsApp />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="reader/:bookId" element={<Reader />} />
          <Route path="study" element={<StudyHub />} />
          <Route path="games" element={<Games />} />
          <Route path="labs" element={<Labs />} />
          <Route path="constellation" element={<Constellation />} />
          <Route path="vault" element={<Vault />} />
          <Route path="mascot" element={<MascotPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="battle" element={<Battle />} />
          <Route path="worksheets" element={<Worksheets />} />
          <Route path="reading" element={<ReadingCoach />} />
          <Route path="teacher" element={<Teacher />} />
          <Route path="assign" element={<Assignment />} />
          <Route path="mistakes" element={<Mistakes />} />
          <Route path="skills" element={<Skills />} />
          <Route path="plan" element={<DailyPlan />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
