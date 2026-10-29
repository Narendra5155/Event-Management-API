import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden="true" className={cn('size-4 animate-spin', className)} />
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <Spinner className="size-6 text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
