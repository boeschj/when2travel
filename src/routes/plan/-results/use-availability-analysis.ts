import { useMemo } from "react";

import type { PlanWithResponses } from "@/lib/types";

import type { ScoredWindow } from "./availability-analysis";
import { analyzeAvailability } from "./availability-analysis";
import { buildAlternativeWindows, deriveRecommendation } from "./recommendation-rules";
import type { RecommendationResult } from "./recommendation-types";

export interface PlanAvailability {
  recommendation: RecommendationResult;
  recommendedWindow: ScoredWindow | null;
}

export function useAvailabilityAnalysis(
  plan: PlanWithResponses | undefined | null,
): PlanAvailability | null {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) {
      return null;
    }

    const analysis = analyzeAvailability({
      startRange: plan.startRange,
      endRange: plan.endRange,
      numDays: plan.numDays,
      responses: plan.responses,
    });

    const primary = deriveRecommendation(analysis);
    const alternativeWindows = buildAlternativeWindows(analysis);

    const planAvailability: PlanAvailability = {
      recommendation: { primary, alternativeWindows },
      recommendedWindow: primary.bestWindow,
    };
    return planAvailability;
  }, [plan]);
}
