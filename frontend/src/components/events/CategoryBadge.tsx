import { cn } from '@/lib/utils'
import type { Category } from '@/types/api'
import { CATEGORY_META } from './categories'

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const { label, icon: Icon, hue } = CATEGORY_META[category]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md',
        className,
      )}
      style={{ color: hue, borderColor: `${hue}40`, backgroundColor: `color-mix(in oklab, ${hue} 14%, rgb(13 11 30 / 0.6))` }}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
