import {
  ArrowLeft,
  CalendarClock,
  CalendarX2,
  CircleCheck,
  ExternalLink,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { CapacityBar } from '@/components/events/CapacityBar'
import { CategoryBadge } from '@/components/events/CategoryBadge'
import { EventCover } from '@/components/events/EventCover'
import { StatusBadge } from '@/components/events/StatusBadge'
import { PageLoader, Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useDeleteEvent, useEvent, useSeat } from '@/hooks/useEvents'
import { getErrorMessage, getErrorStatus } from '@/lib/errors'
import { formatDate, formatEventWhen, formatPrice, isPast, seatsLeft } from '@/lib/format'
import type { EventDetail as EventDetailType } from '@/types/api'

export default function EventDetail() {
  const { id } = useParams()
  const { data: event, isPending, isError, error } = useEvent(id)

  if (isPending) return <PageLoader />
  if (isError) {
    const notFound = getErrorStatus(error) === 404 || getErrorStatus(error) === 400
    return (
      <EmptyState
        icon={CalendarX2}
        title={notFound ? 'Event not found' : 'This event couldn’t be loaded'}
        description={notFound ? 'It may have been removed, or the link is wrong.' : getErrorMessage(error)}
        action={
          <Button asChild variant="outline">
            <Link to="/events">Browse events</Link>
          </Button>
        }
      />
    )
  }

  return (
    <article>
      <Link to="/events" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> All events
      </Link>

      <div className="relative overflow-hidden rounded-3xl">
        <EventCover
          src={event.coverImage}
          category={event.category}
          className="h-64 w-full sm:h-80 lg:h-[26rem]"
          iconClassName="absolute top-6 right-6 size-8"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CategoryBadge category={event.category} />
            {event.status !== 'published' && <StatusBadge status={event.status} />}
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-bold sm:text-6xl">{event.title}</h1>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{event.organizer?.name ?? 'an organizer'}</span>
          </p>
          <h2 className="mt-8 mb-3 text-xl font-semibold">About this event</h2>
          <p className="max-w-prose leading-relaxed whitespace-pre-line text-moon/85">{event.description}</p>

          {event.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {event.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-muted-foreground">
                  #{tag}
                </li>
              ))}
            </ul>
          )}

          {event.canManage && <ManagePanel event={event} />}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingPanel event={event} />
        </aside>
      </div>
    </article>
  )
}

function BookingPanel({ event }: { event: EventDetailType }) {
  const { user } = useAuth()
  const location = useLocation()
  const { reserve, release } = useSeat(event._id)
  const LocationIcon = event.isOnline ? Globe : MapPin
  const soldOut = seatsLeft(event) === 0
  const started = isPast(event.startDate)

  const handleReserve = () =>
    reserve.mutate(undefined, {
      onSuccess: () => toast.success('Seat reserved. See you there!'),
      onError: (err) => toast.error(getErrorMessage(err)),
    })
  const handleRelease = () =>
    release.mutate(undefined, {
      onSuccess: () => toast.success('Reservation cancelled'),
      onError: (err) => toast.error(getErrorMessage(err)),
    })

  let action: React.ReactNode
  if (event.status === 'cancelled') {
    action = <Button disabled size="lg" className="w-full">This event was cancelled</Button>
  } else if (event.status === 'draft') {
    action = <Button disabled size="lg" className="w-full">Publish to open reservations</Button>
  } else if (event.isRegistered) {
    action = (
      <div className="grid gap-3">
        <p className="flex items-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2.5 text-sm font-medium text-emerald-300">
          <CircleCheck className="size-4" aria-hidden="true" /> You have a seat
        </p>
        {event.onlineUrl && (
          <Button asChild variant="stage" size="lg" className="w-full">
            <a href={event.onlineUrl} target="_blank" rel="noreferrer">
              Open the event link <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
        )}
        {!started && (
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="w-full" disabled={release.isPending}>
                {release.isPending && <Spinner />} Cancel reservation
              </Button>
            }
            title="Cancel your reservation?"
            description="Your seat will be released for someone else. You can reserve again later if seats are still available."
            confirmLabel="Cancel reservation"
            cancelLabel="Keep my seat"
            destructive
            onConfirm={handleRelease}
          />
        )}
      </div>
    )
  } else if (started) {
    action = <Button disabled size="lg" className="w-full">This event has started</Button>
  } else if (soldOut) {
    action = <Button disabled size="lg" className="w-full">Sold out</Button>
  } else if (!user) {
    action = (
      <Button asChild variant="stage" size="lg" className="w-full">
        <Link to="/login" state={{ from: location }}>Log in to reserve a seat</Link>
      </Button>
    )
  } else {
    action = (
      <Button variant="stage" size="lg" className="w-full" onClick={handleReserve} disabled={reserve.isPending}>
        {reserve.isPending ? <><Spinner /> Reserving</> : 'Reserve a seat'}
      </Button>
    )
  }

  return (
    <div className="drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]">
      <div className="notch-b glass-strong grid gap-5 rounded-t-2xl border-b-0 p-6">
        <p className="font-display text-4xl font-bold">{formatPrice(event.price)}</p>
        <dl className="grid gap-4 text-sm">
          <div className="flex gap-3">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
            <div>
              <dt className="sr-only">When</dt>
              <dd className="font-medium">{formatDate(event.startDate)}</dd>
              <dd className="text-muted-foreground">{formatEventWhen(event.startDate, event.endDate)}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <LocationIcon className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
            <div>
              <dt className="sr-only">Where</dt>
              {event.isOnline ? (
                <>
                  <dd className="font-medium">Online</dd>
                  <dd className="text-muted-foreground">
                    {event.isRegistered || event.canManage ? 'The link is below.' : 'You’ll get the link after reserving.'}
                  </dd>
                </>
              ) : (
                <>
                  <dd className="font-medium">{event.venue.name}</dd>
                  <dd className="text-muted-foreground">{[event.venue.address, event.venue.city].filter(Boolean).join(', ')}</dd>
                </>
              )}
            </div>
          </div>
        </dl>
        <CapacityBar registered={event.registeredCount} capacity={event.capacity} />
      </div>
      <div className="notch-t glass-strong relative rounded-b-2xl border-t-0 p-5">
        <div className="perforation-x absolute inset-x-5 top-0" aria-hidden="true" />
        {action}
      </div>
    </div>
  )
}

function ManagePanel({ event }: { event: EventDetailType }) {
  const navigate = useNavigate()
  const remove = useDeleteEvent()

  const handleDelete = () =>
    remove.mutate(event._id, {
      onSuccess: () => {
        toast.success('Event deleted')
        navigate('/dashboard', { replace: true })
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })

  return (
    <section className="mt-12 rounded-2xl border border-dashed border-white/15 p-5" aria-labelledby="manage-heading">
      <h2 id="manage-heading" className="text-lg font-semibold">
        Manage this event
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Only you and admins can see this section.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={`/events/${event._id}/edit`}>
            <Pencil data-icon="inline-start" /> Edit event
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/events/${event._id}/attendees`}>
            <Users data-icon="inline-start" /> Attendees ({event.registeredCount})
          </Link>
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" disabled={remove.isPending}>
              <Trash2 data-icon="inline-start" /> Delete event
            </Button>
          }
          title="Delete this event?"
          description={`“${event.title}” and all ${event.registeredCount} reservations will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete event"
          destructive
          onConfirm={handleDelete}
        />
      </div>
    </section>
  )
}
