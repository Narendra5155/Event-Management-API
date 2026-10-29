import { zodResolver } from '@hookform/resolvers/zod'
import { Megaphone, Ticket } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { FormAlert } from '@/components/FormAlert'
import { FormField } from '@/components/FormField'
import { fieldA11y } from '@/lib/fieldA11y'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useRegister } from '@/hooks/useAuth'
import { applyFieldErrors, getErrorMessage, hasFieldErrors } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { signupSchema, type SignupValues } from '@/schemas/auth'

const ROLE_OPTIONS = [
  { value: 'attendee', icon: Ticket, title: 'I’m attending', body: 'Find events and reserve seats' },
  { value: 'organizer', icon: Megaphone, title: 'I’m organizing', body: 'Publish events, track sign-ups' },
] as const

export default function Signup() {
  const location = useLocation()
  const [params] = useSearchParams()
  const registerUser = useRegister()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: params.get('role') === 'organizer' ? 'organizer' : 'attendee',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })
  const password = useWatch({ control, name: 'password' })

  // GuestOnly handles the redirect once the new user is set (see Login for why mutateAsync).
  const onSubmit = handleSubmit(async ({ name, email, password, role }) => {
    try {
      const user = await registerUser.mutateAsync({ name, email, password, role })
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`)
    } catch (error) {
      applyFieldErrors(error, setError)
    }
  })

  const bannerError =
    registerUser.isError && !hasFieldErrors(registerUser.error) ? getErrorMessage(registerUser.error) : null

  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Create your account</h1>
      <p className="mt-3 text-muted-foreground">Pick how you’ll use EventSphere. You can attend events either way.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        <FormAlert message={bannerError} />

        <fieldset>
          <legend className="sr-only">Account type</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3" role="radiogroup">
                {ROLE_OPTIONS.map(({ value, icon: Icon, title, body }) => {
                  const selected = field.value === value
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                        selected
                          ? 'border-magenta/60 bg-magenta/[0.08]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={selected}
                        onChange={() => field.onChange(value)}
                        className="sr-only"
                      />
                      <Icon className={cn('size-5', selected ? 'text-magenta' : 'text-muted-foreground')} aria-hidden="true" />
                      <span className="text-sm font-semibold">{title}</span>
                      <span className="text-xs leading-snug text-muted-foreground">{body}</span>
                    </label>
                  )
                })}
              </div>
            )}
          />
        </fieldset>

        <FormField id="name" label="Full name" error={errors.name?.message}>
          <Input {...fieldA11y('name', errors.name?.message)} autoComplete="name" placeholder="Jordan Lee" className="h-11" {...register('name')} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            {...fieldA11y('email', errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11"
            {...register('email')}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            {...fieldA11y('password', errors.password?.message)}
            autoComplete="new-password"
            placeholder="Create a password"
            className="h-11"
            {...register('password')}
          />
        </FormField>
        <PasswordStrength password={password} />

        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput
            {...fieldA11y('confirmPassword', errors.confirmPassword?.message)}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="h-11"
            {...register('confirmPassword')}
          />
        </FormField>

        <div className="grid gap-1.5">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby="terms-msg"
                  className="mt-0.5"
                />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
            )}
          />
          {errors.terms && (
            <p id="terms-msg" className="pl-7 text-[0.8rem] text-destructive">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button type="submit" variant="stage" size="lg" className="mt-1 w-full" disabled={registerUser.isPending}>
          {registerUser.isPending ? (
            <>
              <Spinner /> Creating account
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
