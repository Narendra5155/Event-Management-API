import { cn } from '@/lib/utils'

interface CapacityBarProps {
  registered: number
  capacity: number
  className?: string
  showLabel?: boolean
}

export function CapacityBar({ registered, capacity, className, showLabel = true }: CapacityBarProps) {
  const ratio = capacity ? Math.min(1, registered / capacity) : 0
  const left = Math.max(0, capacity - registered)
  const almostGone = left > 0 && ratio >= 0.85

  return (
    <div className={cn('grid gap-2', className)}>
      {showLabel && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="tabular-nums text-moon">
            {registered.toLocaleString()} <span className="text-muted-foreground">of {capacity.toLocaleString()} seats taken</span>
          </span>
          <span className={cn('text-xs font-medium tabular-nums', left === 0 ? 'text-destructive' : almostGone ? 'text-amber' : 'text-muted-foreground')}>
            {left === 0 ? 'Sold out' : `${left.toLocaleString()} left`}
          </span>
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={registered}
        aria-label="Seats taken"
      >
        <div className="h-full rounded-full bg-stage transition-[width] duration-700 ease-out" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}
