import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SidebarContent } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { QuickPanel } from './QuickPanel'
import { Toaster } from '@/components/Toaster'
import { GlobalSearch } from '@/components/GlobalSearch'
import { useEffect } from 'react'
import { useApp } from '@/store/useApp'
import { useServiceWorker } from '@/hooks/usePlatform'
import { Button } from '@/components/ui/Button'
import { RefreshCw, WifiOff } from 'lucide-react'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'
import { useKidsWorld } from '@/lib/stage'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const theme = useApp((s) => s.settings.theme)
  const textScale = useApp((s) => s.settings.textScale)
  const dyslexia = useApp((s) => s.settings.dyslexiaFont)
  const reduceMotion = useApp((s) => s.settings.reduceMotion)
  const rtl = useApp((s) => s.settings.language === 'ar')
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const primaryUi = useApp((s) => s.settings.primaryUi)
  const kids = useKidsWorld(gradeLevel, primaryUi)
  const { updateReady, applyUpdate } = useServiceWorker()
  const pushToast = useUI((s) => s.pushToast)
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
    root.classList.toggle('dark', theme === 'dark')
    root.style.fontSize = `${textScale}%`
    root.classList.toggle('dyslexic', dyslexia)
    root.classList.toggle('reduce-motion', reduceMotion)
    root.classList.toggle('kids-mode', kids)
  }, [theme, textScale, dyslexia, reduceMotion, kids])

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    if (updateReady)
      pushToast({
        title: tr('A fresh Jessica is ready'),
        description: tr('Refresh to load the newest version.'),
        type: 'info',
        duration: 10000,
      })
  }, [updateReady, pushToast])

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-violet-neon/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-aurora-400/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky/10 blur-[120px]" />
      </div>

      <aside className="print:hidden fixed inset-y-0 start-0 z-50 hidden w-[264px] border-e border-line bg-app/60 backdrop-blur-2xl lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: rtl ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: rtl ? 280 : -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative h-full w-[280px] border-e border-line bg-app"
            >
              <SidebarContent onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:ps-[264px]">
        <TopBar onMenu={() => setMenuOpen(true)} />
        {offline && (
          <div className="print:hidden flex items-center justify-center gap-2 border-b border-sun/20 bg-sun/10 px-4 py-1.5 text-[11px] font-semibold text-sun">
            <WifiOff className="h-3.5 w-3.5" /> {tr('Offline mode — reading, flashcards and labs still work. AI needs a connection.')}
          </div>
        )}
        {updateReady && (
          <div className="print:hidden flex items-center justify-between gap-2 border-b border-aurora-400/20 bg-aurora-400/10 px-4 py-1.5 text-[11px] font-semibold text-aurora-200">
            <span>{tr('New version available.')}</span>
            <Button size="sm" variant="primary" onClick={applyUpdate} className="h-7 px-2 text-[10px]">
              <RefreshCw className="h-3 w-3" /> {tr('Refresh')}
            </Button>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1540px] px-3 pb-28 pt-4 sm:px-5 lg:px-7 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav />
      <QuickPanel />
      <GlobalSearch />
      <Toaster />
    </div>
  )
}
