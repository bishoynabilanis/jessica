import type { BankQuestion, BankSubject } from './questionBank'

/**
 * Every sheet the app prints is kept here with a short code, so a parent can
 * later open the paper, tap the answers the child wrote, and get it marked
 * offline — no camera, no key, no server.
 */

export interface PrintedPaper {
  id: string
  code: string
  subject: BankSubject
  at: number
  questions: BankQuestion[]
}

const KEY = 'jessica-printed-papers-v1'
const LIMIT = 20

export function readPrintedPapers(): PrintedPaper[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((paper) => paper && Array.isArray(paper.questions)).slice(0, LIMIT)
  } catch {
    return []
  }
}

function makeCode(at: number): string {
  return `JP-${at.toString(36).slice(-5).toUpperCase()}`
}

export function savePrintedPaper(subject: BankSubject, questions: BankQuestion[]): PrintedPaper {
  const at = Date.now()
  const paper: PrintedPaper = { id: `paper_${at.toString(36)}`, code: makeCode(at), subject, at, questions }
  const next = [paper, ...readPrintedPapers()].slice(0, LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* the sheet still prints; the record is a bonus */
  }
  return paper
}

export function getPrintedPaper(id: string): PrintedPaper | undefined {
  return readPrintedPapers().find((paper) => paper.id === id)
}

export function removePrintedPaper(id: string) {
  const next = readPrintedPapers().filter((paper) => paper.id !== id)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
