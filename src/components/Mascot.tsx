import { useId } from 'react'
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
  const rawId = useId().replace(/:/g, '')
  const bodyGrad = `body-${rawId}`
  const auraGrad = `aura-${rawId}`
  const shine = `shine-${rawId}`
  const { current, index } = mascotForXp(xp)
  const aura = current.aura

  const lookEmoji: Record<string, string> = {
    classic: '✨',
    scholar: '🎓',
    cool: '😎',
    crown: '👑',
    medal: '🏅',
    wizard: '🧙',
  }
  const accessory = lookEmoji[look || 'classic'] || '✨'

  const eyes = (() => {
    switch (mood) {
      case 'thinking':
        return (
          <>
            <ellipse cx="87" cy="106" rx="7" ry="8.5" fill="#0b1220" />
            <ellipse cx="133" cy="106" rx="7" ry="8.5" fill="#0b1220" />
            <circle cx="89" cy="103" r="2.6" fill="#fff" />
            <circle cx="135" cy="103" r="2.6" fill="#fff" />
            <path d="M78 92 Q88 87 97 91" stroke="#0b1220" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M123 88 Q133 84 143 89" stroke="#0b1220" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )
      case 'celebrate':
        return (
          <>
            <path d="M78 107 Q87 96 96 107" stroke="#0b1220" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M124 107 Q133 96 142 107" stroke="#0b1220" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        )
      case 'sleepy':
        return (
          <>
            <path d="M78 105 Q87 111 96 105" stroke="#0b1220" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            <path d="M124 105 Q133 111 142 105" stroke="#0b1220" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          </>
        )
      case 'proud':
        return (
          <>
            <path d="M87 96 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#0b1220" />
            <path d="M133 96 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#0b1220" />
          </>
        )
      case 'curious':
        return (
          <>
            <circle cx="87" cy="106" r="10" fill="#0b1220" />
            <circle cx="133" cy="106" r="10" fill="#0b1220" />
            <circle cx="90" cy="102" r="3.4" fill="#fff" />
            <circle cx="136" cy="102" r="3.4" fill="#fff" />
            <path d="M77 88 Q87 82 98 88" stroke="#0b1220" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M122 92 Q133 89 144 93" stroke="#0b1220" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )
      default:
        return (
          <>
            <ellipse cx="87" cy="106" rx="8.5" ry="10" fill="#0b1220" />
            <ellipse cx="133" cy="106" rx="8.5" ry="10" fill="#0b1220" />
            <circle cx="90" cy="102" r="3" fill="#fff" />
            <circle cx="136" cy="102" r="3" fill="#fff" />
          </>
        )
    }
  })()

  const mouth = (() => {
    if (mood === 'celebrate')
      return (
        <>
          <path d="M98 128 Q110 145 122 128 Z" fill="#0b1220" />
          <path d="M104 136 Q110 142 116 136 Q110 139 104 136Z" fill="#ff7a8a" />
        </>
      )
    if (mood === 'thinking') return <ellipse cx="110" cy="133" rx="6" ry="7.5" fill="#0b1220" />
    if (mood === 'sleepy') return <path d="M102 133 Q110 129 118 133" stroke="#0b1220" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    if (mood === 'curious') return <circle cx="110" cy="133" r="5" fill="#0b1220" />
    return <path d="M97 128 Q110 140 123 128" stroke="#0b1220" strokeWidth="4" fill="none" strokeLinecap="round" />
  })()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      className={cn(animate && 'animate-float', className)}
      role="img"
      aria-label={`${current.name} mascot, ${mood}`}
    >
      <defs>
        <linearGradient id={bodyGrad} x1="60" y1="50" x2="170" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor={aura} />
          <stop offset="0.55" stopColor={aura} stopOpacity="0.85" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id={auraGrad} cx="0.5" cy="0.45" r="0.5">
          <stop stopColor={aura} stopOpacity="0.34" />
          <stop offset="1" stopColor={aura} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={shine} cx="0.32" cy="0.2" r="0.6">
          <stop stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {showAura && <circle cx="110" cy="108" r="100" fill={`url(#${auraGrad})`} />}
      <ellipse cx="110" cy="198" rx="52" ry="9" fill="#000" opacity="0.28" />

      {/* stage accessories behind body */}
      {index === 2 && (
        <>
          <path d="M58 62 L44 22 L88 48 Z" fill={aura} opacity="0.9" />
          <path d="M162 62 L176 22 L132 48 Z" fill={aura} opacity="0.9" />
          <path d="M62 56 L53 34 L79 48 Z" fill="#fff" opacity="0.28" />
          <path d="M158 56 L167 34 L141 48 Z" fill="#fff" opacity="0.28" />
        </>
      )}
      {index === 3 && (
        <>
          <path d="M52 104 Q16 78 24 128 Q38 132 56 124 Z" fill={aura} opacity="0.5" />
          <path d="M168 104 Q204 78 196 128 Q182 132 164 124 Z" fill={aura} opacity="0.5" />
        </>
      )}
      {index === 4 && (
        <>
          <path d="M72 46 Q64 16 86 30 L94 48 Z" fill="#ffd166" />
          <path d="M148 46 Q156 16 134 30 L126 48 Z" fill="#ffd166" />
        </>
      )}
      {index === 5 && (
        <>
          <path d="M110 10 L121 38 L105 46 L99 34 Z" fill="#ffd166" />
          <circle cx="110" cy="14" r="4" fill="#fff" />
        </>
      )}

      {/* body */}
      <path
        d="M110 32c38 0 68 26 68 66 0 48-29 82-68 82s-68-34-68-82c0-40 30-66 68-66z"
        fill={`url(#${bodyGrad})`}
      />
      <path
        d="M110 32c38 0 68 26 68 66 0 48-29 82-68 82s-68-34-68-82c0-40 30-66 68-66z"
        fill={`url(#${shine})`}
      />
      <ellipse cx="75" cy="80" rx="18" ry="11" fill="#fff" opacity="0.28" transform="rotate(-24 75 80)" />

      {/* sprout / sparkle for early stages */}
      {index === 0 && (
        <>
          <path d="M110 34 Q108 16 96 12" stroke="#21e6c9" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 18 Q78 8 78 26 Q92 34 100 18Z" fill="#54f7db" />
          <path d="M104 26 Q124 16 126 32 Q114 38 104 26Z" fill="#93ffe9" />
        </>
      )}
      {index === 1 && (
        <>
          <path d="M110 14 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5z" fill="#ffd166" />
          <circle cx="148" cy="32" r="3" fill="#fff" opacity="0.8" />
          <circle cx="72" cy="46" r="2.4" fill="#fff" opacity="0.7" />
        </>
      )}

      {/* face */}
      <ellipse cx="76" cy="123" rx="10" ry="5.5" fill="#ff7a8a" opacity="0.4" />
      <ellipse cx="144" cy="123" rx="10" ry="5.5" fill="#ff7a8a" opacity="0.4" />
      {eyes}
      {mouth}

      {mood === 'thinking' && (
        <>
          <circle cx="170" cy="66" r="4" fill="#fff" opacity="0.6" />
          <circle cx="182" cy="52" r="6" fill="#fff" opacity="0.45" />
          <circle cx="198" cy="34" r="9" fill="#fff" opacity="0.28" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <text x="166" y="62" fill="#fff" opacity="0.7" fontSize="17" fontWeight="800">z</text>
          <text x="184" y="44" fill="#fff" opacity="0.5" fontSize="12" fontWeight="800">z</text>
        </>
      )}

      {/* cosmetic badge */}
      <g transform="translate(160 34)">
        <circle cx="18" cy="18" r="19" fill="#0b1220" opacity="0.55" />
        <text x="18" y="26" textAnchor="middle" fontSize="22">{accessory}</text>
      </g>
    </svg>
  )
}
