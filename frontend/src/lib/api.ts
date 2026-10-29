import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { queryClient, queryKeys } from './queryClient'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Requests that must never trigger a token refresh (they are the auth flow itself).
const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

let refreshing: Promise<void> | null = null

/**
 * Access tokens are short-lived. When a request comes back 401, refresh once
 * (shared across every request that failed at the same moment) and replay it.
 */
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined

  const shouldRefresh =
    error.response?.status === 401 &&
    original &&
    !original._retried &&
    !NO_REFRESH.some((path) => original.url?.startsWith(path))

  if (!shouldRefresh) throw error

  original._retried = true
  try {
    refreshing ??= api
      .post('/auth/refresh')
      .then(() => undefined)
      .finally(() => {
        refreshing = null
      })
    await refreshing
  } catch {
    // Session is gone; route guards react to the cleared user and send people to /login.
    queryClient.setQueryData(queryKeys.me, null)
    throw error
  }
  return api(original)
})
