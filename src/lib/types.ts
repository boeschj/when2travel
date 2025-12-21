import type { InferResponseType } from 'hono/client'
import { client } from './api'

type Client = typeof client

// Extract the success response type from the discriminated union
type PlanResponseSuccess = Extract<
  Awaited<InferResponseType<Client['plans'][':id']['$get']>>,
  { id: string }
>

export type PlanWithResponses = PlanResponseSuccess

export type PlanResponse = NonNullable<PlanWithResponses['responses']>[number]

export interface CompatibleDateRange {
  start: string
  end: string
  availableCount: number
  totalCount: number
}

export interface Respondent extends Pick<PlanResponse, 'id' | 'name' | 'availableDates'> {
  isCurrentUser: boolean
}

export interface ResponseFormData {
  name: string
  availableDates: string[]
}

export interface DateRange {
  id: string
  start: string
  end: string
  days: number
  status: 'available' | 'unavailable'
}
