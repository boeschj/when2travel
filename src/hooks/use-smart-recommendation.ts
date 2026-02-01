import { useMemo } from 'react'
import type { PlanWithResponses } from '@/lib/types'
import type { RecommendationResult } from '@/lib/recommendation-types'
import {
  scoreWindows,
  findShorterPerfectWindows,
  findConstrainingPeople,
} from '@/lib/recommendation-scoring'
import { evaluateRules, type RuleContext } from '@/lib/recommendation-rules'

export function useSmartRecommendation(
  plan: PlanWithResponses | undefined | null
): RecommendationResult | null {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return null

    const { responses, numDays, startRange, endRange } = plan
    const scoredWindows = scoreWindows(startRange, endRange, numDays, responses)
    const bestWindow = scoredWindows[0] ?? null
    const shorterTrip = findShorterPerfectWindows(responses, startRange, endRange, numDays)
    const constrainers = findConstrainingPeople(scoredWindows.slice(0, 5), responses, numDays)

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
    }

    const [primary, ...alternatives] = evaluateRules(context)

    return { primary, alternatives }
  }, [plan])
}
