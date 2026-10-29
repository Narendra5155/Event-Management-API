import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiErrorBody } from '@/types/api'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Can’t reach the server. Check your connection and try again.'
    return error.response.data?.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}

export const getErrorStatus = (error: unknown) =>
  isAxiosError(error) ? error.response?.status : undefined

/**
 * Copies the API's per-field validation errors onto the form.
 * Returns true when at least one field was matched.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Record<string, Path<T>> = {},
) {
  if (!isAxiosError<ApiErrorBody>(error)) return false
  const errors = error.response?.data?.errors ?? []
  let applied = false
  for (const { field, message } of errors) {
    const name = fieldMap[field] ?? (field as Path<T>)
    setError(name, { type: 'server', message })
    applied = true
  }
  return applied
}

/** True when the API rejected specific fields (those are shown inline instead of in a banner). */
export const hasFieldErrors = (error: unknown) =>
  isAxiosError<ApiErrorBody>(error) && Boolean(error.response?.data?.errors?.length)
