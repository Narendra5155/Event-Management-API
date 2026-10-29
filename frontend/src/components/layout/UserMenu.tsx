import { LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useAuth'
import { initials } from '@/lib/format'
import type { User } from '@/types/api'

export function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-stage font-semibold text-night">{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
}

export function UserMenu({ user }: { user: User }) {
  const logout = useLogout()
  const navigate = useNavigate()

  // Leave the page first: on a protected page, clearing the user would otherwise
  // redirect to /login and unmount this menu before a mutate callback could run.
  const handleLogout = async () => {
    navigate('/')
    await logout.mutateAsync().catch(() => undefined) // the user is cleared either way
    toast.success('Logged out')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Account menu"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <UserRound /> Profile and sessions
            </Link>
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem asChild>
              <Link to="/admin/users">
                <ShieldCheck /> Manage users
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} disabled={logout.isPending}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
