import { ClipboardList, FilePen, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard'
import { CATEGORY_META } from '@/components/events/categories'
import { TicketStack } from '@/components/events/TicketStack'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { CATEGORIES } from '@/types/api'

const ORGANIZER_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Seats can’t be oversold',
    body: 'Every reservation is checked against capacity at the moment it’s made, even when hundreds arrive at once.',
  },
  {
    icon: ClipboardList,
    title: 'Your guest list, ready to export',
    body: 'See who’s coming as they sign up and download the list as a CSV for the door.',
  },
  {
    icon: FilePen,
    title: 'Drafts until you’re ready',
    body: 'Work on the details privately and publish when everything is final.',
  },
]

export default function Landing() {
  const { user, hasRole } = useAuth()
  const { data, isPending } = useEvents({ limit: 6, sort: 'date' })
  const hostHref = hasRole('organizer', 'admin') ? '/events/new' : user ? '/profile' : '/signup?role=organizer'

  return (
    <div className="grid gap-24 sm:gap-32">
      <section className="grid items-center gap-14 pt-4 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div>
          <h1 className="font-display text-[3.4rem] font-extrabold sm:text-7xl lg:text-[5.5rem]">
            Find your people.
            <br />
            Fill the room.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Browse conferences, workshops, concerts and meetups, and reserve a seat in one click. Hosting
            something? Publish it and watch the seats fill.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="stage" size="lg">
              <Link to="/events">Browse events</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={hostHref}>Host an event</Link>
            </Button>
          </div>
        </div>
        <div className="py-6">
          <TicketStack />
        </div>
      </section>

      <section aria-labelledby="soon-heading">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="soon-heading" className="font-display text-4xl font-bold sm:text-5xl">
            Happening soon
          </h2>
          <Link to="/events" className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground">
            See all events
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)
            : data?.events.map((event) => <EventCard key={event._id} event={event} />)}
        </div>
      </section>

      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="mb-8 font-display text-4xl font-bold sm:text-5xl">
          Browse by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((category) => {
            const { label, icon: Icon, hue } = CATEGORY_META[category]
            return (
              <Link
                key={category}
                to={`/events?category=${category}`}
                className="glass group flex flex-col gap-6 rounded-xl p-4 transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Icon className="size-6" style={{ color: hue }} aria-hidden="true" />
                <span className="font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section
        aria-labelledby="host-heading"
        className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12"
      >
        <div
          className="pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full bg-magenta/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 id="host-heading" className="font-display text-4xl font-bold sm:text-5xl">
              Running an event?
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Create an organizer account, publish your event and share the link. EventSphere takes care of
              the seats.
            </p>
            <Button asChild variant="stage" size="lg" className="mt-8">
              <Link to={hostHref}>Host an event</Link>
            </Button>
          </div>
          <ul className="grid gap-7">
            {ORGANIZER_POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
                  <Icon className="size-5 text-amber" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
