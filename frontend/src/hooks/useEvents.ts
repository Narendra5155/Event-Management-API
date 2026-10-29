import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { queryKeys } from '@/lib/queryClient'
import type { EventDetail, EventListParams, EventPayload, EventStatus } from '@/types/api'

export function useEvents(params: EventListParams) {
  return useQuery({
    queryKey: queryKeys.events(params),
    queryFn: () => eventsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.event(id ?? ''),
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  })
}

export function useMyEvents(params: { page?: number; limit?: number; status?: EventStatus }) {
  return useQuery({
    queryKey: queryKeys.myEvents(params),
    queryFn: () => eventsApi.mine(params),
    placeholderData: keepPreviousData,
  })
}

export function useAttendees(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendees(id ?? ''),
    queryFn: () => eventsApi.attendees(id!),
    enabled: Boolean(id),
  })
}

export function useMyRegistrations() {
  return useQuery({ queryKey: queryKeys.registrations, queryFn: eventsApi.myRegistrations })
}

export function useSaveEvent(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EventPayload) => (id ? eventsApi.update(id, payload) : eventsApi.create(payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations })
    },
  })
}

/** Reserve or release a seat, updating the cached event immediately with the server's new count. */
export function useSeat(id: string) {
  const queryClient = useQueryClient()

  const patchDetail = (registeredCount: number, isRegistered: boolean) =>
    queryClient.setQueryData<EventDetail>(queryKeys.event(id), (old) =>
      old ? { ...old, registeredCount, isRegistered } : old,
    )
  const refreshRelated = () => {
    queryClient.invalidateQueries({ queryKey: ['events', 'list'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.registrations })
    queryClient.invalidateQueries({ queryKey: queryKeys.event(id) })
  }

  const reserve = useMutation({
    mutationFn: () => eventsApi.register(id),
    onSuccess: ({ registeredCount }) => {
      patchDetail(registeredCount, true)
      refreshRelated()
    },
  })
  const release = useMutation({
    mutationFn: () => eventsApi.cancelRegistration(id),
    onSuccess: ({ registeredCount }) => {
      patchDetail(registeredCount, false)
      refreshRelated()
    },
  })
  return { reserve, release }
}
