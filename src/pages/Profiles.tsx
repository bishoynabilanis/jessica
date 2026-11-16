import { useMemo, useState } from 'react'
import { Check, Plus, Trash2, UserRound, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { createProfile, deleteProfile, readRegistry, switchProfile } from '@/lib/profiles'
import { levelLabel } from '@/lib/curriculum'
import type { GradeLevel } from '@/types'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

const GRADES: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function Profiles() {
  const name = useApp((s) => s.name)
  const curriculum = useApp((s) => s.settings.curriculum)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const pushToast = useUI((s) => s.pushToast)

  const [registry, setRegistry] = useState(() => readRegistry())
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftGrade, setDraftGrade] = useState<GradeLevel>(gradeLevel)
  const [confirming, setConfirming] = useState<string | null>(null)

  const activeSlot = useMemo(
    () => registry.slots.find((slot) => slot.id === registry.active),
    [registry],
  )

  const switchTo = (id: string) => {
    if (!switchProfile(id)) return
    window.location.reload()
  }

  const add = () => {
    if (!draftName.trim()) {
      pushToast({ title: tr('Write the child’s name first.'), type: 'info' })
      return
    }
    createProfile(draftName, draftGrade)
    setDraftName('')
    setAdding(false)
    setRegistry(readRegistry())
    pushToast({
      title: tr('{name} is on this device now', { name: draftName.trim() }),
      description: tr('Switch to them whenever you want — each child keeps a separate progress.'),
      type: 'success',
    })
  }

  const remove = (id: string) => {
    if (confirming !== id) {
      setConfirming(id)
      return
    }
    const wasActive = registry.active === id
    if (!deleteProfile(id)) {
      pushToast({ title: tr('Keep at least one profile.'), type: 'info' })
      setConfirming(null)
      return
    }
    setConfirming(null)
    if (wasActive) {
      window.location.reload()
      return
    }
    setRegistry(readRegistry())
    pushToast({ title: tr('Profile deleted'), type: 'info' })
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow={tr('Profiles')}
        title={tr('More than one child on the same device')}
        subtitle={tr('Each child keeps their own progress, streak and papers. Books and settings stay shared on this device.')}
        icon={<Users className="h-5 w-5" />}
      />

      <Card className="border-aurora-400/30 bg-gradient-to-l from-aurora-400/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-aurora-400 to-violet-neon text-lg font-black text-ink-950">
            {(name || activeSlot?.name || 'J').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-aurora-300">{tr('Current')}</p>
            <p className="truncate font-display text-sm font-extrabold text-main">{name || activeSlot?.name}</p>
            <p className="text-[10px] text-muted-2">{levelLabel(gradeLevel, curriculum)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="label text-aurora-300">{tr('Children on this device')}</p>
          <Button size="sm" variant="secondary" onClick={() => setAdding((value) => !value)} data-testid="profile-add-toggle">
            <Plus className="h-3.5 w-3.5" /> {tr('Add a child')}
          </Button>
        </div>

        {adding && (
          <div className="mt-3 space-y-2 rounded-2xl border border-line bg-card-2 p-3" data-testid="profile-form">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={tr('The child’s name')}
              aria-label={tr('The child’s name')}
              className="w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-[12px] font-bold text-main outline-none focus:border-aurora-400/50"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-2">{tr('Grade')}</span>
              <select
                value={draftGrade}
                onChange={(event) => setDraftGrade(Number(event.target.value) as GradeLevel)}
                aria-label={tr('Grade')}
                className="rounded-xl border border-line bg-white/5 px-2 py-1.5 text-[11px] font-bold text-main outline-none focus:border-aurora-400/50"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade} className="bg-ink-900">
                    {levelLabel(grade, curriculum)}
                  </option>
                ))}
              </select>
            </div>
            <Button size="sm" onClick={add} data-testid="profile-add-save">
              <Check className="h-3.5 w-3.5" /> {tr('Add')}
            </Button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {registry.slots.map((slot, index) => {
            const isActive = slot.id === registry.active
            return (
              <div
                key={slot.id}
                className={cn(
                  'flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5',
                  isActive ? 'border-aurora-400/40 bg-aurora-400/10' : 'border-line bg-card-2',
                )}
                data-testid="profile-row"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 text-[12px] font-bold text-muted">
                  {isActive ? <UserRound className="h-4 w-4 text-aurora-300" /> : num(index + 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-extrabold text-main">{slot.name}</p>
                  <p className="text-[9px] text-muted-2">{levelLabel(slot.grade as GradeLevel, curriculum)}</p>
                </div>
                {isActive ? (
                  <span className="rounded-full border border-aurora-400/40 px-2 py-0.5 text-[9px] font-bold text-aurora-200">
                    {tr('Current')}
                  </span>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => switchTo(slot.id)} data-testid="profile-switch">
                    {tr('Switch')}
                  </Button>
                )}
                {registry.slots.length > 1 && (
                  <button
                    onClick={() => remove(slot.id)}
                    aria-label={tr('Delete')}
                    data-testid="profile-delete"
                    className={cn(
                      'rounded-lg border p-1.5 transition',
                      confirming === slot.id
                        ? 'border-red-400/60 bg-red-400/10 text-red-200'
                        : 'border-line text-muted-2 hover:border-red-400/40 hover:text-red-300',
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {confirming && (
          <p className="mt-2 rounded-xl border border-red-400/30 bg-red-400/5 px-3 py-2 text-[10px] font-bold text-red-200">
            {tr('Press delete again to remove this profile and its progress from this device.')}
          </p>
        )}
      </Card>

      <Card className="p-4">
        <p className="text-[11px] leading-relaxed text-muted">
          {tr('Everything stays on this device. Switching reloads the app so the whole screen belongs to the other child — books and settings are shared, progress is not.')}
        </p>
      </Card>
    </div>
  )
}
