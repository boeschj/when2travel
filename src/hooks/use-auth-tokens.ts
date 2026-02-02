import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { PlanResponse } from '@/lib/types'
import {
  allPlanIdsAtom,
  planEditTokensAtom,
  responseEditTokensAtom,
  responsePlanIdsAtom,
} from '@/lib/atoms'

export function usePlanEditTokens() {
  const [planEditTokens, setPlanEditTokens] = useAtom(planEditTokensAtom)

  const savePlanEditToken = (planId: string, token: string) => {
    setPlanEditTokens((prev) => ({ ...prev, [planId]: token }))
  }

  const getPlanEditToken = (planId: string) => {
    return planEditTokens[planId] ?? null
  }

  const isCreator = (planId: string) => {
    return planId in planEditTokens
  }

  const removePlanEditToken = (planId: string) => {
    setPlanEditTokens((prev) => removeKeyFromRecord(prev, planId))
  }

  return { planEditTokens, savePlanEditToken, getPlanEditToken, isCreator, removePlanEditToken }
}

export function useResponseEditTokens() {
  const [responseEditTokens, setResponseEditTokens] = useAtom(responseEditTokensAtom)
  const [responsePlanIds, setResponsePlanIds] = useAtom(responsePlanIdsAtom)

  const saveResponseEditToken = ({
    responseId,
    token,
    planId,
  }: {
    responseId: string
    token: string
    planId: string
  }) => {
    setResponseEditTokens((prev) => ({ ...prev, [responseId]: token }))
    setResponsePlanIds((prev) => ({ ...prev, [responseId]: planId }))
  }

  const getResponseEditToken = (responseId: string) => {
    return responseEditTokens[responseId] ?? null
  }

  const getResponsePlanId = (responseId: string) => {
    return responsePlanIds[responseId] ?? null
  }

  const hasResponseToken = (responseId: string) => {
    return responseId in responseEditTokens
  }

  const removeResponseToken = (responseId: string) => {
    setResponseEditTokens((prev) => removeKeyFromRecord(prev, responseId))
    setResponsePlanIds((prev) => removeKeyFromRecord(prev, responseId))
  }

  return {
    responseEditTokens,
    saveResponseEditToken,
    getResponseEditToken,
    getResponsePlanId,
    hasResponseToken,
    removeResponseToken,
  }
}

export function usePlanAuthContext(planId: string) {
  const planEditTokens = useAtomValue(planEditTokensAtom)

  const isCreator = planId in planEditTokens
  const editToken = planEditTokens[planId] ?? null

  return { isCreator, editToken }
}

export function useCurrentUserResponse(responses: PlanResponse[] | undefined) {
  const responseEditTokens = useAtomValue(responseEditTokensAtom)

  return useMemo(() => {
    if (!responses) return null
    return responses.find((r) => r.id in responseEditTokens) ?? null
  }, [responses, responseEditTokens])
}

export function useFirstKnownPlanId(): string | null {
  const allPlanIds = useAtomValue(allPlanIdsAtom)
  return allPlanIds[0] ?? null
}

function removeKeyFromRecord(record: Record<string, string>, key: string): Record<string, string> {
  const { [key]: _, ...rest } = record
  return rest
}
