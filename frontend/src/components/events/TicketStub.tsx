import { format } from 'date-fns'
import { Globe, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatLocation, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventSummary } from '@/types/api'
import { CATEGORY_META } from './categories'

interface TicketStubProps {
  event: Pick<EventSummary, 'title' | 'startDate' | 'category' | 'isOnline' | 'venue'>
  footer?: ReactNode
  className?: string
}

/** Horizontal ticket: a date stub on the left, perforation, then the event. */
export function TicketStub({ event, footer, className }: TicketStubProps) {
  const start = new Date(event.startDate)
  const { label, hue } = CATEGORY_META[event.category]
  const LocationIcon = event.isOnline ? Globe : MapPin

  return (
    <div className={cn('ticket-v glass-strong relative flex overflow-hidden rounded-2xl', className)}>
      <div
        className="flex w-[88px] shrink-0 flex-col items-center justify-center py-4"
        style={{ backgroundImage: `linear-gradient(160deg, ${hue}33, transparent 75%)` }}
      >
        <span className="text-xs font-medium text-muted-foreground">{format(start, 'MMM')}</span>
        <span className="font-display text-4xl font-bold">{format(start, 'd')}</span>
        <span className="text-xs text-muted-foreground">{format(start, 'EEE')}</span>
      </div>
      <div className="perforation-y my-3" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3.5">
        <span className="text-xs font-medium" style={{ color: hue }}>
          {label}
        </span>
        <p className="truncate font-heading text-[0.95rem] font-semibold">{event.title}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <LocationIcon className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {formatLocation(event)}, {formatTime(event.startDate)}
          </span>
        </p>
        {footer}
      </div>
    </div>
  )
}
