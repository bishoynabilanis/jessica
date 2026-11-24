/**
 * Lab notebook: the child's own prediction, two tries and explanation for a
 * lab that came from a book unit. Saved on this device only (localStorage).
 * The app writes no science content: every word in an entry is the child's.
 */

export type Trend = 'up' | 'down' | 'same'

export interface LabTry {
  changed: string
  result: Trend
  note: string
}

export interface NotebookEntry {
  id: string
  bookId: string
  unitId: string
  lab: string
  page: number
  createdAt: number
  watching: string
  prediction: Trend
  first: LabTry
  second: LabTry
  explanation: string
}

const KEY = 'jessica-lab-notebook-v1'
const MAX_ENTRIES = 60

export function loadNotebook(): NotebookEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addNotebookEntry(entry: Omit<NotebookEntry, 'id' | 'createdAt'>): NotebookEntry[] {
  const saved: NotebookEntry = { ...entry, id: `n${Date.now().toString(36)}`, createdAt: Date.now() }
  const next = [saved, ...loadNotebook()].slice(0, MAX_ENTRIES)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage full: the entry stays on screen only */
  }
  return next
}

export function entriesFor(list: NotebookEntry[], bookId: string, unitId: string, lab: string) {
  return list.filter((item) => item.bookId === bookId && item.unitId === unitId && item.lab === lab)
}

export type Comparison = 'prediction-right' | 'prediction-different'

export function compare(entry: Pick<NotebookEntry, 'prediction' | 'first'>): Comparison {
  return entry.prediction === entry.first.result ? 'prediction-right' : 'prediction-different'
}

export function secondDiffers(entry: Pick<NotebookEntry, 'first' | 'second'>) {
  return entry.first.result !== entry.second.result
}
