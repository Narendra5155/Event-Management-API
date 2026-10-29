import { format, formatDistanceToNowStrict, isSameDay } from 'date-fns'
import type { EventSummary } from '@/types/api'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

export const formatPrice = (price: number) => (price === 0 ? 'Free' : currency.format(price))

export const formatDate = (iso: string) => format(new Date(iso), 'EEE, MMM d, yyyy')
export const formatShortDate = (iso: string) => format(new Date(iso), 'MMM d')
export const formatTime = (iso: string) => format(new Date(iso), 'h:mm a')
export const formatRelative = (iso: string) =>
  Date.now() - new Date(iso).getTime() < 60_000
    ? 'just now'
    : formatDistanceToNowStrict(new Date(iso), { addSuffix: true })

export function formatEventWhen(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (isSameDay(start, end)) {
    return `${format(start, 'EEE, MMM d')}, ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
  }
  return `${format(start, 'MMM d, h:mm a')} – ${format(end, 'MMM d, h:mm a')}`
}

export function formatLocation(event: Pick<EventSummary, 'isOnline' | 'venue'>) {
  if (event.isOnline) return 'Online'
  return [event.venue?.name, event.venue?.city].filter(Boolean).join(', ')
}

export const seatsLeft = (event: Pick<EventSummary, 'capacity' | 'registeredCount'>) =>
  Math.max(0, event.capacity - event.registeredCount)

export const isPast = (iso: string) => new Date(iso).getTime() < Date.now()

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/** datetime-local inputs work in local time without a timezone suffix. */
export const toDateTimeLocal = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
