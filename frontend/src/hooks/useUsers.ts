import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi, type UserListParams } from '@/api/users'
import { queryKeys } from '@/lib/queryClient'
import type { Role } from '@/types/api'

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
