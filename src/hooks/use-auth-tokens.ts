import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  planEditTokensAtom,
  responseEditTokensAtom,
  responsePlanIdsAtom,
} from '@/lib/atoms'
import type { PlanResponse } from '@/lib/types'

// Hook to manage plan edit tokens
export function usePlanEditTokens() {
  const [tokens, setTokens] = useAtom(planEditTokensAtom)

  const savePlanEditToken = (planId: string, token: string) => {
    setTokens((prev) => ({ ...prev, [planId]: token }))
  }

  const getPlanEditToken = (planId: string) => {
    return tokens[planId] ?? null
  }

  const isCreator = (planId: string) => {
    return planId in tokens
  }

  return { tokens, savePlanEditToken, getPlanEditToken, isCreator }
}

// Hook to manage response edit tokens
export function useResponseEditTokens() {
  const [tokens, setTokens] = useAtom(responseEditTokensAtom)
  const [planIds, setPlanIds] = useAtom(responsePlanIdsAtom)

  const saveResponseEditToken = (responseId: string, token: string, planId: string) => {
    setTokens((prev) => ({ ...prev, [responseId]: token }))
    setPlanIds((prev) => ({ ...prev, [responseId]: planId }))
  }

  const getResponseEditToken = (responseId: string) => {
    return tokens[responseId] ?? null
  }

  const getResponsePlanId = (responseId: string) => {
    return planIds[responseId] ?? null
  }

  const hasResponseToken = (responseId: string) => {
    return responseId in tokens
  }

  const removeResponseToken = (responseId: string) => {
    setTokens((prev) => {
      const { [responseId]: _, ...rest } = prev
      return rest
    })
    setPlanIds((prev) => {
      const { [responseId]: _, ...rest } = prev
      return rest
    })
  }

  return {
    tokens,
    saveResponseEditToken,
    getResponseEditToken,
    getResponsePlanId,
    hasResponseToken,
    removeResponseToken,
  }
}

// Hook to get auth context for a specific plan
export function usePlanAuthContext(planId: string) {
  const planTokens = useAtomValue(planEditTokensAtom)

  const isCreator = planId in planTokens
  const editToken = planTokens[planId] ?? null

  return { isCreator, editToken }
}

// Hook to find current user's response in a plan
export function useCurrentUserResponse(responses: PlanResponse[] | undefined) {
  const responseTokens = useAtomValue(responseEditTokensAtom)

  return useMemo(() => {
    if (!responses) return null
    return responses.find((r) => r.id in responseTokens) ?? null
  }, [responses, responseTokens])
}

// Hook to get the most recent plan ID the user has interacted with
export function useMostRecentPlanId(): string | null {
  const planTokens = useAtomValue(planEditTokensAtom)
  const responsePlanIds = useAtomValue(responsePlanIdsAtom)

  return useMemo(() => {
    // Get plan IDs from created plans
    const createdPlanIds = Object.keys(planTokens)

    // Get plan IDs from responses
    const respondedPlanIds = Object.values(responsePlanIds)

    // Combine and dedupe - prefer created plans first, then responded
    const allPlanIds = [...new Set([...createdPlanIds, ...respondedPlanIds])]

    // Return the first one (most recently added to the object)
    return allPlanIds[0] ?? null
  }, [planTokens, responsePlanIds])
}
