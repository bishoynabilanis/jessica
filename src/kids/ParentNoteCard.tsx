import { useApp } from '@/store/useApp'
import { tr } from '@/i18n'
import { safeParentNote } from '@/lib/parentNote'

/** A short line from a parent, shown to the child. Plain text, stored on this device only. */
export function ParentNoteCard() {
  const raw = useApp((s) => s.parentNote)
  const note = safeParentNote(raw)
  if (!note) return null
  return (
    <div className="rounded-[28px] border-2 border-rose-200 bg-rose-50/80 p-4 text-center" data-testid="parent-note-card">
      <p className="text-3xl">💌</p>
      <p className="mt-1 text-sm font-extrabold text-rose-700">{tr('A note from your grown-up')}</p>
      <p dir="auto" className="mt-1.5 break-words font-display text-lg font-extrabold leading-snug text-ink-950">
        {note.text}
      </p>
    </div>
  )
}
