import { z } from 'zod'

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date format (YYYY-MM-DD)')

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name must be 64 characters or less'),
  numDays: z.number().int().min(1, 'Must be at least 1 day').max(60, 'Must be 60 days or less'),
  startRange: isoDateString,
  endRange: isoDateString,
}).refine(
  (data) => new Date(data.startRange) <= new Date(data.endRange),
  { message: 'Start date must be before or equal to end date', path: ['startRange'] }
)

export const updatePlanSchema = z.object({
  editToken: z.string().min(1, 'Edit token is required'),
  name: z.string().min(1).max(64).optional(),
  numDays: z.number().int().min(1).max(60).optional(),
  startRange: isoDateString.optional(),
  endRange: isoDateString.optional(),
})

export const deletePlanSchema = z.object({
  editToken: z.string().min(1, 'Edit token is required'),
})

export const createResponseSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  name: z.string().min(1, 'Name is required').max(64, 'Name must be 64 characters or less'),
  availableDates: z.array(isoDateString).min(1, 'At least one date must be selected'),
})

export const updateResponseSchema = z.object({
  editToken: z.string().min(1, 'Edit token is required'),
  name: z.string().min(1).max(64).optional(),
  availableDates: z.array(isoDateString).min(1).optional(),
})

export const deleteResponseSchema = z.object({
  editToken: z.string().min(1, 'Edit token is required'),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type CreateResponseInput = z.infer<typeof createResponseSchema>
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>

