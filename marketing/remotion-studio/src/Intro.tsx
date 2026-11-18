import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const mint = '#21e6c9'
const violet = '#6b8cff'
const sun = '#ffd166'
const ink = '#05080f'

const chips = ['أوفلاين', 'بدون حساب', 'من الصف ١ لـ٩']

export const Intro = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logo = spring({ frame, fps, config: { damping: 13, mass: 0.7 } })
  const title = spring({ frame: frame - 12, fps, config: { damping: 16, mass: 0.8 } })
  const subtitle = spring({ frame: frame - 30, fps, config: { damping: 18 } })
  const glow = interpolate(frame, [0, 90], [0.35, 0.85], { extrapolateRight: 'clamp' })
  const line = interpolate(frame, [10, 140], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ink,
        color: '#f4f7ff',
        fontFamily: 'Cairo, system-ui, sans-serif',
        direction: 'rtl',
        overflow: 'hidden',
      }}
    >
      <style>{`@font-face { font-family: Cairo; src: url(${staticFile('Cairo.ttf')}) format('truetype'); }`}</style>

      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 760px at 88% 4%, rgba(107,140,255,${0.35 * glow}), transparent 62%),
            radial-gradient(900px 760px at 0% 100%, rgba(33,230,201,${0.28 * glow}), transparent 62%),
            linear-gradient(165deg, #05080f, #0a1020 58%, #0b1428)`,
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(700px 700px at 50% 45%, #000 20%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(700px 700px at 50% 45%, #000 20%, transparent 82%)',
        }}
      />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: 54,
            background: `linear-gradient(135deg, ${mint}, ${violet})`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 104,
            fontWeight: 900,
            color: '#061018',
            transform: `scale(${logo})`,
            boxShadow: `0 30px 80px rgba(33,230,201,${0.25 * logo})`,
          }}
        >
          J
        </div>

        <div
          style={{
            marginTop: 74,
            textAlign: 'center',
            transform: `translateY(${(1 - title) * 46}px)`,
            opacity: title,
          }}
        >
          <div style={{ fontSize: 122, fontWeight: 900, lineHeight: 1.15, color: mint }}>
            ٣٩ معملاً
          </div>
          <div style={{ fontSize: 122, fontWeight: 900, lineHeight: 1.15 }}>
            على جهازك.
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 42,
            fontWeight: 700,
            color: '#aebbdb',
            opacity: subtitle,
            transform: `translateY(${(1 - subtitle) * 26}px)`,
            textAlign: 'center',
          }}
        >
          تجربة حقيقية لكل درس، من غير إنترنت.
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 54 }}>
          {chips.map((chip, index) => {
            const pop = spring({ frame: frame - 44 - index * 7, fps, config: { damping: 15 } })
            return (
              <div
                key={chip}
                style={{
                  opacity: pop,
                  transform: `translateY(${(1 - pop) * 22}px) scale(${0.9 + pop * 0.1})`,
                  border: `1px solid rgba(33,230,201,${0.32 + index * 0.06})`,
                  background: 'rgba(33,230,201,.10)',
                  color: index === 2 ? sun : '#8ff5e4',
                  borderRadius: 999,
                  padding: '16px 30px',
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                {chip}
              </div>
            )
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 150,
            width: 620,
            height: 4,
            borderRadius: 999,
            background: 'rgba(255,255,255,.10)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${line * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${mint}, ${violet})`,
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 92,
            fontSize: 26,
            fontWeight: 800,
            color: '#7f8db0',
            letterSpacing: 6,
          }}
        >
          JESSICA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
