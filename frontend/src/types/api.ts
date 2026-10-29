export type Role = 'attendee' | 'organizer' | 'admin'

export const CATEGORIES = [
  'conference',
  'workshop',
  'meetup',
  'concert',
  'sports',
  'festival',
  'other',
] as const
export type Category = (typeof CATEGORIES)[number]

export type EventStatus = 'draft' | 'published' | 'cancelled'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorBody {
  success: false
  message: string
  errors?: { field: string; message: string }[]
}

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface Venue {
  name?: string
  address?: string
  city?: string
}

export interface EventSummary {
  _id: string
  title: string
  category: Category
  venue: Venue
  isOnline: boolean
  startDate: string
  endDate: string
  capacity: number
  registeredCount: number
  price: number
  coverImage?: string
  tags: string[]
  status: EventStatus
  organizer?: { _id: string; name: string } | string
  createdAt: string
}

export interface EventDetail extends EventSummary {
  description: string
  onlineUrl?: string
  organizer: { _id: string; name: string }
  isRegistered: boolean
  canManage: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface EventListParams {
  page?: number
  limit?: number
  search?: string
  category?: Category
  city?: string
  when?: 'upcoming' | 'past' | 'all'
  sort?: 'date' | '-date' | 'newest' | 'popular' | 'price'
}

export interface OrganizerStats {
  totalEvents: number
  published: number
  upcoming: number
  totalRegistrations: number
  totalCapacity: number
}

export interface Registration {
  _id: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
  event: EventSummary
}

export interface Attendee {
  _id: string
  createdAt: string
  user: { _id: string; name: string; email: string } | null
}

export interface Session {
  _id: string
  userAgent?: string
  ip?: string
  lastUsedAt: string
  createdAt: string
  expiresAt: string
  current: boolean
}

export interface EventPayload {
  title: string
  description: string
  category: Category
  isOnline: boolean
  venue: Venue
  onlineUrl: string
  startDate: string
  endDate: string
  capacity: number
  price: number
  coverImage: string
  tags: string[]
  status: EventStatus
}
