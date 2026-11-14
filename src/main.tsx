import './lib/polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/cairo/400.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import '@fontsource/cairo/800.css'
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import './index.css'
import App from './App'
import { I18nProvider, loadLanguage } from './i18n'
import type { UiLanguage } from './types'
import { ErrorBoundary } from './components/ErrorBoundary'

function savedLanguage(): UiLanguage | undefined {
  try {
    const raw = localStorage.getItem('jessica-profile-v1')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.state?.settings?.language as UiLanguage | undefined
  } catch {
    return undefined
  }
}

function start() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

const language = savedLanguage()
if (language && language !== 'en' && language !== 'ar') {
  // Load the locale pack before the first paint so the UI never flashes English.
  loadLanguage(language).finally(start)
} else {
  start()
}
