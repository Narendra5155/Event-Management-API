import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { LogoMark } from '@/components/brand/Logo'
import { Navbar } from './Navbar'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-popover px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6" />
            <span>EventSphere, {new Date().getFullYear()}</span>
          </div>
          <nav className="flex gap-5" aria-label="Footer">
            <Link to="/events" className="hover:text-foreground">
              Browse events
            </Link>
            <Link to="/signup?role=organizer" className="hover:text-foreground">
              Host an event
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
