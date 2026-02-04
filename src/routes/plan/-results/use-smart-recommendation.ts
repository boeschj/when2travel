import { useMemo } from "react";

import type { PlanWithResponses } from "@/lib/types";

import { evaluateRules, type RuleContext } from "./recommendation-rules";
import {
  findConstrainingPeople,
  findShorterPerfectWindows,
  scoreWindows,
} from "./recommendation-scoring";
import type { RecommendationResult } from "./recommendation-types";

export function useSmartRecommendation(
  plan: PlanWithResponses | undefined | null,
): RecommendationResult | null {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return null;

    const { responses, numDays, startRange, endRange } = plan;
    const scoredWindows = scoreWindows(startRange, endRange, numDays, responses);
    const bestWindow = scoredWindows[0] ?? null;
    const shorterTrip = findShorterPerfectWindows(responses, startRange, endRange, numDays);
    const constrainers = findConstrainingPeople(scoredWindows.slice(0, 5), responses, numDays);

    const context: RuleContext = {
      bestWindow,
      scoredWindows,
      totalCount: responses.length,
      responses,
      numDays,
      startRange,
      endRange,
      shorterTrip,
      constrainers,
    };

    const recommendations = evaluateRules(context);
    const primary = recommendations[0];
    if (!primary) return null;

    const alternatives = recommendations.slice(1);
    return { primary, alternatives };
  }, [plan]);
}
