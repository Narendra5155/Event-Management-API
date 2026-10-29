import { Laptop, LogOut, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { UserAvatar } from '@/components/layout/UserMenu'
import { PageHeader } from '@/components/PageHeader'
import { PageLoader, Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { useAuth, useLogoutAll, useRevokeSession, useSessions } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, formatRelative } from '@/lib/format'
import type { Session } from '@/types/api'

const ROLE_LABEL = { attendee: 'Attendee', organizer: 'Organizer', admin: 'Admin' } as const

/** A readable "Chrome on macOS" from a user-agent string. */
function describeDevice(ua = '') {
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : /curl|node|axios|supertest/i.test(ua)
            ? 'API client'
            : 'Unknown browser'
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : null
  return { label: os ? `${browser} on ${os}` : browser, mobile: /Mobile|iPhone|Android/.test(ua) }
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: sessions, isPending } = useSessions()
  const logoutAll = useLogoutAll()

  if (!user) return null

  const handleLogoutAll = () =>
    logoutAll.mutate(undefined, {
      onSuccess: () => {
        toast.success('Logged out on every device')
        navigate('/login', { replace: true })
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    })

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" />

      <section className="glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center" aria-label="Account">
        <UserAvatar user={user} className="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold">{user.name}</h2>
          <p className="truncate text-muted-foreground">{user.email}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:text-right">
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium">{ROLE_LABEL[user.role]}</dd>
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="font-medium">{formatDate(user.createdAt)}</dd>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="sessions-heading">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="sessions-heading" className="text-2xl font-semibold">
              Where you’re logged in
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Log out of devices you don’t recognise. Each session stays active for 7 days after its last use.
            </p>
          </div>
          <ConfirmDialog
            trigger={
              <Button variant="destructive" disabled={logoutAll.isPending}>
                {logoutAll.isPending ? <Spinner /> : <LogOut data-icon="inline-start" />} Log out everywhere
              </Button>
            }
            title="Log out on every device?"
            description="All sessions, including this one, will end. You’ll need to log in again."
            confirmLabel="Log out everywhere"
            cancelLabel="Cancel"
            destructive
            onConfirm={handleLogoutAll}
          />
        </div>

        {isPending ? (
          <PageLoader />
        ) : (
          <ul className="glass divide-y divide-white/[0.06] rounded-2xl">
            {sessions?.map((s) => <SessionRow key={s._id} session={s} />)}
          </ul>
        )}
      </section>
    </div>
  )
}

function SessionRow({ session }: { session: Session }) {
  const revoke = useRevokeSession()
  const { label, mobile } = describeDevice(session.userAgent)
  const Icon = mobile ? Smartphone : Laptop

  return (
    <li className="flex items-center gap-4 p-4 sm:px-5">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {label}
          {session.current && (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">This device</span>
          )}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {session.ip ? `${session.ip}, ` : ''}active {formatRelative(session.lastUsedAt)}
        </p>
      </div>
      {!session.current && (
        <Button
          variant="outline"
          size="sm"
          disabled={revoke.isPending}
          onClick={() =>
            revoke.mutate(session._id, {
              onSuccess: () => toast.success(`Logged out ${label}`),
              onError: (err) => toast.error(getErrorMessage(err)),
            })
          }
        >
          {revoke.isPending && <Spinner />} Log out
        </Button>
      )}
    </li>
  )
}
