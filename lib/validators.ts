import { z } from 'zod'

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()

export const createEventSchema = z.object({
  title: z.string().trim().min(0).optional(),
  description: z.string().trim().min(0).optional(),
  event_type: z.string().trim().min(0).optional(),
  start_date: dateStringSchema,
  end_date: dateStringSchema,
  registration_deadline: dateStringSchema.or(z.literal('')).optional(),
  goal_amount: z.union([z.number(), z.string()]).optional(),
  max_participants: z.union([z.number(), z.string()]).optional(),
  location: z.string().trim().min(0).optional(),
  image_url: z.string().url().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>

export const updateEventSchema = createEventSchema.partial()
export type UpdateEventInput = z.infer<typeof updateEventSchema>

export const createDonationIntentSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  currency: z.string().trim().default('usd'),
  donor_name: z.string().trim().optional(),
  donor_email: z.string().email().optional(),
  message: z.string().trim().optional(),
})

export type CreateDonationIntentInput = z.infer<typeof createDonationIntentSchema>


