import { useEffect, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useQueries } from '@tanstack/react-query'
import { ApiError } from '@/lib/errors'
import { allPlanIdsAtom, createdPlanIdsAtom, cleanupDeletedPlansAtom } from '@/lib/atoms'
import { planKeys } from '@/lib/queries'
import { TRIP_ROLES } from '@/lib/constants'

import type { PlanWithResponses } from '@/lib/types'
import type { TripRole } from '@/lib/constants'

export interface UserTrip {
  planId: string
  plan: PlanWithResponses
  role: TripRole
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFound
}

function getRoleForPlan(planId: string, createdPlanIds: Set<string>): TripRole {
  if (createdPlanIds.has(planId)) return TRIP_ROLES.CREATOR
  return TRIP_ROLES.RESPONDENT
}

export function useUserTrips() {
  const createdPlanIds = useAtomValue(createdPlanIdsAtom)
  const allPlanIds = useAtomValue(allPlanIdsAtom)
  const cleanupDeletedPlans = useSetAtom(cleanupDeletedPlansAtom)

  const queryResults = useQueries({
    queries: allPlanIds.map(planId => planKeys.detail(planId)),
  })

  const deletedPlanIds = useMemo(() => {
    return allPlanIds.filter((_, index) => {
      const query = queryResults[index]
      return !query.isLoading && isNotFoundError(query.error)
    })
  }, [allPlanIds, queryResults])

  useEffect(() => {
    if (deletedPlanIds.length === 0) return
    cleanupDeletedPlans(deletedPlanIds)
  }, [deletedPlanIds, cleanupDeletedPlans])

  const tripsWithData = allPlanIds
    .map((planId, index) => ({ planId, data: queryResults[index].data }))
    .filter((trip): trip is { planId: string; data: PlanWithResponses } => trip.data !== undefined)

  const resolvedTrips = tripsWithData.map<UserTrip>(({ planId, data }) => ({
    planId,
    plan: data,
    role: getRoleForPlan(planId, createdPlanIds),
  }))

  const firstServerError = queryResults.find(query =>
    query.error && !query.isLoading && !isNotFoundError(query.error)
  )?.error ?? null

  const isLoading = queryResults.some(query => query.isLoading)

  return { trips: resolvedTrips, isLoading, error: firstServerError }
}
