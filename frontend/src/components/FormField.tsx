import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}

/** Label, control and message. Give the control aria-describedby={`${id}-msg`}. */
export function FormField({ id, label, error, hint, action, className, children }: FormFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-[0.85rem] font-medium text-moon/90">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-[0.8rem] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-msg`} className="text-[0.8rem] text-muted-foreground">
          {hint}
        </div>
      ) : null}
    </div>
  )
}
