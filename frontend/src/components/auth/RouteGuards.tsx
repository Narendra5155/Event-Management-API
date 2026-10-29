import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '@/components/Spinner'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types/api'

/** Renders child routes only for signed-in users (optionally with one of `roles`). */
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/**
 * Keeps signed-in users away from the login and signup pages. This is also what moves
 * people on after they log in or sign up: back to where they came from, or somewhere sensible.
 */
export function GuestOnly() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (user) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    const isSignup = location.pathname.startsWith('/signup')
    const fallback = !isSignup ? '/dashboard' : user.role === 'attendee' ? '/events' : '/events/new'
    return <Navigate to={from ?? fallback} replace />
  }
  return <Outlet />
}
