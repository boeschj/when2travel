import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { client } from './api'

// Custom error class to preserve HTTP status for error handling
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const planKeys = createQueryKeys('plans', {
  detail: (planId: string) => ({
    queryKey: [planId],
    queryFn: async () => {
      const res = await client.plans[':id'].$get({
        param: { id: planId },
      })
      if (!res.ok) {
        throw new ApiError('Failed to fetch plan', res.status)
      }
      return res.json()
    },
  }),
})

export const responseKeys = createQueryKeys('responses', {
  withPlan: (responseId: string, planId: string) => ({
    queryKey: [responseId, planId],
    queryFn: async () => {
      const res = await client.plans[':id'].$get({
        param: { id: planId },
      })
      if (!res.ok) {
        throw new ApiError('Failed to fetch plan', res.status)
      }
      const plan = await res.json()
      const matchingResponse = plan.responses?.find((r) => r.id === responseId)
      if (!matchingResponse) {
        throw new ApiError('Response not found in plan', 404)
      }
      return { plan, response: matchingResponse }
    },
  }),
})

export const queries = mergeQueryKeys(planKeys, responseKeys)
