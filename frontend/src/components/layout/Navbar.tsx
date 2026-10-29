import { Menu, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )

export function Navbar() {
  const { user, hasRole } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/events', label: 'Events', show: true },
    { to: '/dashboard', label: 'Dashboard', show: Boolean(user) },
    { to: '/admin/users', label: 'Users', show: hasRole('admin') },
  ].filter((l) => l.show)

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/dashboard'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {hasRole('organizer', 'admin') && (
            <Button asChild variant="stage" size="sm" className="hidden sm:inline-flex">
              <Link to="/events/new">
                <Plus data-icon="inline-start" /> Create event
              </Link>
            </Button>
          )}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="stage" size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong w-72 border-l-white/10">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Mobile">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                    {l.label}
                  </NavLink>
                ))}
                {hasRole('organizer', 'admin') && (
                  <NavLink to="/events/new" className={linkClass} onClick={() => setOpen(false)}>
                    Create event
                  </NavLink>
                )}
                {!user && (
                  <div className="mt-4 grid gap-2">
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild variant="stage" onClick={() => setOpen(false)}>
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
