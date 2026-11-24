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
      <select
        value={otherActive ? language : ''}
        onChange={(e) => e.target.value && updateSettings({ language: e.target.value as typeof language })}
        aria-label={tr('More languages')}
        className={cn(
          'chip border-line bg-card-2 font-bold text-muted',
          compact ? 'min-h-[32px] w-12 !px-2 !py-1 !text-xs' : 'min-h-[40px] w-14 !px-3 !py-2 !text-sm',
        )}
      >
        <option value="" disabled>
          …
        </option>
        {others.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
