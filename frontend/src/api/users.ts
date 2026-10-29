import { api } from '@/lib/api'
import type { ApiResponse, Pagination, Role, User } from '@/types/api'

export interface UserListParams {
  page?: number
  limit?: number
  role?: Role
  search?: string
}

export const usersApi = {
  list: (params: UserListParams) =>
    api
      .get<ApiResponse<{ users: User[]; pagination: Pagination }>>('/users', { params })
      .then((r) => r.data.data),
  updateRole: (id: string, role: Role) =>
    api.patch<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role }).then((r) => r.data.data.user),
}
