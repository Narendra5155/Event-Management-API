import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { eventsApi } from '@/api/events'
import { queryKeys } from '@/lib/queryClient'
import type { EventSummary } from '@/types/api'
import { TicketStub } from './TicketStub'

const DAY = 86_400_000
// Shown while the API loads or if it's unreachable, so the panel is never empty.
const FALLBACK: Pick<EventSummary, 'title' | 'startDate' | 'category' | 'isOnline' | 'venue'>[] = [
  { title: 'Future of Web Summit', category: 'conference', isOnline: false, venue: { name: 'Moscone West', city: 'San Francisco' }, startDate: new Date(Date.now() + 12 * DAY).toISOString() },
  { title: 'Midnight Synthwave Live', category: 'concert', isOnline: false, venue: { name: 'The Warfield', city: 'San Francisco' }, startDate: new Date(Date.now() + 20 * DAY).toISOString() },
  { title: 'Remote Builders Meetup', category: 'meetup', isOnline: true, venue: {}, startDate: new Date(Date.now() + 3 * DAY).toISOString() },
]

const POSES = [
  { rotate: -5, x: -24, y: 0 },
  { rotate: 3, x: 26, y: 0 },
  { rotate: -2, x: -6, y: 0 },
]

/** Three upcoming events fanned out like tickets on a table — the one orchestrated entrance. */
export function TicketStack() {
  const reduceMotion = useReducedMotion()
  const params = { limit: 3, sort: 'popular' as const }
  const { data, isError } = useQuery({
    queryKey: queryKeys.events(params),
    queryFn: () => eventsApi.list(params),
    staleTime: 5 * 60_000,
  })
  // Wait for real data so the entrance plays once; fall back only if there's nothing to show.
  const events = data?.events.length ? data.events : data || isError ? FALLBACK : []

  return (
    <div className="relative mx-auto grid min-h-[22rem] w-full max-w-md content-center gap-5" aria-label="Popular upcoming events">
      {events.slice(0, 3).map((event, i) => (
        <motion.div
          key={i}
          initial={reduceMotion ? false : { opacity: 0, y: -40, rotate: 0 }}
          animate={{ opacity: 1, y: POSES[i].y, rotate: POSES[i].rotate, x: POSES[i].x }}
          transition={{ delay: 0.15 + i * 0.14, type: 'spring', stiffness: 120, damping: 16 }}
          style={{ zIndex: 3 - i }}
        >
          <TicketStub event={event} className="shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]" />
        </motion.div>
      ))}
    </div>
  )
}
