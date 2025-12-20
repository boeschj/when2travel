import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format, differenceInDays } from 'date-fns'
import type { PlanWithResponses, PlanResponse, CompatibleDateRange } from '@/lib/types'

export function useCompatibleRanges(plan: PlanWithResponses | undefined | null): CompatibleDateRange[] {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return []

    const totalRespondents = plan.responses.length
    const minimumTripLength = plan.numDays

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

    const validRanges: CompatibleDateRange[] = []
    let rangeStart: string | null = null
    let rangeEnd: string | null = null

    for (const date of allDatesInRange) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const availableCount = dateToAvailableCount.get(dateStr) || 0
      const allRespondentsAvailable = availableCount === totalRespondents

      if (allRespondentsAvailable) {
        if (!rangeStart) {
          rangeStart = dateStr
        }
        rangeEnd = dateStr
      } else {
        if (rangeStart && rangeEnd) {
          const rangeLengthDays = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1

          if (rangeLengthDays >= minimumTripLength) {
            validRanges.push({
              start: rangeStart,
              end: rangeEnd,
              availableCount: totalRespondents,
              totalCount: totalRespondents
            })
          }
        }
        rangeStart = null
        rangeEnd = null
      }
    }

    if (rangeStart && rangeEnd) {
      const rangeLengthDays = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1

      if (rangeLengthDays >= minimumTripLength) {
        validRanges.push({
          start: rangeStart,
          end: rangeEnd,
          availableCount: totalRespondents,
          totalCount: totalRespondents
        })
      }
    }

    return validRanges.sort((a, b) => {
      const aLength = differenceInDays(parseISO(a.end), parseISO(a.start)) + 1
      const bLength = differenceInDays(parseISO(b.end), parseISO(b.start)) + 1

      if (bLength !== aLength) {
        return bLength - aLength
      }

      return a.start.localeCompare(b.start)
    })
  }, [plan])
}

