import {
  eachDayOfInterval,
  parseISO,
  format,
  addDays,
  differenceInDays,
} from 'date-fns'
import type { PlanResponse } from '@/lib/types'
import type {
  ScoredWindow,
  BlockerInfo,
  AlternativeWindow,
  ShorterTripSuggestion,
} from './recommendation-types'

export function generateAllWindows(
  startRange: string,
  endRange: string,
  numDays: number
): Array<{ start: string; end: string }> {
  const rangeStart = parseISO(startRange)
  const rangeEnd = parseISO(endRange)
  const rangeDays = differenceInDays(rangeEnd, rangeStart) + 1

  if (rangeDays < numDays) return []

  const windows: Array<{ start: string; end: string }> = []
  for (let i = 0; i <= rangeDays - numDays; i++) {
    const windowStart = addDays(rangeStart, i)
    const windowEnd = addDays(windowStart, numDays - 1)
    windows.push({
      start: format(windowStart, 'yyyy-MM-dd'),
      end: format(windowEnd, 'yyyy-MM-dd'),
    })
  }

  return windows
}

export function scoreWindows(
  startRange: string,
  endRange: string,
  numDays: number,
  responses: PlanResponse[]
): ScoredWindow[] {
  const allWindows = generateAllWindows(startRange, endRange, numDays)

  return allWindows
    .map((w) => scoreWindow(w.start, w.end, responses, startRange, endRange))
    .sort((a, b) => b.percentage - a.percentage || a.start.localeCompare(b.start))
}

function scoreWindow(
  start: string,
  end: string,
  responses: PlanResponse[],
  planStart: string,
  planEnd: string
): ScoredWindow {
  const windowDates = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  }).map((d) => format(d, 'yyyy-MM-dd'))

  const totalCount = responses.length
  const blockers: BlockerInfo[] = []
  let availableCount = 0

  for (const response of responses) {
    const availableSet = new Set(response.availableDates)
    const missingDates = windowDates.filter((d) => !availableSet.has(d))

    if (missingDates.length === 0) {
      availableCount++
    } else {
      const blockerInfo = analyzeBlocker(response, start, end, planStart, planEnd, missingDates)
      blockers.push(blockerInfo)
    }
  }

  return {
    start,
    end,
    availableCount,
    totalCount,
    percentage: Math.round((availableCount / totalCount) * 100),
    blockers,
  }
}

function analyzeBlocker(
  response: PlanResponse,
  windowStart: string,
  windowEnd: string,
  planStart: string,
  planEnd: string,
  missingDates: string[]
): BlockerInfo {
  const availableSet = new Set(response.availableDates)

  const dayBefore = format(addDays(parseISO(windowStart), -1), 'yyyy-MM-dd')
  const dayAfter = format(addDays(parseISO(windowEnd), 1), 'yyyy-MM-dd')

  const beforeInRange = dayBefore >= planStart
  const afterInRange = dayAfter <= planEnd

  const hasAdjacentBefore = beforeInRange && availableSet.has(dayBefore)
  const hasAdjacentAfter = afterInRange && availableSet.has(dayAfter)

  let shiftDirection: 'earlier' | 'later' | null = null
  let shiftDays = 0

  if (hasAdjacentBefore || hasAdjacentAfter) {
    const windowDates = eachDayOfInterval({
      start: parseISO(windowStart),
      end: parseISO(windowEnd),
    }).map((d) => format(d, 'yyyy-MM-dd'))

    const firstMissing = windowDates.indexOf(missingDates[0])
    const lastMissing = windowDates.indexOf(missingDates[missingDates.length - 1])

    if (hasAdjacentBefore && lastMissing === windowDates.length - 1) {
      shiftDirection = 'earlier'
      shiftDays = missingDates.length
    } else if (hasAdjacentAfter && firstMissing === 0) {
      shiftDirection = 'later'
      shiftDays = missingDates.length
    } else if (hasAdjacentBefore) {
      shiftDirection = 'earlier'
      shiftDays = missingDates.length
    } else if (hasAdjacentAfter) {
      shiftDirection = 'later'
      shiftDays = missingDates.length
    }
  }

  return {
    id: response.id,
    name: response.name,
    missingDates,
    missingCount: missingDates.length,
    hasAdjacentBefore,
    hasAdjacentAfter,
    shiftDirection,
    shiftDays,
  }
}

export function validateShiftedWindow(
  originalStart: string,
  shiftDays: number,
  direction: 'earlier' | 'later',
  planStart: string,
  planEnd: string,
  numDays: number
): boolean {
  const originalDate = parseISO(originalStart)
  const shiftedStart =
    direction === 'earlier'
      ? addDays(originalDate, -shiftDays)
      : addDays(originalDate, shiftDays)
  const shiftedEnd = addDays(shiftedStart, numDays - 1)

  const shiftedStartStr = format(shiftedStart, 'yyyy-MM-dd')
  const shiftedEndStr = format(shiftedEnd, 'yyyy-MM-dd')

  return shiftedStartStr >= planStart && shiftedEndStr <= planEnd
}

export function findShorterPerfectWindows(
  responses: PlanResponse[],
  startRange: string,
  endRange: string,
  originalDuration: number
): ShorterTripSuggestion | null {
  for (let d = originalDuration - 1; d >= Math.max(1, originalDuration - 3); d--) {
    const scored = scoreWindows(startRange, endRange, d, responses)
    const perfectWindows = scored.filter((w) => w.percentage === 100)

    if (perfectWindows.length > 0) {
      return {
        duration: d,
        windowCount: perfectWindows.length,
        windows: perfectWindows.slice(0, 3).map((w) => ({
          start: w.start,
          end: w.end,
          percentage: 100,
          availableCount: w.availableCount,
          totalCount: w.totalCount,
          missing: [],
        })),
      }
    }
  }

  return null
}

export function findConstrainingPeople(
  topWindows: ScoredWindow[],
  responses: PlanResponse[],
  numDays: number
): Array<{ id: string; name: string; availableDays: number }> {
  if (topWindows.length < 3) return []

  const blockerCounts = new Map<string, { id: string; count: number }>()

  for (const window of topWindows) {
    for (const blocker of window.blockers) {
      const existing = blockerCounts.get(blocker.name)
      if (existing) {
        existing.count++
      } else {
        blockerCounts.set(blocker.name, { id: blocker.id, count: 1 })
      }
    }
  }

  const constrainers: Array<{ id: string; name: string; availableDays: number }> = []
  for (const [name, { id, count }] of blockerCounts) {
    if (count >= 3) {
      const response = responses.find((r) => r.id === id)
      const availableDays = response?.availableDates.length ?? 0
      if (availableDays < numDays) {
        constrainers.push({ id, name, availableDays })
      }
    }
  }

  return constrainers.sort((a, b) => a.availableDays - b.availableDays)
}

export function toAlternativeWindow(w: ScoredWindow): AlternativeWindow {
  return {
    start: w.start,
    end: w.end,
    percentage: w.percentage,
    availableCount: w.availableCount,
    totalCount: w.totalCount,
    missing: w.blockers.map((b) => b.name),
  }
}
