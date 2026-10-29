import { Globe, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { formatLocation, formatPrice, formatTime, seatsLeft } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventSummary } from '@/types/api'
import { CategoryBadge } from './CategoryBadge'
import { EventCover } from './EventCover'

/** An event as an admission ticket: the photo is the body, the tear-off stub holds date and price. */
export function EventCard({ event, className }: { event: EventSummary; className?: string }) {
  const start = new Date(event.startDate)
  const left = seatsLeft(event)
  const LocationIcon = event.isOnline ? Globe : MapPin

  return (
    <Link
      to={`/events/${event._id}`}
      className={cn(
        'group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
        className,
      )}
    >
      <article className="ticket-h glass flex h-full flex-col overflow-hidden rounded-2xl transition-colors group-hover:bg-white/[0.07]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <EventCover
            src={event.coverImage}
            category={event.category}
            className="size-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/80 to-transparent" />
          <CategoryBadge category={event.category} className="absolute top-3 left-3" />
        </div>

        <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
          <h3 className="line-clamp-2 font-heading text-lg leading-snug font-semibold">{event.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LocationIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{formatLocation(event)}</span>
          </p>
        </div>

        <div className="perforation-x mx-4" aria-hidden="true" />

        <div className="flex h-16 items-center justify-between gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <time dateTime={event.startDate} className="font-heading text-xl font-bold tracking-tight">
              {format(start, 'MMM d')}
            </time>
            <span className="text-sm text-muted-foreground">{formatTime(event.startDate)}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatPrice(event.price)}</p>
            <p className={cn('text-xs', left === 0 ? 'text-destructive' : left <= 10 ? 'text-amber' : 'text-muted-foreground')}>
              {left === 0 ? 'Sold out' : `${left.toLocaleString()} seats left`}
            </p>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
      <div className="grid gap-3 px-5 py-5">
        <div className="h-5 w-4/5 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="perforation-x mx-4" />
      <div className="flex h-16 items-center justify-between px-5">
        <div className="h-5 w-20 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-5 w-14 animate-pulse rounded bg-white/[0.05]" />
      </div>
    </div>
  )
}
