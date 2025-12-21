import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format, differenceInDays } from 'date-fns'
import type { PlanWithResponses, PlanResponse, CompatibleDateRange } from '@/lib/types'

export interface PartialCompatibilityStats {
  /** Best partial match ranges (where most but not all people are available) */
  partialRanges: CompatibleDateRange[]
  /** Number of respondents who have at least numDays consecutive available */
  respondentsWithSufficientAvailability: number
  /** Total number of respondents */
  totalRespondents: number
  /** Names of respondents who don't have enough consecutive availability */
  blockingRespondents: string[]
}

/**
 * Finds the maximum number of consecutive days a respondent has available
 * within the plan's date range.
 */
function getMaxConsecutiveDays(
  availableDates: string[],
  startRange: string,
  endRange: string
): number {
  if (availableDates.length === 0) return 0

  const rangeStart = parseISO(startRange)
  const rangeEnd = parseISO(endRange)
  const allDates = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

  const availableSet = new Set(availableDates)
  let maxConsecutive = 0
  let currentConsecutive = 0

  for (const date of allDates) {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (availableSet.has(dateStr)) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 0
    }
  }

  return maxConsecutive
}

/**
 * Hook to find partial compatibility stats when no perfect window exists.
 * Returns the best "near-miss" ranges and stats about respondent availability.
 */
export function usePartialCompatibleRanges(
  plan: PlanWithResponses | undefined | null
): PartialCompatibilityStats {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) {
      return {
        partialRanges: [],
        respondentsWithSufficientAvailability: 0,
        totalRespondents: 0,
        blockingRespondents: []
      }
    }

    const totalRespondents = plan.responses.length
    const minimumTripLength = plan.numDays

    // Find respondents who have sufficient consecutive availability
    const blockingRespondents: string[] = []
    let respondentsWithSufficientAvailability = 0

    plan.responses.forEach((response: PlanResponse) => {
      const maxConsecutive = getMaxConsecutiveDays(
        response.availableDates,
        plan.startRange,
        plan.endRange
      )
      if (maxConsecutive >= minimumTripLength) {
        respondentsWithSufficientAvailability++
      } else {
        blockingRespondents.push(response.name)
      }
    })

    // Build date availability map
    const dateToAvailableCount = new Map<string, number>()
    const allDatesInRange = eachDayOfInterval({
      start: parseISO(plan.startRange),
      end: parseISO(plan.endRange)
    })

    for (const date of allDatesInRange) {
      dateToAvailableCount.set(format(date, 'yyyy-MM-dd'), 0)
    }

    plan.responses.forEach((response: PlanResponse) => {
      response.availableDates.forEach((dateStr: string) => {
        const current = dateToAvailableCount.get(dateStr)
        if (current !== undefined) {
          dateToAvailableCount.set(dateStr, current + 1)
        }
      })
    })

    // Find the maximum availability count for any date
    let maxAvailability = 0
    for (const count of dateToAvailableCount.values()) {
      maxAvailability = Math.max(maxAvailability, count)
    }

    // Find ranges where we have maxAvailability (best partial match)
    const partialRanges: CompatibleDateRange[] = []
    let rangeStart: string | null = null
    let rangeEnd: string | null = null

    for (const date of allDatesInRange) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const availableCount = dateToAvailableCount.get(dateStr) || 0
      const isMaxAvailability = availableCount === maxAvailability && maxAvailability > 0

      if (isMaxAvailability) {
        if (!rangeStart) {
          rangeStart = dateStr
        }
        rangeEnd = dateStr
      } else {
        if (rangeStart && rangeEnd) {
          const rangeLengthDays = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1

          if (rangeLengthDays >= minimumTripLength) {
            partialRanges.push({
              start: rangeStart,
              end: rangeEnd,
              availableCount: maxAvailability,
              totalCount: totalRespondents
            })
          }
        }
        rangeStart = null
        rangeEnd = null
      }
    }

    // Don't forget the last range
    if (rangeStart && rangeEnd) {
      const rangeLengthDays = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1

      if (rangeLengthDays >= minimumTripLength) {
        partialRanges.push({
          start: rangeStart,
          end: rangeEnd,
          availableCount: maxAvailability,
          totalCount: totalRespondents
        })
      }
    }

    // Sort by length (longest first), then by date
    partialRanges.sort((a, b) => {
      const aLength = differenceInDays(parseISO(a.end), parseISO(a.start)) + 1
      const bLength = differenceInDays(parseISO(b.end), parseISO(b.start)) + 1

      if (bLength !== aLength) {
        return bLength - aLength
      }

      return a.start.localeCompare(b.start)
    })

    return {
      partialRanges,
      respondentsWithSufficientAvailability,
      totalRespondents,
      blockingRespondents
    }
  }, [plan])
}
