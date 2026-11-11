import { Accessibility, Bell, Check, MoonStar, Sun, Type, Zap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { requestNotificationPermission } from '@/hooks/usePlatform'
import { tr } from '@/i18n'

export function QuickPanel() {
  const open = useUI((s) => s.quickPanel)
  const toggleQuickPanel = useUI((s) => s.toggleQuickPanel)
  const pushToast = useUI((s) => s.pushToast)
  const { settings, updateSettings } = useApp()

  return (
    <Modal
      open={open}
      onClose={() => toggleQuickPanel(false)}
      title={tr("Comfort & accessibility")}
      subtitle={tr("Tune Jessica to your eyes, your focus and your learning style.")}
      icon={<Accessibility className="h-4.5 w-4.5" />}
      size="sm"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`rounded-2xl border p-3 text-left transition ${settings.theme === 'dark' ? 'border-aurora-400/50 bg-aurora-400/10' : 'border-line bg-card-2'}`}
          >
            <MoonStar className="mb-2 h-4 w-4 text-violet-glow" />
            <p className="text-xs font-bold text-main">{tr('Midnight')}</p>
            <p className="text-[10px] text-muted">{tr('Focus after sunset')}</p>
          </button>
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`rounded-2xl border p-3 text-left transition ${settings.theme === 'light' ? 'border-aurora-400/50 bg-aurora-400/10' : 'border-line bg-card-2'}`}
          >
            <Sun className="mb-2 h-4 w-4 text-sun" />
            <p className="text-xs font-bold text-main">{tr('Daylight')}</p>
            <p className="text-[10px] text-muted">{tr('Soft and bright')}</p>
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label flex items-center gap-1.5"><Type className="h-3 w-3" /> {tr('Text size')}</span>
            <span className="text-[11px] font-bold text-aurora-300">{settings.textScale}%</span>
          </div>
          <input
            type="range"
            min={90}
            max={135}
            step={5}
            value={settings.textScale}
            onChange={(e) => updateSettings({ textScale: Number(e.target.value) })}
            className="range-jessica w-full"
          />
          <p className="mt-2 text-xs text-muted" style={{ fontSize: `${Math.min(1.15, settings.textScale / 100)}rem` }}>
            {tr("The Nile flows through Cairo. · النيل يجري في القاهرة.")}
          </p>
        </div>

        <div className="space-y-1 border-t border-line pt-3">
          <Toggle
            checked={settings.dyslexiaFont}
            onChange={(v) => updateSettings({ dyslexiaFont: v })}
            label={tr("Dyslexia-friendly font")}
            description={tr("Switch to Atkinson Hyperlegible everywhere.")}
            icon={<Type className="h-4 w-4" />}
          />
          <Toggle
            checked={settings.reduceMotion}
            onChange={(v) => updateSettings({ reduceMotion: v })}
            label={tr("Reduce motion")}
            description={tr("Calmer animations for focus or sensitivity.")}
            icon={<Zap className="h-4 w-4" />}
          />
          <Toggle
            checked={settings.autoSpeak}
            onChange={(v) => updateSettings({ autoSpeak: v })}
            label={tr("Read answers aloud")}
            description={tr("The tutor speaks each reply automatically.")}
            icon={<Bell className="h-4 w-4" />}
          />
        </div>

        <div className="rounded-2xl border border-line bg-card-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="label">{tr('Speaking speed')}</span>
            <span className="text-[11px] font-bold text-aurora-300">{settings.ttsRate.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.05}
            value={settings.ttsRate}
            onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })}
            className="range-jessica w-full"
          />
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={async () => {
            const permission = await requestNotificationPermission()
            updateSettings({ notifications: permission === 'granted' })
            pushToast({
              title: permission === 'granted' ? tr('Reminders enabled') : tr('Notifications not enabled'),
              description:
                permission === 'granted'
                  ? tr('A riddle will greet you every afternoon at 4 PM.')
                  : tr('You can enable notifications later from Settings.'),
              type: permission === 'granted' ? 'success' : 'info',
            })
          }}
        >
          <Bell className="h-4 w-4" />
          {settings.notifications ? tr('Daily reminders are on') : tr('Enable daily 4 PM riddle')}
          {settings.notifications && <Check className="h-4 w-4 text-aurora-300" />}
        </Button>
        <p className="text-center text-[10px] leading-relaxed text-muted-2">
          {tr('Jessica is fully client-side. Your settings live on this device only.')}
        </p>
      </div>
    </Modal>
  )
}
