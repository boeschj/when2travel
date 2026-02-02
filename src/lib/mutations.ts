import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { client, parseErrorResponse } from './api'
import { planKeys } from './queries'
import { usePlanEditTokens, useResponseEditTokens } from '@/hooks/use-auth-tokens'

interface UseDeletePlanOptions {
  onSuccess: () => void
}

export function useDeletePlan({ onSuccess }: UseDeletePlanOptions) {
  const queryClient = useQueryClient()
  const { getPlanEditToken, removePlanEditToken } = usePlanEditTokens()

  return useMutation({
    mutationFn: async (planId: string) => {
      const editToken = getPlanEditToken(planId)
      if (!editToken) throw new Error('No edit permission')

      const response = await client.plans[':id'].$delete({
        param: { id: planId },
        json: { editToken },
      })
      if (!response.ok) throw await parseErrorResponse(response, 'Failed to delete plan')
      return response.json()
    },
    onSuccess: (_data, planId) => {
      removePlanEditToken(planId)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey })
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete plan')
    },
  })
}

interface DeleteResponseInput {
  responseId: string
  planId: string
}

interface UseDeleteResponseOptions {
  onSuccess: () => void
}

export function useDeleteResponse({ onSuccess }: UseDeleteResponseOptions) {
  const queryClient = useQueryClient()
  const { getResponseEditToken, removeResponseToken } = useResponseEditTokens()

  return useMutation({
    mutationFn: async ({ responseId }: DeleteResponseInput) => {
      const editToken = getResponseEditToken(responseId)
      if (!editToken) throw new Error('No edit permission')

      const response = await client.responses[':id'].$delete({
        param: { id: responseId },
        json: { editToken },
      })
      if (!response.ok) throw await parseErrorResponse(response, 'Failed to delete response')
      return response.json()
    },
    onSuccess: (_data, { responseId, planId }) => {
      removeResponseToken(responseId)
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey })
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete response')
    },
  })
}
