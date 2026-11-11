import { cn } from '@/lib/utils'
import { mascotForXp } from '@/data/mascots'

export type MascotMood = 'happy' | 'thinking' | 'celebrate' | 'sleepy' | 'proud' | 'curious'

export function moodFromText(text: string): MascotMood {
  const t = text.toLowerCase()
  if (/congrat|great job|excellent|perfect|well done|🎉|amazing|أحسنت|ممتاز|برافو/.test(t)) return 'celebrate'
  if (/\?|why|how|think|hmm|let's|question|سؤال|لماذا|كيف/.test(t)) return 'thinking'
  if (/careful|remember|note that|important|انتبه|تذكر/.test(t)) return 'curious'
  if (/try again|mistake|not quite|doesn't|خطأ/.test(t)) return 'sleepy'
  return 'happy'
}

const LOOK_EMOJI: Record<string, string> = {
  classic: '✨',
  scholar: '🎓',
  cool: '😎',
  crown: '👑',
  medal: '🏅',
  wizard: '🧙',
}

/**
 * Jessica's companion. The animated seed was replaced by the illustrated
 * character portrait, with a soft aura that changes with XP stage.
 */
export function Mascot({
  xp = 0,
  mood = 'happy',
  size = 120,
  look,
  className,
  animate = true,
  showAura = true,
}: {
  xp?: number
  mood?: MascotMood
  size?: number
  look?: string
  className?: string
  animate?: boolean
  showAura?: boolean
}) {
  const { current } = mascotForXp(xp)
  const accessory = LOOK_EMOJI[look || 'classic'] || '✨'

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', animate && 'animate-float', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${current.name} mascot, ${mood}`}
    >
      {showAura && (
        <span
          aria-hidden
          className="absolute inset-2 rounded-full opacity-70 blur-xl"
          style={{ background: `radial-gradient(circle at 50% 62%, ${current.aura}66, transparent 70%)` }}
        />
      )}
      <img
        src={`${import.meta.env.BASE_URL}mascot/${size <= 80 ? 'jessica-face.png' : 'jessica-avatar.png'}`}
        alt=""
        draggable={false}
        className="relative h-full w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]"
      />
      {look && look !== 'classic' && (
        <span className="absolute -bottom-0.5 -end-0.5 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-ink-950/80 text-sm shadow-lg">
          {accessory}
        </span>
      )}
    </span>
  )
}
