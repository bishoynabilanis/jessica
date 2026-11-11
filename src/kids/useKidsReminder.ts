import { useEffect } from 'react'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { sendLocalNotification } from '@/hooks/usePlatform'
import { todayKey } from '@/lib/utils'
import { tr } from '@/i18n'

/**
 * Fires the parent-chosen daily reminder while the kids area is open.
 * A static PWA cannot wake up in the background without a push server.
 */
export function useKidsReminder() {
  const reminder = useApp((s) => s.settings.kidsReminder)
  const date = useApp((s) => s.kidsReminderDate)
  const setDate = useApp((s) => s.setKidsReminderDate)
  const pushToast = useUI((s) => s.pushToast)

  useEffect(() => {
    if (!reminder) return
    const check = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const today = todayKey()
      if (date === today) return
      if (`${hh}:${mm}` !== reminder) return
      setDate(today)
      const title = tr('Time to study with Jessica 📚')
      const body = tr('A little lesson is waiting for you.')
      pushToast({ title, description: body, type: 'info' })
      sendLocalNotification(title, body, `kids-reminder-${today}`).catch(() => undefined)
    }
    check()
    const timer = window.setInterval(check, 20_000)
    return () => window.clearInterval(timer)
  }, [reminder, date, setDate, pushToast])
}
