import { z } from 'zod'
import { CATEGORIES } from '@/types/api'

const optionalUrl = z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Enter a full URL starting with https://' })])

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Enter at least 3 characters').max(120),
    description: z.string().trim().min(10, 'Describe the event in at least 10 characters').max(5000),
    category: z.enum(CATEGORIES, { error: 'Pick a category' }),
    isOnline: z.boolean(),
    venueName: z.string().trim().max(120),
    venueAddress: z.string().trim().max(200),
    venueCity: z.string().trim().max(80),
    onlineUrl: optionalUrl,
    startDate: z.string().min(1, 'Pick a start date and time'),
    endDate: z.string().min(1, 'Pick an end date and time'),
    capacity: z
      .number({ error: 'Enter how many people can attend' })
      .int('Use a whole number')
      .min(1, 'At least 1 seat')
      .max(100_000, 'Up to 100,000 seats'),
    price: z.number({ error: 'Enter a price, or 0 for free' }).min(0, 'Price can’t be negative').max(100_000),
    coverImage: optionalUrl,
    tags: z.string().max(400),
    status: z.enum(['draft', 'published', 'cancelled']),
  })
  .superRefine((v, ctx) => {
    if (!v.isOnline && !v.venueName) {
      ctx.addIssue({ code: 'custom', path: ['venueName'], message: 'Enter the venue name' })
    }
    if (!v.isOnline && !v.venueCity) {
      ctx.addIssue({ code: 'custom', path: ['venueCity'], message: 'Enter the city' })
    }
    if (v.startDate && v.endDate && new Date(v.endDate) <= new Date(v.startDate)) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End must be after the start' })
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>
