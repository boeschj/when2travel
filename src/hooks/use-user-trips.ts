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

  // Derive unique plan IDs from both created plans and responded plans
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

  // Filter out trips with 404 errors (deleted plans with stale tokens)
  // Keep trips with other errors (e.g., 500s) so they can be surfaced
  const validTrips = useMemo(() => {
    return trips.filter(t => {
      if (!t.error || t.isLoading) return true
      // Only filter out 404s (deleted plans), keep other errors
      return !(t.error instanceof ApiError && t.error.status === 404)
    })
  }, [trips])

  // Check for server errors (non-404) that should be thrown
  const serverError = useMemo(() => {
    return trips.find(t =>
      t.error &&
      !t.isLoading &&
      !(t.error instanceof ApiError && t.error.status === 404)
    )?.error ?? null
  }, [trips])

  // Track which stale plan IDs we've already cleaned up to prevent loops
  const cleanedUpRef = useRef<Set<string>>(new Set())

  // Auto-cleanup stale tokens when we detect 404 errors (not network/server errors)
  useEffect(() => {
    const stalePlanIds = trips
      .filter(t => {
        // Only clean up if it's a 404 (plan deleted), not network/server errors
        if (!t.error || t.isLoading) return false
        return t.error instanceof ApiError && t.error.status === 404
      })
      .map(t => t.planId)
      .filter(id => !cleanedUpRef.current.has(id))

    if (stalePlanIds.length === 0) return

    // Mark as cleaned up to prevent re-running
    stalePlanIds.forEach(id => cleanedUpRef.current.add(id))

    // Remove stale plan tokens (for creators)
    const stalePlanTokenIds = stalePlanIds.filter(id => id in planTokens)
    if (stalePlanTokenIds.length > 0) {
      setPlanTokens(prev => {
        const next = { ...prev }
        stalePlanTokenIds.forEach(id => delete next[id])
        return next
      })
    }

    // Remove stale response tokens and plan ID mappings (for respondents)
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

  // hasTrips should only be true if there are valid trips (not all stale)
  const hasValidTrips = validTrips.length > 0 || planQueries.some(q => q.isLoading)

  return {
    trips: validTrips,
    isLoading: planQueries.some(q => q.isLoading),
    hasTrips: hasValidTrips,
    error: serverError,
    refetch: () => planQueries.forEach(q => q.refetch()),
  }
}
