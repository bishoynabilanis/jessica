import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const KEY = 'jessica-last-route'
const MAX_AGE = 6 * 60 * 60 * 1000
// Only pages worth resuming: a freshly opened "/" jumps back to where the
// learner actually stopped instead of dumping them on the dashboard.
const RESUMABLE = /^\/(reader|study|library|practice|ask|plan|mistakes|skills)(\/|$)/

/**
 * Remembers the last study screen so closing the app mid-book does not lose
 * the place. A deep link or a share link (non-empty hash) always wins.
 */
export function RouteMemory() {
  const location = useLocation()
  const navigate = useNavigate()
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    if (location.pathname !== '/') return
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as { path?: string; at?: number }
      if (!saved.path || !saved.at) return
      if (Date.now() - saved.at > MAX_AGE) return
      if (!RESUMABLE.test(saved.path)) return
      navigate(saved.path, { replace: true })
    } catch {
      /* a broken value should never block the app */
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!RESUMABLE.test(location.pathname)) return
    try {
      localStorage.setItem(KEY, JSON.stringify({ path: location.pathname + location.search, at: Date.now() }))
    } catch {
      /* storage full or blocked */
    }
  }, [location.pathname, location.search])

  return null
}
