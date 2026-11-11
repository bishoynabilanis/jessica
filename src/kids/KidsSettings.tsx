import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Settings } from '@/pages/Settings'
import { ParentGate } from '@/kids/ParentGate'
import { tr } from '@/i18n'

export function KidsSettings() {
  const navigate = useNavigate()

  return (
    <ParentGate>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/kids')}
          className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-main"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" /> {tr('Back to the kids world')}
        </button>
        <Settings />
      </div>
    </ParentGate>
  )
}
