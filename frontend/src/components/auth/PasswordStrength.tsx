import { Check } from 'lucide-react'
import { PASSWORD_RULES } from '@/schemas/auth'
import { cn } from '@/lib/utils'

const LEVELS = [
  { label: 'Too weak', color: 'bg-destructive' },
  { label: 'Weak', color: 'bg-destructive' },
  { label: 'Fair', color: 'bg-amber' },
  { label: 'Good', color: 'bg-magenta' },
  { label: 'Strong', color: 'bg-emerald-400' },
]

function score(password: string) {
  if (!password) return 0
  let points = PASSWORD_RULES.filter((rule) => rule.test(password)).length
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) points += 1
  return points
}

export function PasswordStrength({ password }: { password: string }) {
  const points = score(password)
  const level = LEVELS[points]

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1 rounded-full transition-colors duration-300',
                points >= step ? level.color : 'bg-white/10',
              )}
            />
          ))}
        </div>
        <span className="w-16 text-right text-xs text-muted-foreground" aria-live="polite">
          {password ? level.label : ''}
        </span>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password)
          return (
            <li key={rule.id} className={cn('flex items-center gap-1.5', met ? 'text-moon' : 'text-muted-foreground')}>
              <Check className={cn('size-3.5', met ? 'text-emerald-400' : 'opacity-30')} aria-hidden="true" />
              {rule.label}
              <span className="sr-only">{met ? '(done)' : '(missing)'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
