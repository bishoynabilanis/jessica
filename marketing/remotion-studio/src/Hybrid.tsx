import type { CSSProperties } from 'react'
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
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

const CARD = { left: 130, top: 330, width: 820, height: 1458 }

const Title = ({ frame, from, to }: { frame: number; from: number; to: number }) => {
  const { fps } = useVideoConfig()
  const enter = spring({ frame: frame - from, fps, config: { damping: 18, mass: 0.8 } })
  const exit = interpolate(frame, [to - 12, to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: 96,
        textAlign: 'center',
        direction: 'rtl',
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 34}px)`,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 8, color: '#7f8db0', marginBottom: 16 }}>
        JESSICA
      </div>
      <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.3, color: '#f4f7ff' }}>
        {from === 0 && (
          <>
            ٣٩ معملاً.
            <br />
            <span style={{ color: mint }}>على جهازك.</span>
          </>
        )}
        {from === 165 && (
          <>
            حرّك الشمس.
            <br />
            <span style={{ color: sun }}>وشوف المطر.</span>
          </>
        )}
        {from === 390 && (
          <>
            ومن العلوم
            <br />
            <span style={{ color: violet }}>للبرمجة.</span>
          </>
        )}
      </div>
    </div>
  )
}

const Callout = ({
  frame,
  from,
  to,
  style,
  title,
  sub,
  arrow,
}: {
  frame: number
  from: number
  to: number
  style: CSSProperties
  title: string
  sub: string
  arrow: string
}) => {
  const { fps } = useVideoConfig()
  const enter = spring({ frame: frame - from, fps, config: { damping: 15 } })
  const exit = interpolate(frame, [to - 10, to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * 20}px) scale(${0.94 + enter * 0.06})`,
        border: '1px solid rgba(33,230,201,.45)',
        background: 'rgba(8,13,26,.94)',
        borderRadius: 22,
        padding: '16px 22px',
        direction: 'rtl',
        boxShadow: '0 18px 50px rgba(0,0,0,.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <span style={{ fontSize: 34, color: mint, fontWeight: 900 }}>{arrow}</span>
      <span>
        <span style={{ display: 'block', fontSize: 30, fontWeight: 900, color: '#fff' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: '#9fb2d8', marginTop: 2 }}>
          {sub}
        </span>
      </span>
    </div>
  )
}

export const Hybrid = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const cardIn = spring({ frame, fps, config: { damping: 20, mass: 0.9 } })
  const zoom = 1
  const endIn = interpolate(frame, [548, 575], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const progress = frame / durationInFrames

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ink,
        fontFamily: 'Cairo, system-ui, sans-serif',
        color: '#f4f7ff',
        overflow: 'hidden',
      }}
    >
      <style>{`@font-face { font-family: Cairo; src: url(${staticFile('Cairo.ttf')}) format('truetype'); }`}</style>

      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 760px at 92% -4%, rgba(107,140,255,.28), transparent 62%),
            radial-gradient(900px 760px at 0% 104%, rgba(33,230,201,.20), transparent 62%),
            linear-gradient(165deg, #05080f, #0a1020 58%, #0b1428)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(760px 760px at 50% 42%, #000 22%, transparent 84%)',
          WebkitMaskImage: 'radial-gradient(760px 760px at 50% 42%, #000 22%, transparent 84%)',
        }}
      />

      <Title frame={frame} from={0} to={165} />
      <Title frame={frame} from={165} to={390} />
      <Title frame={frame} from={390} to={548} />

      <div
        style={{
          position: 'absolute',
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          height: CARD.height,
          borderRadius: 40,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.12)',
          background: '#05080f',
          boxShadow: '0 40px 120px rgba(0,0,0,.55), 0 0 0 1px rgba(33,230,201,.06)',
          transform: `scale(${0.94 + cardIn * 0.06})`,
          opacity: cardIn,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: '50% 0%',
          }}
        >
          <OffthreadVideo
            src={staticFile('screen.mp4')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        </div>

        <Callout
          frame={frame}
          from={410}
          to={540}
          arrow="↘"
          title="الحرف إيه = ٦٥"
          sub="64 + 1 في النظام الثنائي"
          style={{ left: 24, top: 620 }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 130,
          right: 130,
          bottom: 64,
          height: 5,
          borderRadius: 999,
          background: 'rgba(255,255,255,.10)',
          overflow: 'hidden',
          direction: 'ltr',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${mint}, ${violet})`,
          }}
        />
      </div>

      <AbsoluteFill
        style={{
          opacity: endIn,
          background: `radial-gradient(800px 700px at 88% 0%, rgba(107,140,255,.35), transparent 60%),
            radial-gradient(800px 700px at 0% 100%, rgba(33,230,201,.22), transparent 60%),
            linear-gradient(165deg, #05080f, #0a1020 60%, #0b1428)`,
          color: '#f4f7ff',
          alignItems: 'center',
          justifyContent: 'center',
          direction: 'rtl',
          textAlign: 'center',
          padding: 60,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 44,
            background: `linear-gradient(135deg, ${mint}, ${violet})`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 82,
            fontWeight: 900,
            color: '#061018',
            transform: `scale(${0.8 + endIn * 0.2})`,
          }}
        >
          J
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, marginTop: 34 }}>جرّبها بنفسك</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#b9c7e4', marginTop: 12, lineHeight: 1.7 }}>
          ابدأ بكتاب واحد…
          <br />
          وكل حاجة على جهازك
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          {['مجاني', 'أوفلاين', 'بدون حساب'].map((chip) => (
            <span
              key={chip}
              style={{
                border: '1px solid rgba(33,230,201,.4)',
                background: 'rgba(33,230,201,.12)',
                color: '#8ff5e4',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 30, fontSize: 24, fontWeight: 800, color: mint, direction: 'ltr' }}>
          bishoynabilanis.github.io/jessica
        </div>
      </AbsoluteFill>

      <Audio src={staticFile('music.m4a')} volume={0.18} startFrom={0} endAt={22} />
    </AbsoluteFill>
  )
}
