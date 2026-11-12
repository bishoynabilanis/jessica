import { useState } from 'react'
import { ExternalLink, Play, Youtube } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  geminiKeyVideo,
  youtubeEmbedUrl,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from '@/data/tutorials'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * "Don't know how to get a key?" card with a short Arabic video.
 * Rendered only while the key is missing, so it disappears once the setup works.
 */
export function KeyTutorial({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const video = geminiKeyVideo

  return (
    <>
      <div
        className={cn(
          'mt-2 flex items-start gap-2.5 rounded-2xl border border-sun/25 bg-sun/5 p-2.5',
          className,
        )}
      >
        <button
          onClick={() => setOpen(true)}
          className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10"
          aria-label={tr('Watch the video')}
        >
          <img
            src={youtubeThumbUrl(video)}
            alt=""
            referrerPolicy="no-referrer"
            className="h-[58px] w-[102px] object-cover"
            draggable={false}
          />
          <span className="absolute inset-0 grid place-items-center bg-black/30">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink-950 shadow">
              <Play className="h-4 w-4 translate-x-0.5 fill-current" />
            </span>
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold text-main">{tr('Don’t know how to get the key?')}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
            {tr('A video of {time} min in Arabic that shows every step in Google AI Studio.', {
              time: video.duration,
            })}
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-sun transition hover:text-sun/80"
          >
            <Youtube className="h-3.5 w-3.5" /> {tr('Watch the video')}
          </button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={tr('How to create a Gemini key')}
        subtitle={tr('Every step inside Google AI Studio.')}
        icon={<Youtube className="h-4 w-4" />}
        size="lg"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-black">
          {open && (
            <iframe
              src={youtubeEmbedUrl(video)}
              title={tr('How to create a Gemini key')}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-2">
            {tr('Video by {channel}', { channel: video.channel })}
          </p>
          <a
            href={youtubeWatchUrl(video)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line px-2.5 py-1.5 text-[10px] font-bold text-muted transition hover:text-main"
          >
            <ExternalLink className="h-3 w-3" /> {tr('Open on YouTube')}
          </a>
        </div>
      </Modal>
    </>
  )
}
