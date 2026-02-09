import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";

import { allPlanIdsAtom, cleanupDeletedPlansAtom, createdPlanIdsAtom } from "@/lib/atoms";
import { TRIP_ROLES } from "@/lib/constants";
import type { TripRole } from "@/lib/constants";
import { ApiError } from "@/lib/errors";
import { planKeys } from "@/lib/queries";
import type { PlanWithResponses } from "@/lib/types";

export interface UserTrip {
  planId: string;
  plan: PlanWithResponses;
  role: TripRole;
}

function isNotFoundError(error: unknown): boolean {
  const isApiError = error instanceof ApiError;
  const isNotFound = isApiError && error.isNotFound;
  return isNotFound;
}

function getRoleForPlan(planId: string, createdPlanIds: Set<string>): TripRole {
  const isPlanCreator = createdPlanIds.has(planId);
  if (isPlanCreator) return TRIP_ROLES.CREATOR;
  return TRIP_ROLES.RESPONDENT;
}

export function useUserTrips() {
  const createdPlanIds = useAtomValue(createdPlanIdsAtom);
  const allPlanIds = useAtomValue(allPlanIdsAtom);
  const cleanupDeletedPlans = useSetAtom(cleanupDeletedPlansAtom);

  const queryResults = useQueries({
    queries: allPlanIds.map(planId => planKeys.detail(planId)),
  });

  const deletedPlanIds = useMemo(() => {
    const plansWithNotFoundError = allPlanIds.filter((_, index) => {
      const query = queryResults[index];
      if (!query) return false;
      const isNotLoading = !query.isLoading;
      const hasNotFoundError = isNotFoundError(query.error);
      return isNotLoading && hasNotFoundError;
    });
    return plansWithNotFoundError;
  }, [allPlanIds, queryResults]);

  useEffect(() => {
    if (deletedPlanIds.length === 0) return;
    cleanupDeletedPlans(deletedPlanIds);
  }, [deletedPlanIds, cleanupDeletedPlans]);

  const tripsWithData = allPlanIds
    .map((planId, index) => ({ planId, data: queryResults[index]?.data }))
    .filter((trip): trip is { planId: string; data: PlanWithResponses } => trip.data !== undefined);

  const resolvedTrips = tripsWithData.map<UserTrip>(({ planId, data }) => ({
    planId,
    plan: data,
    role: getRoleForPlan(planId, createdPlanIds),
  }));

  const serverErrorQuery = queryResults.find(query => {
    const { error, isLoading } = query;
    if (isLoading) return false;
    if (!error) return false;
    const isNotFound = isNotFoundError(error);
    const isServerError = !isNotFound;
    return isServerError;
  });
  const firstServerError = serverErrorQuery?.error ?? null;

  const hasLoadingQueries = queryResults.some(query => query.isLoading);

  return { trips: resolvedTrips, isLoading: hasLoadingQueries, error: firstServerError };
}
