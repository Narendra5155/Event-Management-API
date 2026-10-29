import { CalendarSearch, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard'
import { CATEGORY_META } from '@/components/events/categories'
import { PageHeader } from '@/components/PageHeader'
import { Pager } from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useEvents } from '@/hooks/useEvents'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { CATEGORIES, type Category, type EventListParams } from '@/types/api'

const SORTS = [
  { value: 'date', label: 'Soonest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Recently added' },
  { value: 'price', label: 'Lowest price' },
] as const

const WHEN = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
] as const

export default function Events() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const debouncedSearch = useDebouncedValue(search.trim())

  const category = (CATEGORIES as readonly string[]).includes(params.get('category') ?? '')
    ? (params.get('category') as Category)
    : undefined
  const sort = (params.get('sort') as EventListParams['sort']) ?? 'date'
  const when = (params.get('when') as EventListParams['when']) ?? 'upcoming'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const update = (changes: Record<string, string | undefined>, resetPage = true) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        if (resetPage) next.delete('page')
        return next
      },
      { replace: true },
    )

  // Push the debounced search term into the URL so results are shareable.
  useEffect(() => {
    if ((params.get('search') ?? '') !== debouncedSearch) update({ search: debouncedSearch || undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const query: EventListParams = { page, limit: 12, sort, when, category, search: debouncedSearch || undefined }
  const { data, isPending, isError, error, isPlaceholderData, refetch } = useEvents(query)
  const hasFilters = Boolean(category || debouncedSearch || when !== 'upcoming')

  const clearFilters = () => {
    setSearch('')
    setParams({}, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description="Conferences, workshops, concerts and meetups. Reserve a seat before they’re gone."
      />

      <div className="glass sticky top-20 z-30 mb-8 grid gap-3 rounded-2xl p-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, topic or tag"
            aria-label="Search events"
            className="pl-9"
          />
        </div>
        <Select value={when} onValueChange={(v) => update({ when: v === 'upcoming' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WHEN.map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => update({ sort: v === 'date' ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        <CategoryChip active={!category} onClick={() => update({ category: undefined })}>
          All categories
        </CategoryChip>
        {CATEGORIES.map((c) => {
          const { label, icon: Icon } = CATEGORY_META[c]
          return (
            <CategoryChip key={c} active={category === c} onClick={() => update({ category: category === c ? undefined : c })}>
              <Icon className="size-3.5" aria-hidden="true" /> {label}
            </CategoryChip>
          )
        })}
      </div>

      {isError ? (
        <EmptyState
          icon={CalendarSearch}
          title="Events couldn’t be loaded"
          description={getErrorMessage(error)}
          action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
        />
      ) : isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : data.events.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events match these filters"
          description="Try a different search term or category, or include past events."
          action={
            hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X data-icon="inline-start" /> Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {data.pagination.total} {data.pagination.total === 1 ? 'event' : 'events'}
          </p>
          <div className={cn('grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3', isPlaceholderData && 'opacity-60')}>
            {data.events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          <Pager pagination={data.pagination} onChange={(p) => update({ page: String(p) }, false)} />
        </>
      )}
    </div>
  )
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active
          ? 'border-transparent bg-moon font-medium text-night'
          : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
