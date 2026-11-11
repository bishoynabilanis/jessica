import { useState } from 'react'
import {
  Brain,
  CalendarCheck,
  Camera,
  FileText,
  Gamepad2,
  GitBranch,
  GraduationCap,
  Headphones,
  Keyboard,
  Palette,
  Pencil,
  Sparkles,
  Waves,
} from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { QuizModal } from '@/components/tools/QuizModal'
import { FlashcardsModal } from '@/components/tools/FlashcardsModal'
import { CheatSheetModal } from '@/components/tools/CheatSheetModal'
import { PlannerModal } from '@/components/tools/PlannerModal'
import { MindMapModal } from '@/components/tools/MindMapModal'
import { PodcastModal } from '@/components/tools/PodcastModal'
import { ComicModal } from '@/components/tools/ComicModal'
import { EssayGraderModal } from '@/components/tools/EssayGrader'
import { VisionSolverModal } from '@/components/tools/VisionSolver'
import { PronunciationModal } from '@/components/tools/PronunciationCoach'
import { WhiteboardModal } from '@/components/tools/Whiteboard'
import { VoiceTutorModal } from '@/components/tools/VoiceTutor'
import { cn } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { stageForGrade } from '@/lib/stage'
import { tr } from '@/i18n'

type ToolKey =
  | 'quiz'
  | 'cards'
  | 'cheat'
  | 'planner'
  | 'mindmap'
  | 'podcast'
  | 'comic'
  | 'essay'
  | 'vision'
  | 'pronounce'
  | 'whiteboard'
  | 'voice'

const tools: {
  key: ToolKey
  title: string
  arabic: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}[] = [
  { key: 'quiz', title: "Quiz arena", arabic: 'اختبار سريع', description: "Five AI questions with instant XP.", icon: Gamepad2, tint: 'from-violet-neon/25 to-violet-neon/5 text-violet-glow' },
  { key: 'cards', title: "Flashcards + SRS", arabic: 'بطاقات ذكية', description: "Turn this chapter into memory cards.", icon: Brain, tint: 'from-aurora-400/25 to-aurora-400/5 text-aurora-300' },
  { key: 'cheat', title: "Cheat sheet", arabic: 'ملخص الامتحان', description: "One-page PDF summary of everything.", icon: FileText, tint: 'from-sun/25 to-sun/5 text-sun' },
  { key: 'planner', title: "Study planner", arabic: 'خطة المذاكرة', description: "A realistic 5-day revision plan.", icon: CalendarCheck, tint: 'from-sky/25 to-sky/5 text-sky' },
  { key: 'mindmap', title: "Mind map", arabic: 'خريطة ذهنية', description: "A visual branch map of the chapter.", icon: GitBranch, tint: 'from-aurora-400/25 to-violet-neon/10 text-aurora-300' },
  { key: 'podcast', title: "Podcast mode", arabic: 'بودكاست', description: "Listen to the chapter as a mini show.", icon: Headphones, tint: 'from-violet-neon/25 to-sky/5 text-violet-glow' },
  { key: 'comic', title: "Comic strip", arabic: 'قصة مصورة', description: "Learn the idea through a 4-panel story.", icon: Palette, tint: 'from-coral/25 to-sun/10 text-coral' },
  { key: 'essay', title: "Essay grader", arabic: 'تصحيح التعبير', description: "Write a paragraph and get a score.", icon: GraduationCap, tint: 'from-aurora-400/25 to-sun/10 text-aurora-300' },
  { key: 'vision', title: "Vision solver", arabic: 'حل بالكاميرا', description: "Photograph any question and solve it.", icon: Camera, tint: 'from-sky/25 to-violet-neon/10 text-sky' },
  { key: 'pronounce', title: "Pronunciation", arabic: 'النطق', description: "Record a phrase and hear fixes.", icon: Waves, tint: 'from-coral/25 to-violet-neon/10 text-coral' },
  { key: 'whiteboard', title: "Whiteboard", arabic: 'سبورة', description: "Sketch, draw and save your thinking.", icon: Pencil, tint: 'from-aurora-400/25 to-aurora-400/5 text-aurora-300' },
  { key: 'voice', title: "Voice tutor", arabic: 'مدرس صوتي', description: "Speak with Jessica and build confidence.", icon: Keyboard, tint: 'from-violet-neon/25 to-aurora-400/10 text-violet-glow' },
]

export function ReaderStudio({
  open,
  onClose,
  book,
  chapter,
  page,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
  page: number
}) {
  const [active, setActive] = useState<ToolKey | null>(null)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const kids = stageForGrade(gradeLevel) === 'primary'
  const visibleTools = kids ? tools.filter((tool) => tool.key !== 'essay') : tools

  const closeAll = () => {
    setActive(null)
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={closeAll}
        title={tr("Jessica Studio")}
        subtitle={`Every AI study tool, grounded in ${book.title} · page ${page}.`}
        icon={<Sparkles className="h-4.5 w-4.5" />}
        size="lg"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.key}
                onClick={() => setActive(tool.key)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br p-3.5 text-left transition hover:border-line-strong hover:shadow-lg',
                  tool.tint,
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-[9px] font-bold text-muted-2">{tr("AI")}</span>
                </div>
                <p className="mt-2.5 text-[13px] font-extrabold text-main">{tr(tool.title)}</p>
                <p className="text-[10px] font-semibold text-aurora-300/80" dir="rtl">{tool.arabic}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted">{tr(tool.description)}</p>
              </button>
            )
          })}
        </div>
        <p className="mt-4 rounded-xl border border-line bg-card-2 px-3 py-2 text-[10px] leading-relaxed text-muted">
          <strong className="text-main">{tr("Tip:")}</strong> {tr("all tools read the text your browser extracted from the PDF — nothing is uploaded except the excerpt needed for the request.")}
        </p>
      </Modal>

      {active === 'quiz' && <QuizModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'cards' && <FlashcardsModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'cheat' && <CheatSheetModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'planner' && <PlannerModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'mindmap' && <MindMapModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'podcast' && <PodcastModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'comic' && <ComicModal open onClose={() => setActive(null)} book={book} chapter={chapter} />}
      {active === 'essay' && <EssayGraderModal open onClose={() => setActive(null)} book={book} />}
      {active === 'vision' && <VisionSolverModal open onClose={() => setActive(null)} bookTitle={book.title} />}
      {active === 'pronounce' && <PronunciationModal open onClose={() => setActive(null)} language={book.language} subject={book.subject} />}
      {active === 'whiteboard' && <WhiteboardModal open onClose={() => setActive(null)} />}
      {active === 'voice' && <VoiceTutorModal open onClose={() => setActive(null)} language={book.language} />}
    </>
  )
}
