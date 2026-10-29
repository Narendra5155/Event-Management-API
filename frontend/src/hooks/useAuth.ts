import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { authApi, type LoginInput, type RegisterInput } from '@/api/auth'
import { queryKeys } from '@/lib/queryClient'
import type { Role, User } from '@/types/api'

/**
 * Swap the signed-in user and drop everything cached for the previous one.
 * The `me` query is updated in place (not cleared) so mounted components see the change.
 */
function switchUser(queryClient: QueryClient, user: User | null) {
  queryClient.setQueryData(queryKeys.me, user)
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' })
  queryClient.removeQueries({ queryKey: queryKeys.sessions })
}

export function useAuth() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    staleTime: 5 * 60_000,
  })
  const user = data ?? null
  return {
    user,
    isLoading: isPending,
    hasRole: (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (user) => switchUser(queryClient, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (user) => switchUser(queryClient, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => switchUser(queryClient, null),
  })
}

export function useLogoutAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => switchUser(queryClient, null),
  })
}

export function useSessions() {
  return useQuery({ queryKey: queryKeys.sessions, queryFn: authApi.sessions })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
  })
}
