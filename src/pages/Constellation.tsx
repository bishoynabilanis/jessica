import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LibraryBig, Orbit, Sparkles, Star, Zap } from 'lucide-react'
import { subjectMeta } from '@/data/books'
import { useApp } from '@/store/useApp'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

const W = 820
const H = 640

export function Constellation() {
  const navigate = useNavigate()
  const completed = useApp((s) => s.completedTopics)
  const customBooks = useApp((s) => s.customBooks)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const [selected, setSelected] = useState('')

  const nodes = useMemo(() => {
    const gradeBooks = customBooks.filter((b) => (b.grade ?? gradeLevel) === gradeLevel)
    const groups = new Map<string, typeof gradeBooks>()
    for (const book of gradeBooks) {
      groups.set(book.subject, [...(groups.get(book.subject) || []), book])
    }

    const entries = [...groups.entries()]
    return entries.map(([subject, books], index) => {
      const meta = subjectMeta[subject] || { emoji: '📚', color: '#21e6c9' }
      const angle = (index / Math.max(1, entries.length)) * Math.PI * 2 - Math.PI / 2
      const cx = W / 2 + Math.cos(angle) * (entries.length > 1 ? 250 : 0)
      const cy = H / 2 + Math.sin(angle) * (entries.length > 1 ? 190 : 0)

      const chapters = books.flatMap((book) =>
        (book.units || []).map((unit) => ({
          id: `${book.id}:${unit.id}`,
          title: unit.title,
          blurb: `${book.title} · ${tr('page')} ${unit.startPage}`,
          bookId: book.id,
        })),
      )

      const chapterNodes = chapters.map((chapter, i) => {
        const a = (i / Math.max(1, chapters.length)) * Math.PI * 2 - Math.PI / 2
        const radius = 64
        return {
          ...chapter,
          done: completed.includes(chapter.id),
          x: cx + Math.cos(a) * radius,
          y: cy + Math.sin(a) * radius,
        }
      })

      return {
        id: subject,
        label: subject,
        emoji: meta.emoji,
        color: meta.color,
        cx,
        cy,
        chapters: chapterNodes,
        done: chapterNodes.filter((c) => c.done).length,
      }
    })
  }, [customBooks, gradeLevel, completed])

  const active = nodes.find((n) => n.id === selected) || nodes[0]
  const total = nodes.reduce((sum, n) => sum + n.chapters.length, 0)
  const done = nodes.reduce((sum, n) => sum + n.done, 0)

  if (!nodes.length) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={tr('Learning constellation')}
          title={tr('Your whole year, mapped')}
          subtitle={tr('Every subject is a star system. Light up the unit nodes by finishing them — watch your curriculum glow.')}
          icon={<Orbit className="h-5 w-5" />}
        />
        <EmptyState
          icon={<LibraryBig className="h-6 w-6" />}
          title={tr('Your sky is still empty')}
          description={tr('Import an official book from the Library and its units will light up here.')}
          action={
            <Button size="sm" onClick={() => navigate('/library')}>
              {tr('Open library')}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Learning constellation')}
        title={tr('Your whole year, mapped')}
        subtitle={tr('Every subject is a star system. Light up the unit nodes by finishing them — watch your curriculum glow.')}
        icon={<Orbit className="h-5 w-5" />}
        actions={
          <Button variant="secondary" onClick={() => navigate('/library')}>
            {tr('Open library')} <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="relative overflow-hidden p-2 sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_30%_20%,rgba(139,92,246,.18),transparent_65%),radial-gradient(500px_300px_at_80%_80%,rgba(33,230,201,.14),transparent_60%)]" />
          <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full" role="img" aria-label={tr('Curriculum constellation map')}>
            <defs>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="starFade">
                <stop offset="0%" stopColor="#ffffff" stopOpacity=".85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {Array.from({ length: 70 }).map((_, i) => {
              const x = (i * 137.5) % W
              const y = (i * 89.3) % H
              const r = (i % 3) * 0.45 + 0.5
              return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={0.12 + (i % 4) * 0.1} />
            })}

            {nodes.map((node, i) => {
              const next = nodes[(i + 1) % nodes.length]
              return (
                <path
                  key={`line-${node.id}`}
                  d={`M ${node.cx} ${node.cy} Q ${(node.cx + next.cx) / 2 + 20} ${(node.cy + next.cy) / 2 - 30} ${next.cx} ${next.cy}`}
                  fill="none"
                  stroke="rgba(148,163,184,.18)"
                  strokeWidth="1.4"
                  strokeDasharray="3 7"
                />
              )
            })}

            {nodes.map((node) => (
              <g key={node.id}>
                {node.chapters.map((chapter) => (
                  <line
                    key={`spoke-${chapter.id}`}
                    x1={node.cx}
                    y1={node.cy}
                    x2={chapter.x}
                    y2={chapter.y}
                    stroke={chapter.done ? `${node.color}88` : 'rgba(148,163,184,.22)'}
                    strokeWidth={chapter.done ? 1.6 : 1}
                  />
                ))}

                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={selected === node.id ? 48 : 40}
                  fill={`${node.color}20`}
                  stroke={node.color}
                  strokeWidth={selected === node.id ? 2.5 : 1.5}
                  filter="url(#nodeGlow)"
                  className="cursor-pointer transition-all"
                  onClick={() => setSelected(node.id)}
                  role="button"
                  aria-label={tr('{name} subject', { name: tr(node.label) })}
                />
                <text x={node.cx} y={node.cy - 4} textAnchor="middle" fontSize="19">{node.emoji}</text>
                <text x={node.cx} y={node.cy + 17} textAnchor="middle" fill="#eef2ff" fontSize="10" fontWeight="800">
                  {tr(node.label)}
                </text>
                <text x={node.cx} y={node.cy + 29} textAnchor="middle" fill={node.color} fontSize="8" fontWeight="700">
                  {node.done}/{node.chapters.length}
                </text>

                {node.chapters.map((chapter) => (
                  <g
                    key={chapter.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelected(node.id)
                      navigate(`/reader/${chapter.bookId}`)
                    }}
                    role="button"
                    aria-label={`${chapter.title}${chapter.done ? ' completed' : ''}`}
                  >
                    <circle
                      cx={chapter.x}
                      cy={chapter.y}
                      r={chapter.done ? 8 : 6}
                      fill={chapter.done ? node.color : '#0c1122'}
                      stroke={node.color}
                      strokeWidth="1.6"
                    />
                    {chapter.done && <circle cx={chapter.x} cy={chapter.y} r="3" fill="#0b1220" />}
                  </g>
                ))}
              </g>
            ))}
          </svg>

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="chip border-line bg-ink-950/70 text-[9px] text-muted"><span className="h-2 w-2 rounded-full bg-aurora-400" /> {tr('mastered')}</span>
            <span className="chip border-line bg-ink-950/70 text-[9px] text-muted"><span className="h-2 w-2 rounded-full border border-muted" /> {tr('to unlock')}</span>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun/15 text-sun">
                <Star className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">{tr('Year progress')}</p>
                <p className="text-[10px] text-muted">{done} {tr('of')} {total} {tr('units mastered')}</p>
              </div>
              <span className="ml-auto font-display text-xl font-extrabold text-main">{pct(done, total)}%</span>
            </div>
            <ProgressBar value={done} max={total} className="mt-3" />
            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              {tr('Every node you light adds +50 XP and moves your mascot closer to its next evolution.')}
            </p>
          </Card>

          {active && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `${active.color}20` }}>
                    {active.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-main">{tr(active.label)}</p>
                    <p className="text-[10px]" style={{ color: active.color }}>{tr(active.label)}</p>
                  </div>
                </div>
                <span className="chip" style={{ borderColor: `${active.color}44`, color: active.color }}>
                  {active.done}/{active.chapters.length}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {active.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => navigate(`/reader/${chapter.bookId}`)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition',
                      chapter.done ? 'border-aurora-400/25 bg-aurora-400/5' : 'border-line bg-card-2 hover:bg-white/5',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                        chapter.done ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted',
                      )}
                    >
                      {chapter.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-[11px] font-bold', chapter.done ? 'text-muted' : 'text-main')}>{chapter.title}</span>
                      <span className="block truncate text-[9px] text-muted">{chapter.blurb}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-2" />
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-3">
            <p className="flex items-start gap-2 text-[10px] leading-relaxed text-muted">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-300" />
              {tr('Tap any star to jump straight into the book. Complete a unit from the reader to light its node.')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
