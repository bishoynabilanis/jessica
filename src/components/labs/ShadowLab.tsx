import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function ShadowLab({ onInteract }: { onInteract: () => void }) {
  const [elevation, setElevation] = useState(45)
  const rad = (elevation * Math.PI) / 180
  const shadow = 1 / Math.tan(rad)
  const stickX = 90
  const groundY = 172
  const stickTop = 118
  const shadowPx = Math.min(160, shadow * 55)
  const sunX = stickX - Math.cos(rad) * 130
  const sunY = groundY - Math.sin(rad) * 130

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sun">{tr('Shadow lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Move the sun')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-sun" dir="ltr" data-testid="shadow-length">
              {shadow.toFixed(1)} m
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#102444] to-[#0b1220] p-2">
              <svg viewBox="0 0 300 200" className="h-[210px] w-full" role="img" aria-label={tr('Stick and its shadow')} data-testid="shadow-svg">
                <defs>
                  <linearGradient id="shadowFade" x1="0" x2="1">
                    <stop offset="0%" stopColor="#020617" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <line x1="10" y1={groundY} x2="290" y2={groundY} stroke="#33405c" strokeWidth="4" />
                <circle cx={sunX} cy={sunY} r="16" fill="#ffd166" opacity="0.9" />
                {Array.from({ length: 10 }).map((_, index) => (
                  <line
                    key={index}
                    x1={sunX}
                    y1={sunY}
                    x2={sunX + Math.cos(rad + (index - 5) * 0.06) * 40}
                    y2={sunY + Math.sin(rad + (index - 5) * 0.06) * 40}
                    stroke="#ffd166"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                ))}
                <polygon points={`${stickX},${groundY} ${stickX + shadowPx},${groundY} ${stickX},${stickTop}`} fill="url(#shadowFade)" />
                <line x1={stickX} y1={groundY} x2={stickX} y2={stickTop} stroke="#21e6c9" strokeWidth="5" strokeLinecap="round" />
                <circle cx={stickX} cy={stickTop} r="4" fill="#21e6c9" />
                <line x1={sunX} y1={sunY} x2={stickX} y2={stickTop} stroke="#ffd166" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <text x={stickX + shadowPx / 2} y={groundY - 8} textAnchor="middle" fill="#8fa3c8" fontSize="9" fontWeight="700">
                  {shadow.toFixed(1)} m
                </text>
                <line x1="250" y1={groundY} x2="250" y2={groundY - 54} stroke="#8fa3c8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="244" y={groundY - 28} textAnchor="end" fill="#8fa3c8" fontSize="9" fontWeight="700">
                  1 m
                </text>
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Sun height')} value={`${elevation}°`} testid="shadow-angle" />
              <LabStat label={tr('Shadow')} value={`${shadow.toFixed(1)} m`} testid="shadow-value" />
              <LabStat label={tr('Length')} value={shadow >= 2.5 ? tr('Long') : shadow >= 1 ? tr('Medium') : tr('Short')} />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Sun height')} value={elevation} min={15} max={85} step={5} unit="°" onChange={(value) => { onInteract(); setElevation(value) }} testid="shadow-slider" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('The stick is one metre tall. When the sun is low, its rays come in sideways and the shadow stretches.')}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('At 45° the shadow is about the same as the object. At 15° it is nearly four times longer.')}
            </div>
            <LabChallenge done={shadow >= 2.5}>{tr('Make the shadow at least 2.5 metres long.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Link the height of the sun with the length of a shadow.')}
        question={tr('When is your shadow longest?')}
        options={[tr('At noon'), tr('Early morning'), tr('Never')]}
        correct={1}
        explanation={tr('The sun is low early and late in the day, so its rays stretch the shadow out.')}
      />
    </>
  )
}
