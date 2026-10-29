import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router'
import { toast } from 'sonner'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { FormAlert } from '@/components/FormAlert'
import { FormField } from '@/components/FormField'
import { fieldA11y } from '@/lib/fieldA11y'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/useAuth'
import { applyFieldErrors, getErrorMessage, hasFieldErrors } from '@/lib/errors'
import { loginSchema, type LoginValues } from '@/schemas/auth'

const DEMO_ACCOUNTS = [
  { label: 'Attendee', email: 'attendee@eventsphere.dev', password: 'Attendee@1234' },
  { label: 'Organizer', email: 'organizer@eventsphere.dev', password: 'Organizer@1234' },
  { label: 'Admin', email: 'admin@eventsphere.dev', password: 'Admin@1234' },
]
const showDemoAccounts = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true'

export default function Login() {
  const location = useLocation()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  // GuestOnly redirects as soon as the user is set, so this form unmounts on success.
  // mutateAsync still resolves after unmount, unlike per-call mutate callbacks.
  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login.mutateAsync(values)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
    } catch (error) {
      applyFieldErrors(error, setError)
    }
  })

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setValue('email', account.email, { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
  }

  // Field-level errors are shown inline; only surface the rest (e.g. wrong password) as a banner.
  const bannerError = login.isError && !hasFieldErrors(login.error) ? getErrorMessage(login.error) : null

  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Welcome back</h1>
      <p className="mt-3 text-muted-foreground">Log in to see your tickets and manage your events.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        <FormAlert message={bannerError} />

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            {...fieldA11y('email', errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11"
            autoFocus
            {...register('email')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            {...fieldA11y('password', errors.password?.message)}
            autoComplete="current-password"
            placeholder="Your password"
            className="h-11"
            {...register('password')}
          />
        </FormField>

        <Button type="submit" variant="stage" size="lg" className="mt-1 w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Spinner /> Logging in
            </>
          ) : (
            'Log in'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to EventSphere?{' '}
        <Link to="/signup" state={location.state} className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      {showDemoAccounts && (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 p-4">
          <p className="text-sm font-medium">Try a demo account</p>
          <p className="mt-1 text-xs text-muted-foreground">Fills in the form with a seeded user.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button key={account.label} type="button" size="sm" variant="outline" onClick={() => fillDemo(account)}>
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
