import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/api'
import { CATEGORY_META } from './categories'

interface EventCoverProps {
  src?: string
  category: Category
  alt?: string
  className?: string
  /** Placement of the fallback icon, e.g. tucked into a corner when text sits on top. */
  iconClassName?: string
}

/** Cover photo with a category-tinted fallback when there's no image or it fails to load. */
export function EventCover({ src, category, alt = '', className, iconClassName }: EventCoverProps) {
  const [failed, setFailed] = useState(false)
  const { icon: Icon, hue } = CATEGORY_META[category]

  if (!src || failed) {
    return (
      <div
        className={cn('relative grid place-items-center', className)}
        style={{
          backgroundImage: `radial-gradient(120% 90% at 20% 10%, ${hue}55, transparent 60%), radial-gradient(90% 80% at 90% 100%, #7C5CFF44, transparent 60%), linear-gradient(#1a1634, #120f26)`,
        }}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      >
        <Icon className={cn('size-10 opacity-60', iconClassName)} style={{ color: hue }} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
