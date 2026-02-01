import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { client } from './api'

async function fetchPlanById(planId: string) {
  const response = await client.plans[':id'].$get({
    param: { id: planId },
  })
  if (!response.ok) {
    throw response
  }
  return response.json()
}

export const planKeys = createQueryKeys('plans', {
  detail: (planId: string) => ({
    queryKey: [planId],
    queryFn: () => fetchPlanById(planId),
  }),
})

export const responseKeys = createQueryKeys('responses', {
  withPlan: (responseId: string, planId: string) => ({
    queryKey: [responseId, planId],
    queryFn: async () => {
      const plan = await fetchPlanById(planId)
      const matchingResponse = plan.responses?.find(
        (response) => response.id === responseId,
      )
      if (!matchingResponse) {
        throw new Response('Response not found in plan', { status: 404 })
      }
      return { plan, response: matchingResponse }
    },
  }),
})

export const queries = mergeQueryKeys(planKeys, responseKeys)
