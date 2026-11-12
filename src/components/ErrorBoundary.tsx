import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Copy, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'
import { rememberCrash } from '@/lib/diagnostics'
import { reportError } from '@/lib/errorReporting'

const LOG_KEY = 'jessica-error-log'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportError({ message: error.message, stack: error.stack, source: 'boundary' })
    try {
      const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as unknown[]
      log.unshift({
        at: new Date().toISOString(),
        message: error.message,
        stack: error.stack?.slice(0, 4000),
        componentStack: info.componentStack?.slice(0, 4000),
      })
      localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 20)))
    } catch {
      /* ignore */
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    const details = `${this.state.error.message}\n${this.state.error.stack || ''}`

    return (
      <div className="grid min-h-dvh place-items-center bg-app p-5">
        <div className="w-full max-w-md rounded-3xl border border-line bg-card p-6 text-center shadow-card">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral/15 text-coral">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr('Something went wrong')}</h1>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {tr('Your progress is saved on this device. Reload the app to continue.')}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" /> {tr('Reload')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.hash = '#/'
                window.location.reload()
              }}
            >
              <Home className="h-4 w-4" /> {tr('Back to home')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigator.clipboard?.writeText(details).catch(() => undefined)}
            >
              <Copy className="h-3.5 w-3.5" /> {tr('Copy details')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                rememberCrash(`${this.state.error?.message || ''}\n${this.state.error?.stack || ''}`)
                window.location.href = './#/feedback?kind=bug&auto=1'
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> {tr('Send a report')}
            </Button>
          </div>
          <p className="mt-3 text-[9px] text-muted-2">
            {tr('Error details are kept locally to help fix the problem.')}
          </p>
        </div>
      </div>
    )
  }
}
