import { useMemo, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { useQueries } from '@tanstack/react-query'
import { planEditTokensAtom, responsePlanIdsAtom, responseEditTokensAtom } from '@/lib/atoms'
import { planKeys } from '@/lib/queries'
import type { PlanWithResponses } from '@/lib/types'

export interface UserTrip {
  planId: string
  plan: PlanWithResponses | null
  role: 'creator' | 'respondent'
  isLoading: boolean
}

const FIVE_MINUTES = 1000 * 60 * 5

function isNotFoundError(error: unknown): boolean {
  return error instanceof Response && error.status === 404
}

function useCleanupDeletedPlans(
  deletedPlanIds: string[],
  planTokens: Record<string, string>,
  responsePlanIds: Record<string, string>,
  setPlanTokens: (fn: (prev: Record<string, string>) => Record<string, string>) => void,
  setResponsePlanIds: (fn: (prev: Record<string, string>) => Record<string, string>) => void,
  setResponseTokens: (fn: (prev: Record<string, string>) => Record<string, string>) => void,
) {
  const alreadyCleanedPlanIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const newlyDeletedIds = deletedPlanIds.filter(id => !alreadyCleanedPlanIds.current.has(id))
    if (newlyDeletedIds.length === 0) return

    for (const id of newlyDeletedIds) {
      alreadyCleanedPlanIds.current.add(id)
    }

    const deletedPlanTokenIds = newlyDeletedIds.filter(id => id in planTokens)
    if (deletedPlanTokenIds.length > 0) {
      setPlanTokens(prev => {
        const result = { ...prev }
        for (const key of deletedPlanTokenIds) delete result[key]
        return result
      })
    }

    const orphanedResponseIds = Object.entries(responsePlanIds)
      .filter(([, planId]) => newlyDeletedIds.includes(planId))
      .map(([responseId]) => responseId)

    if (orphanedResponseIds.length > 0) {
      setResponsePlanIds(prev => {
        const result = { ...prev }
        for (const key of orphanedResponseIds) delete result[key]
        return result
      })
      setResponseTokens(prev => {
        const result = { ...prev }
        for (const key of orphanedResponseIds) delete result[key]
        return result
      })
    }
  }, [deletedPlanIds, planTokens, responsePlanIds, setPlanTokens, setResponsePlanIds, setResponseTokens])
}

export function useUserTrips() {
  const [planTokens, setPlanTokens] = useAtom(planEditTokensAtom)
  const [responsePlanIds, setResponsePlanIds] = useAtom(responsePlanIdsAtom)
  const [, setResponseTokens] = useAtom(responseEditTokensAtom)

  const { allPlanIds, createdPlanIds } = useMemo(() => {
    const createdIds = Object.keys(planTokens)
    const respondedIds = [...new Set(Object.values(responsePlanIds))]
    const combinedIds = [...new Set([...createdIds, ...respondedIds])]
    return { allPlanIds: combinedIds, createdPlanIds: new Set(createdIds) }
  }, [planTokens, responsePlanIds])

  const queryResults = useQueries({
    queries: allPlanIds.map(planId => ({
      ...planKeys.detail(planId),
      staleTime: FIVE_MINUTES,
      retry: false,
    })),
  })

  const trips = allPlanIds.map((planId, index) => {
    const query = queryResults[index]
    const role = createdPlanIds.has(planId) ? 'creator' as const : 'respondent' as const
    return {
      planId,
      plan: query.data ?? null,
      role,
      isLoading: query.isLoading,
      error: query.error,
    }
  })

  const deletedPlanIds = trips
    .filter(trip => trip.error && !trip.isLoading && isNotFoundError(trip.error))
    .map(trip => trip.planId)

  const validTrips: UserTrip[] = trips.filter(trip => {
    if (!trip.error || trip.isLoading) return true
    return !isNotFoundError(trip.error)
  })

  const firstServerError = trips.find(trip =>
    trip.error && !trip.isLoading && !isNotFoundError(trip.error)
  )?.error ?? null

  useCleanupDeletedPlans(
    deletedPlanIds,
    planTokens,
    responsePlanIds,
    setPlanTokens,
    setResponsePlanIds,
    setResponseTokens,
  )

  const isLoading = queryResults.some(query => query.isLoading)
  const hasTrips = validTrips.length > 0 || isLoading

  return {
    trips: validTrips,
    isLoading,
    hasTrips,
    error: firstServerError,
    refetch: () => queryResults.forEach(query => query.refetch()),
  }
}
