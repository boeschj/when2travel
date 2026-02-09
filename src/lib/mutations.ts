import { usePlanEditTokens, useResponseEditTokens } from "@/hooks/use-auth-tokens";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client, parseErrorResponse } from "./api";
import { planKeys } from "./queries";
import type { PlanWithResponses } from "./types";

interface UseDeletePlanOptions {
  onSuccess: () => void;
}

export function useDeletePlan({ onSuccess }: UseDeletePlanOptions) {
  const queryClient = useQueryClient();
  const { getPlanEditToken, removePlanEditToken } = usePlanEditTokens();

  return useMutation({
    mutationFn: async (planId: string) => {
      const editToken = getPlanEditToken(planId);
      if (!editToken) throw new Error("No edit permission");

      const response = await client.plans[":id"].$delete({
        param: { id: planId },
        json: { editToken },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response, "Failed to delete plan");
        throw error;
      }
      const data = await response.json();
      return data;
    },
    onSuccess: (_data, planId) => {
      removePlanEditToken(planId);
      queryClient.removeQueries({ queryKey: planKeys.detail(planId).queryKey });
      onSuccess();
    },
    onError: error => {
      toast.error(error.message || "Failed to delete plan");
    },
  });
}

interface DeleteResponseInput {
  responseId: string;
  planId: string;
}

interface UseDeleteResponseOptions {
  onSuccess: () => void;
}

export function useDeleteResponse({ onSuccess }: UseDeleteResponseOptions) {
  const queryClient = useQueryClient();
  const { getResponseEditToken, removeResponseToken } = useResponseEditTokens();

  return useMutation({
    mutationFn: async ({ responseId }: DeleteResponseInput) => {
      const editToken = getResponseEditToken(responseId);
      if (!editToken) throw new Error("No edit permission");

      const response = await client.responses[":id"].$delete({
        param: { id: responseId },
        json: { editToken },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response, "Failed to delete response");
        throw error;
      }
      const data = await response.json();
      return data;
    },
    onSuccess: (_data, { responseId, planId }) => {
      removeResponseToken(responseId);
      void queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey });
      onSuccess();
    },
    onError: error => {
      toast.error(error.message || "Failed to delete response");
    },
  });
}

interface UpdateResponseInput {
  responseId: string;
  planId: string;
  name: string;
  selectedDates: string[];
}

interface UseUpdateResponseOptions {
  onSuccess: () => void;
}

export function useUpdateResponse({ onSuccess }: UseUpdateResponseOptions) {
  const queryClient = useQueryClient();
  const { getResponseEditToken } = useResponseEditTokens();

  return useMutation({
    mutationFn: async ({ responseId, name, selectedDates }: UpdateResponseInput) => {
      const editToken = getResponseEditToken(responseId);
      if (!editToken) throw new Error("No edit permission");

      const response = await client.responses[":id"].$put({
        param: { id: responseId },
        json: {
          name: name.trim(),
          availableDates: [...selectedDates].sort((a, b) => a.localeCompare(b)),
          editToken,
        },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response, "Failed to update response");
        throw error;
      }
      const data = await response.json();
      return data;
    },
    onMutate: async ({ responseId, planId, name, selectedDates }) => {
      const planDetailQueryKey = planKeys.detail(planId).queryKey;
      await queryClient.cancelQueries({ queryKey: planDetailQueryKey });

      const previousPlan = queryClient.getQueryData<PlanWithResponses>(planDetailQueryKey);

      queryClient.setQueryData<PlanWithResponses>(planDetailQueryKey, cachedPlan => {
        if (!cachedPlan) return cachedPlan;

        const sortedDates = [...selectedDates].sort((a, b) => a.localeCompare(b));
        const updatedResponses = cachedPlan.responses.map(existingResponse => {
          if (existingResponse.id !== responseId) return existingResponse;
          return { ...existingResponse, name, availableDates: sortedDates };
        });

        return { ...cachedPlan, responses: updatedResponses };
      });

      return { previousPlan, planDetailQueryKey };
    },
    onSuccess: () => {
      toast.success("Your availability has been updated!");
      onSuccess();
    },
    onError: (err, _variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData<PlanWithResponses>(
          context.planDetailQueryKey,
          context.previousPlan,
        );
      }
      toast.error(err.message || "Failed to update availability");
    },
    onSettled: (_data, _error, { planId }) => {
      void queryClient.invalidateQueries({ queryKey: planKeys.detail(planId).queryKey });
    },
  });
}
