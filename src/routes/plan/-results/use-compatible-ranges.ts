import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format, differenceInDays } from 'date-fns'

import type { PlanWithResponses, PlanResponse, CompatibleDateRange } from '@/lib/types'

export function useCompatibleRanges(plan: PlanWithResponses | undefined | null): CompatibleDateRange[] {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return []

    const totalRespondents = plan.responses.length
    const minimumTripLength = plan.numDays

    const allDatesInPlanRange = eachDayOfInterval({
      start: parseISO(plan.startRange),
      end: parseISO(plan.endRange),
    })

    const respondentCountByDate = buildRespondentCountByDate({
      allDatesInPlanRange,
      responses: plan.responses,
    })

    const consecutiveFullAvailabilityRanges = findConsecutiveFullAvailabilityRanges({
      allDatesInPlanRange,
      respondentCountByDate,
      totalRespondents,
    })

    const rangesLongEnoughForTrip = consecutiveFullAvailabilityRanges.filter((consecutiveRange) => {
      const rangeLengthInDays = getRangeLengthInDays(consecutiveRange)
      const isLongEnoughForTrip = rangeLengthInDays >= minimumTripLength
      return isLongEnoughForTrip
    })

    const compatibleRanges = mapToCompatibleDateRanges({
      consecutiveRanges: rangesLongEnoughForTrip,
      totalRespondents,
    })

    return sortByLongestRangeFirst({ ranges: compatibleRanges })
  }, [plan])
}

function buildRespondentCountByDate({
  allDatesInPlanRange,
  responses,
}: {
  allDatesInPlanRange: Date[]
  responses: PlanResponse[]
}): Map<string, number> {
  const respondentCountByDate = new Map<string, number>()

  for (const date of allDatesInPlanRange) {
    const formattedDate = format(date, 'yyyy-MM-dd')
    respondentCountByDate.set(formattedDate, 0)
  }

  for (const response of responses) {
    for (const availableDate of response.availableDates) {
      const currentRespondentCount = respondentCountByDate.get(availableDate)
      if (currentRespondentCount !== undefined) {
        respondentCountByDate.set(availableDate, currentRespondentCount + 1)
      }
    }
  }

  return respondentCountByDate
}

interface ConsecutiveDateRange {
  start: string
  end: string
}

function findConsecutiveFullAvailabilityRanges({
  allDatesInPlanRange,
  respondentCountByDate,
  totalRespondents,
}: {
  allDatesInPlanRange: Date[]
  respondentCountByDate: Map<string, number>
  totalRespondents: number
}): ConsecutiveDateRange[] {
  const consecutiveRanges: ConsecutiveDateRange[] = []
  let currentRangeStart: string | null = null
  let currentRangeEnd: string | null = null

  for (const date of allDatesInPlanRange) {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const respondentsAvailableOnDate = respondentCountByDate.get(formattedDate) ?? 0
    const allRespondentsAvailable = respondentsAvailableOnDate === totalRespondents

    if (allRespondentsAvailable) {
      if (!currentRangeStart) {
        currentRangeStart = formattedDate
      }
      currentRangeEnd = formattedDate
    } else {
      if (currentRangeStart && currentRangeEnd) {
        consecutiveRanges.push({ start: currentRangeStart, end: currentRangeEnd })
      }
      currentRangeStart = null
      currentRangeEnd = null
    }
  }

  if (currentRangeStart && currentRangeEnd) {
    consecutiveRanges.push({ start: currentRangeStart, end: currentRangeEnd })
  }

  return consecutiveRanges
}

function getRangeLengthInDays({ start, end }: ConsecutiveDateRange): number {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  const daysBetween = differenceInDays(endDate, startDate)
  const inclusiveDayCount = daysBetween + 1
  return inclusiveDayCount
}

function mapToCompatibleDateRanges({
  consecutiveRanges,
  totalRespondents,
}: {
  consecutiveRanges: ConsecutiveDateRange[]
  totalRespondents: number
}): CompatibleDateRange[] {
  return consecutiveRanges.map((consecutiveRange) => ({
    start: consecutiveRange.start,
    end: consecutiveRange.end,
    availableCount: totalRespondents,
    totalCount: totalRespondents,
  }))
}

function sortByLongestRangeFirst({ ranges }: { ranges: CompatibleDateRange[] }): CompatibleDateRange[] {
  return [...ranges].sort((firstRange, secondRange) => {
    const firstRangeLength = getRangeLengthInDays(firstRange)
    const secondRangeLength = getRangeLengthInDays(secondRange)

    if (secondRangeLength !== firstRangeLength) {
      return secondRangeLength - firstRangeLength
    }

    return firstRange.start.localeCompare(secondRange.start)
  })
}
