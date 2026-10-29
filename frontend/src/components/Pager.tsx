import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Pagination } from '@/types/api'

export function Pager({ pagination, onChange }: { pagination?: Pagination; onChange: (page: number) => void }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages } = pagination
  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft data-icon="inline-start" /> Previous
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight data-icon="inline-end" />
      </Button>
    </nav>
  )
}
