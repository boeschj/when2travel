import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { client } from './api'

export const planKeys = createQueryKeys('plans', {
  detail: (planId: string) => ({
    queryKey: [planId],
    queryFn: async () => {
      const res = await client.plans[':id'].$get({
        param: { id: planId },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch plan')
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
        throw new Error('Failed to fetch plan')
      }
      const plan = await res.json()
      const matchingResponse = plan.responses?.find((r) => r.id === responseId)
      if (!matchingResponse) {
        throw new Error('Response not found in plan')
      }
      return { plan, response: matchingResponse }
    },
  }),
})

export const queries = mergeQueryKeys(planKeys, responseKeys)
