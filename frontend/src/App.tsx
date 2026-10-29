import { createBrowserRouter } from 'react-router'
import { GuestOnly, RequireAuth } from '@/components/auth/RouteGuards'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { PageLoader } from '@/components/Spinner'
import Landing from '@/pages/Landing'
import RouteError from '@/pages/RouteError'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'

// First-visit pages ship in the main bundle; everything else loads when it's opened.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    HydrateFallback: PageLoader,
    errorElement: <RouteError />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/signup', element: <Signup /> },
        ],
      },
    ],
  },
  {
    element: <AppShell />,
    HydrateFallback: PageLoader,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/events', lazy: page(() => import('@/pages/Events')) },
      { path: '/events/:id', lazy: page(() => import('@/pages/EventDetail')) },
      {
        element: <RequireAuth />,
        children: [
          { path: '/dashboard', lazy: page(() => import('@/pages/Dashboard')) },
          { path: '/profile', lazy: page(() => import('@/pages/Profile')) },
        ],
      },
      {
        element: <RequireAuth roles={['organizer', 'admin']} />,
        children: [
          { path: '/events/new', lazy: page(() => import('@/pages/EventEditor')) },
          { path: '/events/:id/edit', lazy: page(() => import('@/pages/EventEditor')) },
          { path: '/events/:id/attendees', lazy: page(() => import('@/pages/Attendees')) },
        ],
      },
      {
        element: <RequireAuth roles={['admin']} />,
        children: [{ path: '/admin/users', lazy: page(() => import('@/pages/AdminUsers')) }],
      },
      { path: '*', lazy: page(() => import('@/pages/NotFound')) },
    ],
  },
])
