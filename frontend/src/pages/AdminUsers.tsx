import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Pager } from '@/components/Pager'
import { PageLoader } from '@/components/Spinner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatar } from '@/components/layout/UserMenu'
import { useAuth } from '@/hooks/useAuth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useUpdateRole, useUsers } from '@/hooks/useUsers'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/api'

const ROLES: { value: Role; label: string }[] = [
  { value: 'attendee', label: 'Attendee' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'admin', label: 'Admin' },
]

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | 'all'>('all')
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search.trim())

  const { data, isPending, isPlaceholderData } = useUsers({
    page,
    limit: 20,
    search: debounced || undefined,
    role: role === 'all' ? undefined : role,
  })
  const updateRole = useUpdateRole()

  const changeRole = (id: string, name: string, next: Role) =>
    updateRole.mutate(
      { id, role: next },
      {
        onSuccess: () => toast.success(`${name} is now ${ROLES.find((r) => r.value === next)?.label.toLowerCase()}`),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )

  return (
    <div>
      <PageHeader title="Users" description="Change what people can do. Role changes take effect on their next request." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v as Role | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending || !data ? (
        <PageLoader />
      ) : (
        <>
          <div className={cn('glass overflow-hidden rounded-2xl transition-opacity', isPlaceholderData && 'opacity-60')}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">User</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="w-44 pr-5">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u) => {
                  const isMe = u._id === me?._id
                  return (
                    <TableRow key={u._id}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} className="size-8 text-xs" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {u.name} {isMe && <span className="text-muted-foreground">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="pr-5">
                        <Select value={u.role} onValueChange={(v) => changeRole(u._id, u.name, v as Role)} disabled={isMe || updateRole.isPending}>
                          <SelectTrigger size="sm" className="w-36" aria-label={`Role for ${u.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {data.users.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No users match these filters.</p>}
          </div>
          <Pager pagination={data.pagination} onChange={setPage} />
        </>
      )}
    </div>
  )
}
