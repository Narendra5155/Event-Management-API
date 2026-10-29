import { useId } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  // Unique per instance: a duplicate id inside a hidden element would blank out every copy.
  const gradientId = useId()
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB547" />
          <stop offset=".5" stopColor="#F0459B" />
          <stop offset="1" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="rgb(255 255 255 / 0.06)" />
      <path
        d="M8 10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  )
}

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4', className)}
    >
      <LogoMark />
      <span className="font-heading text-lg font-bold tracking-tight">EventSphere</span>
    </Link>
  )
}
