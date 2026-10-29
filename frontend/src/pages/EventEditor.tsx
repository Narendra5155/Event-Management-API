import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CalendarX2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { EmptyState } from '@/components/EmptyState'
import { CATEGORY_META } from '@/components/events/categories'
import { EventCover } from '@/components/events/EventCover'
import { FormAlert } from '@/components/FormAlert'
import { FormField } from '@/components/FormField'
import { fieldA11y } from '@/lib/fieldA11y'
import { PageLoader, Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useEvent, useSaveEvent } from '@/hooks/useEvents'
import { applyFieldErrors, getErrorMessage, hasFieldErrors } from '@/lib/errors'
import { toDateTimeLocal } from '@/lib/format'
import { eventFormSchema, type EventFormValues } from '@/schemas/event'
import { CATEGORIES, type EventDetail, type EventPayload } from '@/types/api'

const EMPTY: EventFormValues = {
  title: '',
  description: '',
  category: 'conference',
  isOnline: false,
  venueName: '',
  venueAddress: '',
  venueCity: '',
  onlineUrl: '',
  startDate: '',
  endDate: '',
  capacity: 50,
  price: 0,
  coverImage: '',
  tags: '',
  status: 'published',
}

const toFormValues = (e: EventDetail): EventFormValues => ({
  title: e.title,
  description: e.description,
  category: e.category,
  isOnline: e.isOnline,
  venueName: e.venue?.name ?? '',
  venueAddress: e.venue?.address ?? '',
  venueCity: e.venue?.city ?? '',
  onlineUrl: e.onlineUrl ?? '',
  startDate: toDateTimeLocal(e.startDate),
  endDate: toDateTimeLocal(e.endDate),
  capacity: e.capacity,
  price: e.price,
  coverImage: e.coverImage ?? '',
  tags: e.tags.join(', '),
  status: e.status,
})

const toPayload = (v: EventFormValues): EventPayload => ({
  title: v.title,
  description: v.description,
  category: v.category,
  isOnline: v.isOnline,
  venue: v.isOnline ? {} : { name: v.venueName, address: v.venueAddress, city: v.venueCity },
  onlineUrl: v.isOnline ? v.onlineUrl : '',
  startDate: new Date(v.startDate).toISOString(),
  endDate: new Date(v.endDate).toISOString(),
  capacity: v.capacity,
  price: v.price,
  coverImage: v.coverImage,
  tags: [...new Set(v.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10),
  status: v.status,
})

// API field paths that differ from form field names.
const FIELD_MAP = { 'venue.name': 'venueName', 'venue.city': 'venueCity', 'venue.address': 'venueAddress', venue: 'venueName' } as const

export default function EventEditor() {
  const { id } = useParams()
  const { data: event, isPending, isError, error } = useEvent(id)

  if (id && isPending) return <PageLoader />
  if (id && isError) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="This event couldn’t be loaded"
        description={getErrorMessage(error)}
        action={<Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>}
      />
    )
  }
  if (event && !event.canManage) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="You can’t edit this event"
        description="Only the organizer who created it, or an admin, can make changes."
        action={<Button asChild variant="outline"><Link to={`/events/${event._id}`}>View event</Link></Button>}
      />
    )
  }

  // Keyed so the form re-initialises if the route switches between events.
  return <EventForm key={id ?? 'new'} event={event} />
}

function EventForm({ event }: { event?: EventDetail }) {
  const navigate = useNavigate()
  const save = useSaveEvent(event?._id)
  const isNew = !event

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? toFormValues(event) : EMPTY,
  })
  const [isOnline, coverImage, category, status] = useWatch({ control, name: ['isOnline', 'coverImage', 'category', 'status'] })

  const onSubmit = handleSubmit((values) => {
    if (isNew && new Date(values.startDate) <= new Date()) {
      setError('startDate', { message: 'Pick a time in the future' })
      return
    }
    save.mutate(toPayload(values), {
      onSuccess: (saved) => {
        toast.success(isNew ? (values.status === 'draft' ? 'Draft saved' : 'Event published') : 'Changes saved')
        navigate(`/events/${saved._id}`)
      },
      onError: (err) => applyFieldErrors(err, setError, FIELD_MAP),
    })
  })

  const submitLabel = !isNew ? 'Save changes' : status === 'draft' ? 'Save draft' : 'Publish event'
  const bannerError = save.isError && !hasFieldErrors(save.error) ? getErrorMessage(save.error) : null
  const err = (name: keyof EventFormValues) => errors[name]?.message

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={event ? `/events/${event._id}` : '/dashboard'}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {event ? 'Back to event' : 'Back to dashboard'}
      </Link>
      <h1 className="font-display text-5xl font-bold">{isNew ? 'New event' : 'Edit event'}</h1>
      <p className="mt-3 text-muted-foreground">
        {isNew ? 'Fill in the details. You can keep it as a draft until you’re ready.' : event.title}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-6">
        <FormAlert message={bannerError} />

        <Section title="Basics">
          <FormField id="title" label="Event name" error={err('title')}>
            <Input {...fieldA11y('title', err('title'))} placeholder="Future of Web Summit" {...register('title')} />
          </FormField>
          <FormField id="category" label="Category" error={err('category')}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="w-full" aria-describedby="category-msg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField id="description" label="Description" error={err('description')} hint="What will people do, see or learn? Line breaks are kept.">
            <Textarea {...fieldA11y('description', err('description'))} rows={6} {...register('description')} />
          </FormField>
        </Section>

        <Section title="Date and time">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="startDate" label="Starts" error={err('startDate')}>
              <Input {...fieldA11y('startDate', err('startDate'))} type="datetime-local" {...register('startDate')} />
            </FormField>
            <FormField id="endDate" label="Ends" error={err('endDate')}>
              <Input {...fieldA11y('endDate', err('endDate'))} type="datetime-local" {...register('endDate')} />
            </FormField>
          </div>
        </Section>

        <Section title="Location">
          <Controller
            control={control}
            name="isOnline"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.03] px-4 py-3">
                <span>
                  <span className="block text-sm font-medium">Online event</span>
                  <span className="block text-xs text-muted-foreground">Attendees get the link after reserving</span>
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          {isOnline ? (
            <FormField id="onlineUrl" label="Event link" error={err('onlineUrl')} hint="Zoom, Meet, YouTube, or any https link">
              <Input {...fieldA11y('onlineUrl', err('onlineUrl'))} type="url" placeholder="https://" {...register('onlineUrl')} />
            </FormField>
          ) : (
            <>
              <FormField id="venueName" label="Venue" error={err('venueName')}>
                <Input {...fieldA11y('venueName', err('venueName'))} placeholder="Moscone Center West" {...register('venueName')} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                <FormField id="venueAddress" label="Street address" error={err('venueAddress')}>
                  <Input {...fieldA11y('venueAddress', err('venueAddress'))} placeholder="800 Howard St" {...register('venueAddress')} />
                </FormField>
                <FormField id="venueCity" label="City" error={err('venueCity')}>
                  <Input {...fieldA11y('venueCity', err('venueCity'))} placeholder="San Francisco" {...register('venueCity')} />
                </FormField>
              </div>
            </>
          )}
        </Section>

        <Section title="Seats and price">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="capacity"
              label="Capacity"
              error={err('capacity')}
              hint={event ? `${event.registeredCount} already reserved` : 'Maximum number of attendees'}
            >
              <Input {...fieldA11y('capacity', err('capacity'))} type="number" min={1} inputMode="numeric" {...register('capacity', { valueAsNumber: true })} />
            </FormField>
            <FormField id="price" label="Price (USD)" error={err('price')} hint="Use 0 for a free event">
              <Input {...fieldA11y('price', err('price'))} type="number" min={0} step="0.01" inputMode="decimal" {...register('price', { valueAsNumber: true })} />
            </FormField>
          </div>
        </Section>

        <Section title="Cover and tags">
          <FormField id="coverImage" label="Cover image URL" error={err('coverImage')} hint="A wide photo works best (16:9).">
            <Input {...fieldA11y('coverImage', err('coverImage'))} type="url" placeholder="https://images.unsplash.com/..." {...register('coverImage')} />
          </FormField>
          <EventCover src={coverImage || undefined} category={category} alt="Cover preview" className="aspect-[16/7] w-full rounded-xl" />
          <FormField id="tags" label="Tags" error={err('tags')} hint="Separate with commas, up to 10. Helps people find your event in search.">
            <Input {...fieldA11y('tags', err('tags'))} placeholder="javascript, ai, networking" {...register('tags')} />
          </FormField>
        </Section>

        <Section title="Visibility">
          <FormField id="status" label="Status" error={err('status')}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full sm:w-72">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published: anyone can see and reserve</SelectItem>
                    <SelectItem value="draft">Draft: only you can see it</SelectItem>
                    {!isNew && <SelectItem value="cancelled">Cancelled: visible, reservations closed</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </Section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost" size="lg">
            <Link to={event ? `/events/${event._id}` : '/dashboard'}>Discard</Link>
          </Button>
          <Button type="submit" variant="stage" size="lg" disabled={save.isPending || (!isNew && !isDirty)}>
            {save.isPending && <Spinner />} {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="glass grid gap-5 rounded-2xl p-5 sm:p-7">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden="true" className="text-lg font-semibold">
        {title}
      </h2>
      {children}
    </fieldset>
  )
}
