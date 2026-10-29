import { ArrowLeft, Download, Search, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { CapacityBar } from '@/components/events/CapacityBar'
import { PageLoader } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAttendees } from '@/hooks/useEvents'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, formatRelative } from '@/lib/format'
import type { Attendee } from '@/types/api'

const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`

function downloadCsv(title: string, attendees: Attendee[]) {
  const rows = [
    ['Name', 'Email', 'Reserved at'],
    ...attendees.map((a) => [a.user?.name ?? 'Deleted user', a.user?.email ?? '', new Date(a.createdAt).toISOString()]),
  ]
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-attendees.csv`,
  })
  link.click()
  URL.revokeObjectURL(url)
}

export default function Attendees() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useAttendees(id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!data || !q) return data?.attendees ?? []
    return data.attendees.filter(
      (a) => a.user?.name.toLowerCase().includes(q) || a.user?.email.toLowerCase().includes(q),
    )
  }, [data, query])

  if (isPending) return <PageLoader />
  if (isError) {
    return (
      <EmptyState
        icon={UsersRound}
        title="Attendees couldn’t be loaded"
        description={getErrorMessage(error)}
        action={<Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>}
      />
    )
  }

  const { event, attendees } = data

  return (
    <div>
      <Link to={`/events/${event._id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to event
      </Link>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Attendees</h1>
          <p className="mt-3 text-muted-foreground">
            {event.title}, {formatDate(event.startDate)}
          </p>
        </div>
        <Button variant="outline" disabled={attendees.length === 0} onClick={() => downloadCsv(event.title, attendees)}>
          <Download data-icon="inline-start" /> Download CSV
        </Button>
      </div>

      <div className="glass mb-6 rounded-2xl p-5">
        <CapacityBar registered={event.registeredCount} capacity={event.capacity} />
      </div>

      {attendees.length === 0 ? (
        <EmptyState icon={UsersRound} title="No one has reserved yet" description="Share the event page. Reservations will appear here as they come in." />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" aria-label="Search attendees" className="pl-9" type="search" />
          </div>
          <div className="glass overflow-hidden rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 pl-5">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="pr-5 text-right">Reserved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, i) => (
                  <TableRow key={a._id}>
                    <TableCell className="pl-5 text-muted-foreground tabular-nums">{i + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium">{a.user?.name ?? 'Deleted user'}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{a.user?.email}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{a.user?.email}</TableCell>
                    <TableCell className="pr-5 text-right text-muted-foreground">{formatRelative(a.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No attendees match “{query}”.</p>}
          </div>
        </>
      )}
    </div>
  )
}
