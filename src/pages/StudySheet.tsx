import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, ShieldCheck, Share2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp, weekLog } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { readAttempts } from '@/lib/bankHistory'
import { levelLabel } from '@/lib/curriculum'
import {
  buildStudySheet,
  canvasToFile,
  drawStudySheet,
  saveSheetFile,
  shareSheetFile,
  type SheetLabels,
} from '@/lib/studySheet'
import { dateLocale, num, tr } from '@/i18n'

export function StudySheet() {
  const state = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [showName, setShowName] = useState(false)
  const [url, setUrl] = useState('')
  const rtl = document.documentElement.dir === 'rtl'

  const sheet = useMemo(() => {
    const days = weekLog(state)
    return buildStudySheet({
      days,
      topicLog: state.topicLog,
      skillStats: state.skillStats,
      mistakes: state.mistakes,
      attempts: readAttempts(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.dailyLog, state.topicLog, state.skillStats, state.mistakes])

  const labels: SheetLabels = useMemo(() => {
    const fmt = (date: string) =>
      new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long' })
    return {
      title: tr('Weekly study sheet'),
      range: `${fmt(sheet.from)} – ${fmt(sheet.to)}`,
      name: showName ? state.name || undefined : undefined,
      grade: levelLabel(state.settings.gradeLevel, state.settings.curriculum),
      minutes: tr('Minutes studied'),
      activeDays: tr('Active days'),
      topicsDone: tr('Topics finished'),
      studied: tr('What I studied this week'),
      nothingYet: tr('No finished topics yet. A new week starts today.'),
      tests:
        sheet.testAverage === null
          ? ''
          : tr('{n} practice tests, average {avg}%', { n: num(sheet.tests), avg: num(sheet.testAverage) }),
      revisit: tr('To revisit next week'),
      revisitDue: tr('Mistakes ready to review: {n}', { n: num(sheet.dueMistakes) }),
      noRevisit: tr('Nothing to catch up on. Keep going.'),
      privacy: tr('Made on this device from what was done in the app. Nothing was uploaded.'),
      rtl,
    }
  }, [sheet, showName, state.name, state.settings.gradeLevel, state.settings.curriculum, rtl])

  useEffect(() => {
    let alive = true
    const timer = window.setTimeout(() => {
      const canvas = drawStudySheet(sheet, labels)
      if (alive) setUrl(canvas.toDataURL('image/png'))
    }, 50)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [sheet, labels])

  const make = async () => canvasToFile(drawStudySheet(sheet, labels))

  const share = async () => {
    const file = await make()
    if (!file) return
    const outcome = await shareSheetFile(file, labels.title)
    if (outcome === 'downloaded') pushToast({ title: tr('Sheet saved as an image'), type: 'success' })
    if (outcome === 'cancelled') pushToast({ title: tr('Sharing cancelled'), type: 'info' })
  }

  const save = async () => {
    const file = await make()
    if (!file) return
    saveSheetFile(file)
    pushToast({ title: tr('Sheet saved as an image'), type: 'success' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back
        eyebrow={tr('Parent report')}
        title={tr('Weekly study sheet')}
        subtitle={tr('One page with what was really studied this week. It is built and kept on this device only.')}
        icon={<FileText className="h-5 w-5" />}
      />

      <Card className="flex items-start gap-3 border-aurora-400/25 bg-aurora-400/5 p-4" data-testid="sheet-privacy">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-aurora-300" aria-hidden />
        <p className="text-[12px] leading-relaxed text-main" dir="auto">
          {tr('No account, no tracking, no server. The sheet is drawn on this device. It leaves the device only if you press Share, and then you choose who gets it.')}
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[12px] font-bold text-main">
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
            data-testid="sheet-name"
            className="h-4 w-4"
          />
          {tr('Put the child’s name on the sheet')}
        </label>
        <div className="ms-auto flex gap-2">
          <Button size="sm" onClick={share} data-testid="sheet-share">
            <Share2 className="h-3.5 w-3.5" /> {tr('Share the sheet')}
          </Button>
          <Button size="sm" variant="secondary" onClick={save} data-testid="sheet-save">
            <Download className="h-3.5 w-3.5" /> {tr('Save image')}
          </Button>
        </div>
      </div>

      <Card className="mx-auto max-w-xl overflow-hidden p-2">
        {url && <img src={url} alt={tr('Weekly study sheet')} className="w-full rounded-xl" data-testid="sheet-image" />}
      </Card>
    </div>
  )
}
