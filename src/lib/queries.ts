import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

import { client } from "./api";
import { ApiError } from "./errors";

async function fetchPlanById(planId: string) {
  const response = await client.plans[":id"].$get({
    param: { id: planId },
  });
  if (!response.ok) {
    const error = await ApiError.fromResponse(response);
    throw error;
  }
  const data = await response.json();
  return data;
}

export const planKeys = createQueryKeys("plans", {
  detail: (planId: string) => ({
    queryKey: [planId],
    queryFn: () => fetchPlanById(planId),
  }),
});

export const responseKeys = createQueryKeys("responses", {
  withPlan: (responseId: string, planId: string) => ({
    queryKey: [responseId, planId],
    queryFn: async () => {
      const plan = await fetchPlanById(planId);
      const matchingResponse = plan.responses.find(response => response.id === responseId);
      if (!matchingResponse) {
        throw new ApiError(404, "Response not found in plan");
      }
      return { plan, response: matchingResponse };
    },
  }),
});

export const queries = mergeQueryKeys(planKeys, responseKeys);
