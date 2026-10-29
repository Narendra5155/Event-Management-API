import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        // Client errors won't fix themselves on retry.
        if (status && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

export const queryKeys = {
  me: ['auth', 'me'] as const,
  sessions: ['auth', 'sessions'] as const,
  events: (params: object) => ['events', 'list', params] as const,
  event: (id: string) => ['events', 'detail', id] as const,
  myEvents: (params: object) => ['events', 'mine', params] as const,
  attendees: (id: string) => ['events', 'attendees', id] as const,
  registrations: ['registrations'] as const,
  users: (params: object) => ['users', params] as const,
}
