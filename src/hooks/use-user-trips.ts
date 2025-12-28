import { useMemo, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { useQueries } from '@tanstack/react-query'
import { planEditTokensAtom, responsePlanIdsAtom, responseEditTokensAtom } from '@/lib/atoms'
import { planKeys, ApiError } from '@/lib/queries'
import type { PlanWithResponses } from '@/lib/types'

export interface UserTrip {
  planId: string
  plan: PlanWithResponses | null
  role: 'creator' | 'respondent'
  isLoading: boolean
  error: Error | null
}

export function useUserTrips() {
  const [planTokens, setPlanTokens] = useAtom(planEditTokensAtom)
  const [responsePlanIds, setResponsePlanIds] = useAtom(responsePlanIdsAtom)
  const [, setResponseTokens] = useAtom(responseEditTokensAtom)

  const { allPlanIds, createdPlanIds } = useMemo(() => {
    const created = Object.keys(planTokens)
    const responded = [...new Set(Object.values(responsePlanIds))]
    const all = [...new Set([...created, ...responded])]
    return { allPlanIds: all, createdPlanIds: new Set(created) }
  }, [planTokens, responsePlanIds])

  const planQueries = useQueries({
    queries: allPlanIds.map(planId => ({
      ...planKeys.detail(planId),
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Don't retry 404s for deleted plans
    }))
  })

  const trips: UserTrip[] = useMemo(() => {
    return allPlanIds.map((planId, index) => {
      const query = planQueries[index]
      return {
        planId,
        plan: query.data ?? null,
        role: createdPlanIds.has(planId) ? 'creator' : 'respondent',
        isLoading: query.isLoading,
        error: query.error as Error | null,
      }
    })
  }, [allPlanIds, planQueries, createdPlanIds])

  const validTrips = useMemo(() => {
    return trips.filter(t => {
      if (!t.error || t.isLoading) return true
      const is404 = t.error instanceof ApiError && t.error.status === 404
      return !is404
    })
  }, [trips])

  const serverError = useMemo(() => {
    return trips.find(t =>
      t.error &&
      !t.isLoading &&
      !(t.error instanceof ApiError && t.error.status === 404)
    )?.error ?? null
  }, [trips])

  const cleanedUpRef = useRef<Set<string>>(new Set())

  // TODO: Extract stale token cleanup to a separate function for testability
  useEffect(() => {
    const stalePlanIds = trips
      .filter(t => {
        if (!t.error || t.isLoading) return false
        return t.error instanceof ApiError && t.error.status === 404
      })
      .map(t => t.planId)
      .filter(id => !cleanedUpRef.current.has(id))

    if (stalePlanIds.length === 0) return

    stalePlanIds.forEach(id => cleanedUpRef.current.add(id))

    const stalePlanTokenIds = stalePlanIds.filter(id => id in planTokens)
    if (stalePlanTokenIds.length > 0) {
      setPlanTokens(prev => {
        const next = { ...prev }
        stalePlanTokenIds.forEach(id => delete next[id])
        return next
      })
    }

    const staleResponseIds = Object.entries(responsePlanIds)
      .filter(([, planId]) => stalePlanIds.includes(planId))
      .map(([responseId]) => responseId)

    if (staleResponseIds.length > 0) {
      setResponsePlanIds(prev => {
        const next = { ...prev }
        staleResponseIds.forEach(id => delete next[id])
        return next
      })
      setResponseTokens(prev => {
        const next = { ...prev }
        staleResponseIds.forEach(id => delete next[id])
        return next
      })
    }
  }, [trips, planTokens, responsePlanIds, setPlanTokens, setResponsePlanIds, setResponseTokens])

  const hasValidTrips = validTrips.length > 0 || planQueries.some(q => q.isLoading)

  return {
    trips: validTrips,
    isLoading: planQueries.some(q => q.isLoading),
    hasTrips: hasValidTrips,
    error: serverError,
    refetch: () => planQueries.forEach(q => q.refetch()),
  }
}
