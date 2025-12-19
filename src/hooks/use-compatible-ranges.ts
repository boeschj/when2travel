import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format } from 'date-fns'
import type { PlanWithResponses, PlanResponse, CompatibleDateRange } from '@/lib/types'
import { AVAILABILITY_THRESHOLDS } from '@/lib/constants'

interface RangeAccumulator {
  start: string
  end: string
  minAvailable: number
}

export function useCompatibleRanges(plan: PlanWithResponses | undefined | null) {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return []

    const dateToRespondentNames = new Map<string, Set<string>>()

    plan.responses.forEach((response: PlanResponse) => {
      response.availableDates.forEach((date: string) => {
        if (!dateToRespondentNames.has(date)) {
          dateToRespondentNames.set(date, new Set())
        }
        dateToRespondentNames.get(date)?.add(response.name)
      })
    })

    const allDatesInRange = eachDayOfInterval({
      start: parseISO(plan.startRange),
      end: parseISO(plan.endRange)
    })

    const highAvailabilityRanges: CompatibleDateRange[] = []

    const minimumAvailabilityThreshold = AVAILABILITY_THRESHOLDS.HIGH
    let currentRange: RangeAccumulator | null = null

    for (const date of allDatesInRange) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const availableRespondentCount = dateToRespondentNames.get(dateStr)?.size || 0
      const meetsAvailabilityThreshold = availableRespondentCount >= plan.responses.length * minimumAvailabilityThreshold

      if (meetsAvailabilityThreshold) {
        if (!currentRange) {
          currentRange = {
            start: dateStr,
            end: dateStr,
            minAvailable: availableRespondentCount
          }
        } else {
          currentRange.end = dateStr
          currentRange.minAvailable = Math.min(currentRange.minAvailable, availableRespondentCount)
        }
      } else {
        if (currentRange) {
          highAvailabilityRanges.push({
            start: currentRange.start,
            end: currentRange.end,
            availableCount: currentRange.minAvailable,
            totalCount: plan.responses.length
          })
          currentRange = null
        }
      }
    }

    if (currentRange) {
      highAvailabilityRanges.push({
        start: currentRange.start,
        end: currentRange.end,
        availableCount: currentRange.minAvailable,
        totalCount: plan.responses.length
      })
    }

    const sortedByAvailabilityPercentage = highAvailabilityRanges.sort((a, b) => {
      const aPercentage = (a.availableCount / a.totalCount) * 100
      const bPercentage = (b.availableCount / b.totalCount) * 100
      return bPercentage - aPercentage
    })

    const topThreeRanges = sortedByAvailabilityPercentage.slice(0, 3)
    return topThreeRanges
  }, [plan])
}

