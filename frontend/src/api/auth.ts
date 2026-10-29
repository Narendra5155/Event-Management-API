import { isAxiosError } from 'axios'
import { api } from '@/lib/api'
import type { ApiResponse, Role, Session, User } from '@/types/api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
  role: Exclude<Role, 'admin'>
}

type UserResponse = ApiResponse<{ user: User }>

export const authApi = {
  /** Resolves to null for signed-out visitors instead of throwing. */
  async me() {
    try {
      const { data } = await api.get<UserResponse>('/auth/me')
      return data.data.user
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) return null
      throw error
    }
  },
  login: (input: LoginInput) => api.post<UserResponse>('/auth/login', input).then((r) => r.data.data.user),
  register: (input: RegisterInput) =>
    api.post<UserResponse>('/auth/register', input).then((r) => r.data.data.user),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  sessions: () =>
    api.get<ApiResponse<{ sessions: Session[] }>>('/auth/sessions').then((r) => r.data.data.sessions),
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
}
