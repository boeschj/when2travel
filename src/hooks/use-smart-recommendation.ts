import { useMemo } from 'react'
import {
  eachDayOfInterval,
  parseISO,
  format,
  addDays,
  differenceInDays,
} from 'date-fns'
import type { PlanWithResponses, PlanResponse } from '@/lib/types'
import { pluralize } from '@/lib/utils'
import {
  type Recommendation,
  type RecommendationResult,
  type ScoredWindow,
  type BlockerInfo,
  type AlternativeWindow,
  type ShorterTripSuggestion,
  getStatusFromPercentage,
  formatNameList,
} from '@/lib/recommendation-types'

/**
 * Smart Recommendation Algorithm
 *
 * Analyzes availability data and provides actionable guidance.
 * Returns ALL matching recommendations sorted by priority.
 * Priority stack:
 *   P1: Perfect window exists (100%)
 *   P2: Single blocker + can shift (adjacent availability)
 *   P3: Single blocker, no adjacent
 *   P4: Shorter trip unlocks perfect
 *   P5: One person constraining all top windows
 *   P6: Good enough exists (≥80%)
 *   P7: Range too narrow
 *   P8: Multiple comparable options (within 5%)
 *   P9: Fallback
 */
export function useSmartRecommendation(
  plan: PlanWithResponses | undefined | null
): RecommendationResult | null {
  return useMemo(() => {
    if (!plan?.responses || plan.responses.length === 0) return null

    const responses = plan.responses
    const totalCount = responses.length
    const { numDays, startRange, endRange } = plan

    const allWindows = generateAllWindows(startRange, endRange, numDays)
    const scoredWindows = allWindows
      .map((w) => scoreWindow(w.start, w.end, responses, startRange, endRange))
      .sort((a, b) => b.percentage - a.percentage || a.start.localeCompare(b.start))

    const bestWindow = scoredWindows[0] ?? null
    const allRecommendations: Recommendation[] = []

    if (bestWindow && bestWindow.percentage === 100) {
      allRecommendations.push(createP1Recommendation(bestWindow, totalCount))
    }

    if (bestWindow && bestWindow.blockers.length === 1) {
      const blocker = bestWindow.blockers[0]

      if (blocker.shiftDirection && blocker.shiftDays > 0) {
        const shiftValid = validateShiftedWindow(
          bestWindow.start,
          blocker.shiftDays,
          blocker.shiftDirection,
          startRange,
          endRange,
          numDays
        )
        if (shiftValid) {
          allRecommendations.push(createP2Recommendation(bestWindow, blocker, totalCount))
        }
      }

      if (!allRecommendations.some(r => r.priority === 2)) {
        allRecommendations.push(createP3Recommendation(bestWindow, blocker, totalCount))
      }
    }

    const shorterTrip = findShorterPerfectWindows(responses, startRange, endRange, numDays)
    if (shorterTrip) {
      allRecommendations.push(createP4Recommendation(bestWindow, shorterTrip, numDays))
    }

    const constrainingPeople = findConstrainingPeople(scoredWindows.slice(0, 5), responses, numDays)
    if (constrainingPeople.length > 0) {
      allRecommendations.push(createP5Recommendation(bestWindow, constrainingPeople, totalCount))
    }

    if (bestWindow && bestWindow.percentage >= 80) {
      allRecommendations.push(createP6Recommendation(bestWindow, totalCount, scoredWindows))
    }

    const rangeDays = differenceInDays(parseISO(endRange), parseISO(startRange)) + 1
    if (rangeDays < numDays * 1.5) {
      allRecommendations.push(createP7Recommendation(bestWindow, numDays, rangeDays, totalCount))
    }

    if (bestWindow) {
      const comparableWindows = scoredWindows.filter(
        (w) => Math.abs(w.percentage - bestWindow.percentage) <= 5
      )
      if (comparableWindows.length >= 2) {
        const [windowA, windowB] = comparableWindows
        const blockersA = new Set(windowA.blockers.map((b) => b.name))
        const blockersB = new Set(windowB.blockers.map((b) => b.name))
        const hasDifferentBlockers =
          ![...blockersA].every((name) => blockersB.has(name)) ||
          ![...blockersB].every((name) => blockersA.has(name))

        if (hasDifferentBlockers) {
          allRecommendations.push(createP8Recommendation(bestWindow, comparableWindows.slice(0, 2), totalCount))
        }
      }
    }

    allRecommendations.push(createP9Recommendation(bestWindow, totalCount, scoredWindows))
    allRecommendations.sort((a, b) => a.priority - b.priority)

    const [primary, ...alternatives] = allRecommendations

    return {
      primary,
      alternatives,
    }
  }, [plan])
}

/** Generate all possible N-day windows in the range */
function generateAllWindows(
  startRange: string,
  endRange: string,
  numDays: number
): Array<{ start: string; end: string }> {
  const windows: Array<{ start: string; end: string }> = []
  const rangeStart = parseISO(startRange)
  const rangeEnd = parseISO(endRange)
  const rangeDays = differenceInDays(rangeEnd, rangeStart) + 1

  if (rangeDays < numDays) return windows

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

/** Score a window with per-window blocker analysis */
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

/** Analyze a blocker for adjacent availability */
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

/** Validate that a shifted window stays within plan bounds */
function validateShiftedWindow(
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

/** Find perfect windows at shorter durations */
function findShorterPerfectWindows(
  responses: PlanResponse[],
  startRange: string,
  endRange: string,
  originalDuration: number
): ShorterTripSuggestion | null {
  for (let d = originalDuration - 1; d >= Math.max(1, originalDuration - 3); d--) {
    const windows = generateAllWindows(startRange, endRange, d)
    const perfectWindows = windows
      .map((w) => scoreWindow(w.start, w.end, responses, startRange, endRange))
      .filter((w) => w.percentage === 100)

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

/** Find people truly constrained by limited availability (blocking 3+ windows AND have fewer days than trip needs) */
function findConstrainingPeople(
  topWindows: ScoredWindow[],
  responses: PlanResponse[],
  numDays: number
): { id: string; name: string; availableDays: number }[] {
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

  const constrainers: { id: string; name: string; availableDays: number }[] = []
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

/** Convert ScoredWindow to AlternativeWindow */
function toAlternativeWindow(w: ScoredWindow): AlternativeWindow {
  return {
    start: w.start,
    end: w.end,
    percentage: w.percentage,
    availableCount: w.availableCount,
    totalCount: w.totalCount,
    missing: w.blockers.map((b) => b.name),
  }
}

function createP1Recommendation(
  bestWindow: ScoredWindow,
  totalCount: number
): Recommendation {
  return {
    priority: 1,
    status: 'perfect',
    headline: 'Pack your bags!',
    detail: `Everyone's in (${totalCount}/${totalCount})`,
    recommendation: 'You found the sweet spot — time to book!',
    bestWindow,
  }
}

function createP2Recommendation(
  bestWindow: ScoredWindow,
  blocker: BlockerInfo,
  totalCount: number
): Recommendation {
  const missingStr = formatDateRange(blocker.missingDates)
  const shiftDir = blocker.shiftDirection === 'earlier' ? 'earlier' : 'later'

  return {
    priority: 2,
    status: getStatusFromPercentage(bestWindow.percentage),
    headline: 'So close!',
    detail: `${bestWindow.availableCount}/${totalCount} travelers ready to go`,
    recommendation: `${blocker.name} can't make ${missingStr}, but shifting ${blocker.shiftDays} ${pluralize(blocker.shiftDays, 'day')} ${shiftDir} could get everyone on board.`,
    bestWindow,
    blockerId: blocker.id,
    blockerShiftDirection: blocker.shiftDirection ?? undefined,
  }
}

function createP3Recommendation(
  bestWindow: ScoredWindow,
  blocker: BlockerInfo,
  totalCount: number
): Recommendation {
  const missingStr = formatDateRange(blocker.missingDates)

  return {
    priority: 3,
    status: getStatusFromPercentage(bestWindow.percentage),
    headline: 'Almost there!',
    detail: `${bestWindow.availableCount}/${totalCount} travelers ready to go`,
    recommendation: `${blocker.name} can't make ${missingStr} — maybe they can shuffle things around?`,
    bestWindow,
    blockerId: blocker.id,
  }
}

function createP4Recommendation(
  bestWindow: ScoredWindow | null,
  shorterTrip: ShorterTripSuggestion,
  originalDuration: number
): Recommendation {
  const bestPct = bestWindow?.percentage ?? 0

  return {
    priority: 4,
    status: getStatusFromPercentage(bestPct),
    headline: 'Quick trip, anyone?',
    detail: bestWindow
      ? `${originalDuration} days is tricky, but ${shorterTrip.duration} days works perfectly`
      : `${originalDuration} days doesn't quite fit, but ${shorterTrip.duration} days does`,
    recommendation: `Good news! ${shorterTrip.windowCount === 1 ? "There's a" : `There are ${shorterTrip.windowCount}`} perfect ${shorterTrip.duration}-day ${pluralize(shorterTrip.windowCount, 'window')} where everyone's free.`,
    shorterTripSuggestion: shorterTrip,
    bestWindow: bestWindow ?? undefined,
    alternativeWindows: shorterTrip.windows,
  }
}

function createP5Recommendation(
  bestWindow: ScoredWindow | null,
  constrainers: { id: string; name: string; availableDays: number }[],
  totalCount: number
): Recommendation {
  const bestPct = bestWindow?.percentage ?? 0
  const names = constrainers.map((c) => c.name)
  const ids = constrainers.map((c) => c.id)

  let recommendation: string
  if (constrainers.length === 1) {
    const c = constrainers[0]
    recommendation = `${c.name} only has ${c.availableDays} ${pluralize(c.availableDays, 'day')} free, which limits the options. Worth checking if they can open up more dates!`
  } else {
    recommendation = `Some people have limited availability. Check the calendar to resolve scheduling conflicts!`
  }

  return {
    priority: 5,
    status: getStatusFromPercentage(bestPct),
    headline: 'We have a majority!',
    detail: bestWindow
      ? `Best window fits ${bestWindow.availableCount}/${totalCount} travelers`
      : 'Still looking for overlap',
    recommendation,
    bestWindow: bestWindow ?? undefined,
    constrainingPerson: formatNameList(names),
    constrainingPersonIds: ids,
  }
}

function createP6Recommendation(
  bestWindow: ScoredWindow,
  totalCount: number,
  allWindows: ScoredWindow[]
): Recommendation {
  const alternatives = allWindows
    .filter((w) => w.start !== bestWindow.start)
    .slice(0, 3)
    .map(toAlternativeWindow)

  return {
    priority: 6,
    status: getStatusFromPercentage(bestWindow.percentage),
    headline: 'Looking good!',
    detail: `${bestWindow.availableCount}/${totalCount} travelers can make it`,
    recommendation: `This is your best window! You could also try tweaking the date range to get everyone aligned.`,
    bestWindow,
    alternativeWindows: alternatives.length > 0 ? alternatives : undefined,
  }
}

function createP7Recommendation(
  bestWindow: ScoredWindow | null,
  numDays: number,
  rangeDays: number,
  totalCount: number
): Recommendation {
  const bestPct = bestWindow?.percentage ?? 0

  return {
    priority: 7,
    status: getStatusFromPercentage(bestPct),
    headline: 'Feeling cramped 😅',
    detail: bestWindow
      ? `Best window fits ${bestWindow.availableCount}/${totalCount} travelers`
      : 'No windows found yet',
    recommendation: `Fitting ${numDays} days into a ${rangeDays}-day window is tight! Try expanding the date range for more flexibility.`,
    bestWindow: bestWindow ?? undefined,
  }
}

function createP8Recommendation(
  bestWindow: ScoredWindow,
  comparableWindows: ScoredWindow[],
  totalCount: number
): Recommendation {
  const [windowA, windowB] = comparableWindows
  const missingA = formatNameList(windowA.blockers.map((b) => b.name))
  const missingB = formatNameList(windowB.blockers.map((b) => b.name))

  return {
    priority: 8,
    status: getStatusFromPercentage(bestWindow.percentage),
    headline: 'Decisions, decisions!',
    detail: `${bestWindow.availableCount}/${totalCount} can make either window`,
    recommendation: `${formatDateRangeShort(windowA.start, windowA.end)} doesn't work for ${missingA}. ${formatDateRangeShort(windowB.start, windowB.end)} doesn't work for ${missingB}. See if either group can budge!`,
    bestWindow,
    alternativeWindows: comparableWindows.map(toAlternativeWindow),
  }
}

function createP9Recommendation(
  bestWindow: ScoredWindow | null,
  totalCount: number,
  allWindows: ScoredWindow[]
): Recommendation {
  const bestPct = bestWindow?.percentage ?? 0
  const alternatives = allWindows.slice(0, 3).map(toAlternativeWindow)

  return {
    priority: 9,
    status: getStatusFromPercentage(bestPct),
    headline: 'Still exploring 🏔️',
    detail: bestWindow
      ? `Best window fits ${bestWindow.availableCount}/${totalCount} travelers`
      : 'Waiting for the stars to align',
    recommendation:
      bestPct > 0
        ? `The heatmap below shows where people overlap. Play with the dates to find a better fit!`
        : 'No overlap yet — waiting for more responses or try different dates.',
    bestWindow: bestWindow ?? undefined,
    alternativeWindows: alternatives.length > 0 ? alternatives : undefined,
  }
}

/** Format an array of dates into a readable range string */
function formatDateRange(dates: string[]): string {
  if (dates.length === 0) return ''
  if (dates.length === 1) return formatSingleDate(dates[0])

  const sorted = [...dates].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return `${formatSingleDate(first)} – ${formatSingleDate(last)}`
}

/** Format a single date as "Dec 14" */
function formatSingleDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

/** Format start/end as "Dec 14-18" */
function formatDateRangeShort(start: string, end: string): string {
  const startDate = parseISO(start)
  const endDate = parseISO(end)

  const startMonth = format(startDate, 'MMM')
  const endMonth = format(endDate, 'MMM')

  if (startMonth === endMonth) {
    return `${startMonth} ${format(startDate, 'd')}-${format(endDate, 'd')}`
  }

  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
}
