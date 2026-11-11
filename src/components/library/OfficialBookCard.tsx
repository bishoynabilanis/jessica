import { ArrowUpRight, Check, Download, FileText, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Book } from '@/types'
import type { OfficialBook } from '@/data/officialBooks'
import { subjectMeta } from '@/data/books'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'

export function OfficialBookCard({
  entry,
  imported,
  onImport,
  basePath = '/reader',
}: {
  entry: OfficialBook
  imported?: Book
  onImport: (entry: OfficialBook) => void
  basePath?: string
}) {
  const meta = subjectMeta[entry.subject] || { emoji: '📚', color: '#21e6c9' }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-card p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-20 blur-2xl"
        style={{ background: meta.color }}
      />
      <div className="flex items-start justify-between gap-2">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl ring-1 ring-inset ring-white/10"
          style={{ background: `${meta.color}1c` }}
        >
          {meta.emoji}
        </div>
        {imported ? (
          <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
            <Check className="h-3 w-3" /> {tr('In your library')}
          </span>
        ) : (
          <span className="chip border-sun/25 bg-sun/10 text-sun">
            {entry.sizeMb} MB
          </span>
        )}
      </div>

      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {tr(entry.subject)} · {tr(entry.term)}
        </span>
        <h3 className="mt-2 line-clamp-2 font-display text-sm font-extrabold leading-snug text-main" dir="auto">
          {entry.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted">
          <FileText className="h-3 w-3" /> {tr('Ministry of Education · official PDF')}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {imported ? (
          <Link to={`${basePath}/${imported.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              {tr('Open book')} <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <>
            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
              title={tr('The PDF opens in a new tab. Save it, then import it here.')}
            >
              <Button size="sm" variant="secondary" className="w-full">
                <Download className="h-3.5 w-3.5" /> {tr('Download PDF')}
              </Button>
            </a>
            <Button size="sm" onClick={() => onImport(entry)} title={tr('Pick the file you just downloaded')}>
              <Upload className="h-3.5 w-3.5" /> {tr('Import')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
