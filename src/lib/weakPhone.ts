import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'

/** Text-reading engine (Arabic + English data, worker and core): measured ~13 MB of data plus ~5 MB of code. */
export const OCR_DOWNLOAD_MB = 18

/** True when the student switched on Weak phone mode. */
export function isWeakPhone() {
  return !!useApp.getState().settings.weakPhone
}

const approved = new Set<string>()

/**
 * Before a big download: in Weak phone mode, show the size in MB and let the
 * student say no. Outside weak mode (or for small files) it returns true at
 * once. A yes is remembered for the rest of the session so it asks only once.
 */
export async function confirmBigDownload(what: string, mb: number): Promise<boolean> {
  if (!isWeakPhone() || mb < 5) return true
  if (approved.has(what)) return true
  const ok = await useUI.getState().askDownload(what, mb)
  if (ok) approved.add(what)
  return ok
}
