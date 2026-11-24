import { Globe } from 'lucide-react'
import { UI_LANGUAGES, tr } from '@/i18n'
import { useApp } from '@/store/useApp'
import { cn } from '@/lib/utils'

/** Arabic and English as one-tap pills, every other language in a small menu. */
export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const language = useApp((s) => s.settings.language)
  const updateSettings = useApp((s) => s.updateSettings)
  const main = UI_LANGUAGES.filter((item) => item.id === 'ar' || item.id === 'en')
  const others = UI_LANGUAGES.filter((item) => item.id !== 'ar' && item.id !== 'en')
  const otherActive = others.some((item) => item.id === language)

  return (
    <div className="flex min-w-0 items-center gap-1.5" role="group" aria-label={tr('Switch language')} dir="ltr">
      {main.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => updateSettings({ language: item.id })}
          aria-pressed={language === item.id}
          className={cn(
            'chip font-bold',
            compact ? 'min-h-[32px] !px-3 !py-1 !text-xs' : 'min-h-[40px] !px-3.5 !py-2 !text-sm',
            language === item.id
              ? 'border-aurora-400/60 bg-aurora-400/25 text-aurora-100'
              : 'border-line bg-card-2 text-muted hover:text-main',
          )}
        >
          {item.label}
        </button>
      ))}
      <label
        className={cn(
          'chip relative inline-flex items-center justify-center gap-1 font-bold',
          compact ? 'min-h-[32px] !px-2.5 !py-1 !text-xs' : 'min-h-[40px] !px-3 !py-2 !text-sm',
          otherActive
            ? 'border-aurora-400/60 bg-aurora-400/25 text-aurora-100'
            : 'border-line bg-card-2 text-muted',
        )}
      >
        <Globe className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
        {otherActive ? <span>{others.find((item) => item.id === language)?.label}</span> : null}
        <select
          value={otherActive ? language : ''}
          onChange={(e) => e.target.value && updateSettings({ language: e.target.value as typeof language })}
          aria-label={tr('More languages')}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="" disabled>
            {tr('More languages')}
          </option>
          {others.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
