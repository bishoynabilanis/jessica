import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { allCards, getPdfBytes, putCards, savePdfBytes } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { todayKey } from '@/lib/utils'

/**
 * A full ZIP backup: profile/progress JSON + imported PDFs + flashcards.
 * Imported books can be hundreds of MB, so this may take a moment.
 */
export async function exportFullBackup() {
  const state = useApp.getState()
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function' && key !== 'apiKey') payload[key] = value
  }

  const files: Record<string, Uint8Array> = {
    'jessica-backup.json': strToU8(
      JSON.stringify({ app: 'jessica', version: 3, exportedAt: Date.now(), data: payload }, null, 2),
    ),
  }

  for (const book of state.customBooks) {
    const bytes = await getPdfBytes(book.id)
    if (bytes) files[`books/${book.id}.pdf`] = bytes
  }

  const cards = await allCards()
  if (cards.length) files['flashcards.json'] = strToU8(JSON.stringify(cards))

  const zipped = zipSync(files, { level: 0 })
  return {
    blob: new Blob([zipped as BlobPart], { type: 'application/zip' }),
    name: `jessica-full-backup-${todayKey()}.zip`,
    size: zipped.byteLength,
  }
}

export async function restoreFullBackup(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const entries = unzipSync(bytes)
  const jsonEntry = entries['jessica-backup.json']
  if (!jsonEntry) throw new Error('This ZIP is not a Jessica backup.')
  const parsed = JSON.parse(strFromU8(jsonEntry)) as { data?: Record<string, unknown> }
  const data = (parsed.data || parsed) as Record<string, unknown>

  useApp.getState().importState(data as never)

  let books = 0
  for (const [path, content] of Object.entries(entries)) {
    if (path.startsWith('books/') && path.endsWith('.pdf')) {
      const id = path.slice('books/'.length, -'.pdf'.length)
      await savePdfBytes(id, content)
      books++
    }
  }

  let cards = 0
  const cardsEntry = entries['flashcards.json']
  if (cardsEntry) {
    const list = JSON.parse(strFromU8(cardsEntry))
    if (Array.isArray(list) && list.length) {
      await putCards(list)
      cards = list.length
    }
  }

  return { books, cards }
}
