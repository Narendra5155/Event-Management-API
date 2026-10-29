import { z } from 'zod'

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})
export type LoginValues = z.infer<typeof loginSchema>

// Mirrors the API's Joi rules so most mistakes are caught before a round trip.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'case', label: 'Upper and lowercase letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
] as const

export const signupSchema = z
  .object({
    role: z.enum(['attendee', 'organizer']),
    name: z.string().trim().min(2, 'Enter at least 2 characters').max(60, 'Keep it under 60 characters'),
    email,
    password: z
      .string()
      .max(128, 'Keep it under 128 characters')
      .refine((v) => PASSWORD_RULES.every((rule) => rule.test(v)), {
        message: 'Use 8+ characters with upper and lowercase letters and a number',
      }),
    confirmPassword: z.string().min(1, 'Re-enter your password'),
    terms: z.boolean().refine(Boolean, 'Accept the terms to create an account'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords don’t match',
  })
export type SignupValues = z.infer<typeof signupSchema>
