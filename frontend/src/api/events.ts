import { api } from '@/lib/api'
import type {
  ApiResponse,
  Attendee,
  EventDetail,
  EventListParams,
  EventPayload,
  EventStatus,
  EventSummary,
  OrganizerStats,
  Pagination,
  Registration,
} from '@/types/api'

type SeatResult = { registeredCount: number; capacity: number }

export const eventsApi = {
  list: (params: EventListParams) =>
    api
      .get<ApiResponse<{ events: EventSummary[]; pagination: Pagination }>>('/events', { params })
      .then((r) => r.data.data),
  get: (id: string) =>
    api.get<ApiResponse<{ event: EventDetail }>>(`/events/${id}`).then((r) => r.data.data.event),
  mine: (params: { page?: number; limit?: number; status?: EventStatus }) =>
    api
      .get<
        ApiResponse<{ events: EventSummary[]; pagination: Pagination; stats: OrganizerStats }>
      >('/events/mine', { params })
      .then((r) => r.data.data),
  create: (payload: EventPayload) =>
    api.post<ApiResponse<{ event: EventSummary }>>('/events', payload).then((r) => r.data.data.event),
  update: (id: string, payload: Partial<EventPayload>) =>
    api
      .patch<ApiResponse<{ event: EventSummary }>>(`/events/${id}`, payload)
      .then((r) => r.data.data.event),
  remove: (id: string) => api.delete(`/events/${id}`),
  register: (id: string) =>
    api.post<ApiResponse<SeatResult>>(`/events/${id}/register`).then((r) => r.data.data),
  cancelRegistration: (id: string) =>
    api.delete<ApiResponse<SeatResult>>(`/events/${id}/register`).then((r) => r.data.data),
  attendees: (id: string) =>
    api
      .get<
        ApiResponse<{
          event: Pick<EventSummary, '_id' | 'title' | 'capacity' | 'registeredCount' | 'startDate'>
          attendees: Attendee[]
        }>
      >(`/events/${id}/attendees`)
      .then((r) => r.data.data),
  myRegistrations: () =>
    api
      .get<ApiResponse<{ registrations: Registration[] }>>('/users/me/registrations')
      .then((r) => r.data.data.registrations),
}
