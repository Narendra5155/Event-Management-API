import { cn } from '@/lib/utils'
import type { EventStatus } from '@/types/api'

const STYLES: Record<EventStatus, string> = {
  published: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  draft: 'border-amber/30 bg-amber/10 text-amber',
  cancelled: 'border-destructive/30 bg-destructive/10 text-destructive',
}

const LABELS: Record<EventStatus, string> = { published: 'Published', draft: 'Draft', cancelled: 'Cancelled' }

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', STYLES[status])}>
      {LABELS[status]}
    </span>
  )
}
