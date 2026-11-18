import { useState } from 'react'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { clearOfflineModel, loadOfflineModel, offlineReady, offlineSupport } from '@/lib/ai/offline'
import { tr } from '@/i18n'

/**
 * The one place that owns "download the local model" state.
 *
 * Before this hook the download lived inside a settings card, so the only way
 * to turn the AI on without a key was to guess that Settings had it. Setup,
 * the AI-needed modal and onboarding now share the same behaviour — including
 * switching the app to offline mode and marking the key step as satisfied.
 */
export interface OfflineModelState {
  support: ReturnType<typeof offlineSupport>
  ready: boolean
  downloading: boolean
  progress: number
  status: string
  start: () => Promise<void>
  remove: () => Promise<void>
}

export function useOfflineModel(onReady?: () => void): OfflineModelState {
  const updateSettings = useApp((s) => s.updateSettings)
  const pushToast = useUI((s) => s.pushToast)

  const [support] = useState(offlineSupport)
  const [ready, setReady] = useState(offlineReady)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  const start = async () => {
    if (!support.ok || downloading) return
    setDownloading(true)
    setProgress(0)
    setStatus(tr('Downloading the model… first time only.'))
    try {
      await loadOfflineModel((report) => {
        setProgress(Math.round(report.progress * 100))
        if (report.text) setStatus(report.text)
      })
      setReady(true)
      // Without a key the offline model is the AI: switch to it and clear the
      // key gate so a learner never sees "connect a key" again.
      updateSettings({ aiMode: 'offline', keyOptional: true })
      pushToast({ title: tr('The model is ready — AI now works offline.'), type: 'success' })
      onReady?.()
    } catch {
      pushToast({ title: tr('The download did not finish. Try again or use cloud mode.'), type: 'error' })
    } finally {
      setDownloading(false)
      setStatus('')
    }
  }

  const remove = async () => {
    await clearOfflineModel()
    setReady(false)
    if (useApp.getState().settings.aiMode === 'offline') updateSettings({ aiMode: 'cloud' })
    pushToast({ title: tr('The model files were removed.'), type: 'info' })
  }

  return { support, ready, downloading, progress, status, start, remove }
}
