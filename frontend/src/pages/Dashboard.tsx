import { CalendarPlus, Eye, Pencil, Plus, Ticket, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { CapacityBar } from '@/components/events/CapacityBar'
import { StatusBadge } from '@/components/events/StatusBadge'
import { TicketStub } from '@/components/events/TicketStub'
import { PageHeader } from '@/components/PageHeader'
import { Pager } from '@/components/Pager'
import { PageLoader } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useMyEvents, useMyRegistrations } from '@/hooks/useEvents'
import { formatDate, formatTime, isPast } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventStatus } from '@/types/api'

export default function Dashboard() {
  const { user, hasRole } = useAuth()
  const isOrganizer = hasRole('organizer', 'admin')
  const firstName = user?.name.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Hi, ${firstName}`}
        description={isOrganizer ? 'Your events and the seats you’ve reserved.' : 'Your reserved seats, upcoming and past.'}
        actions={
          isOrganizer ? (
            <Button asChild variant="stage">
              <Link to="/events/new">
                <Plus data-icon="inline-start" /> Create event
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/events">Browse events</Link>
            </Button>
          )
        }
      />

      {isOrganizer ? (
        <Tabs defaultValue="hosting">
          <TabsList className="mb-8">
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
            <TabsTrigger value="tickets">My tickets</TabsTrigger>
          </TabsList>
          <TabsContent value="hosting">
            <HostingPanel />
          </TabsContent>
          <TabsContent value="tickets">
            <TicketsPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <TicketsPanel />
      )}
    </div>
  )
}

function TicketsPanel() {
  const { data, isPending } = useMyRegistrations()
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming')

  if (isPending) return <PageLoader />

  const registrations = data ?? []
  const upcoming = registrations
    .filter((r) => !isPast(r.event.startDate))
    .sort((a, b) => +new Date(a.event.startDate) - +new Date(b.event.startDate))
  const past = registrations.filter((r) => isPast(r.event.startDate))
  const shown = view === 'upcoming' ? upcoming : past

  if (registrations.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="You haven’t reserved any seats yet"
        description="Find something you’d like to go to and reserve a seat. It will show up here."
        action={
          <Button asChild variant="stage">
            <Link to="/events">Browse events</Link>
          </Button>
        }
      />
    )
  }

  return (
    <section aria-label="My tickets">
      <div className="mb-6 inline-flex rounded-lg bg-white/[0.04] p-1" role="group" aria-label="Show tickets">
        {(['upcoming', 'past'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
              view === v ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted-foreground">
          {view === 'upcoming' ? 'No upcoming events. Time to find the next one.' : 'No past events yet.'}
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map(({ _id, event }) => (
            <li key={_id}>
              <Link
                to={`/events/${event._id}`}
                className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <TicketStub event={event} className={cn(view === 'past' && 'opacity-60')} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const STATUS_FILTERS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'cancelled', label: 'Cancelled' },
]

function HostingPanel() {
  const [status, setStatus] = useState<EventStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { data, isPending } = useMyEvents({ page, limit: 10, status: status === 'all' ? undefined : status })

  if (isPending || !data) return <PageLoader />
  const { events, stats, pagination } = data

  if (stats.totalEvents === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="You haven’t created any events"
        description="Create your first event. You can keep it as a draft until the details are final."
        action={
          <Button asChild variant="stage">
            <Link to="/events/new">Create event</Link>
          </Button>
        }
      />
    )
  }

  const fillRate = stats.totalCapacity ? Math.round((stats.totalRegistrations / stats.totalCapacity) * 100) : 0
  const tiles = [
    { label: 'Events', value: stats.totalEvents },
    { label: 'Published', value: stats.published },
    { label: 'Upcoming', value: stats.upcoming },
    { label: 'Seats filled', value: `${stats.totalRegistrations.toLocaleString()}`, sub: `${fillRate}% of capacity` },
  ]

  return (
    <section aria-label="Events you host" className="grid gap-8">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="glass rounded-xl p-4">
            <dt className="text-sm text-muted-foreground">{t.label}</dt>
            <dd className="mt-2 font-display text-3xl font-bold tabular-nums">{t.value}</dd>
            {t.sub && <dd className="mt-1 text-xs text-muted-foreground">{t.sub}</dd>}
          </div>
        ))}
      </dl>

      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={status === f.value ? 'secondary' : 'ghost'}
              aria-pressed={status === f.value}
              onClick={() => {
                setStatus(f.value)
                setPage(1)
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          {events.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No events with this status.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Event</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden w-48 sm:table-cell">Seats</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell className="max-w-[16rem] pl-5">
                      <Link to={`/events/${event._id}`} className="block truncate font-medium hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(event.startDate)}, {formatTime(event.startDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="grid gap-1.5">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {event.registeredCount} / {event.capacity}
                        </span>
                        <CapacityBar registered={event.registeredCount} capacity={event.capacity} showLabel={false} />
                      </div>
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${event.title}`}>
                          <Link to={`/events/${event._id}`}>
                            <Eye />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${event.title}`}>
                          <Link to={`/events/${event._id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Attendees for ${event.title}`}>
                          <Link to={`/events/${event._id}/attendees`}>
                            <Users />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Pager pagination={pagination} onChange={setPage} />
      </div>
    </section>
  )
}
