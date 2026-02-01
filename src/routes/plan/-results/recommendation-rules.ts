import { format, parseISO, differenceInDays } from 'date-fns'
import { pluralize } from '@/lib/utils'
import type {
  Recommendation,
  RecommendationPriority,
  ScoredWindow,
  ShorterTripSuggestion,
} from './recommendation-types'
import {
  RECOMMENDATION_STATUS,
  getStatusFromPercentage,
  formatNameList,
} from './recommendation-types'
import {
  validateShiftedWindow,
  toAlternativeWindow,
} from './recommendation-scoring'

export interface RuleContext {
  bestWindow: ScoredWindow | null
  scoredWindows: ScoredWindow[]
  totalCount: number
  responses: { id: string; name: string; availableDates: string[] }[]
  numDays: number
  startRange: string
  endRange: string
  shorterTrip: ShorterTripSuggestion | null
  constrainers: Array<{ id: string; name: string; availableDays: number }>
}

interface RecommendationRule {
  priority: RecommendationPriority
  matches: (ctx: RuleContext) => boolean
  create: (ctx: RuleContext) => Recommendation
}

const RULES: RecommendationRule[] = [
  {
    priority: 1,
    matches: (ctx) => ctx.bestWindow?.percentage === 100,
    create: (ctx) => ({
      priority: 1,
      status: RECOMMENDATION_STATUS.PERFECT,
      headline: 'Pack your bags!',
      detail: `Everyone's in (${ctx.totalCount}/${ctx.totalCount})`,
      recommendation: 'You found the sweet spot — time to book!',
      bestWindow: ctx.bestWindow!,
    }),
  },

  {
    priority: 2,
    matches: (ctx) => {
      if (!ctx.bestWindow || ctx.bestWindow.blockers.length !== 1) return false
      const blocker = ctx.bestWindow.blockers[0]
      if (!blocker.shiftDirection || blocker.shiftDays <= 0) return false
      return validateShiftedWindow(
        ctx.bestWindow.start,
        blocker.shiftDays,
        blocker.shiftDirection,
        ctx.startRange,
        ctx.endRange,
        ctx.numDays
      )
    },
    create: (ctx) => {
      const blocker = ctx.bestWindow!.blockers[0]
      const missingStr = formatDateRange(blocker.missingDates)
      const shiftDir = blocker.shiftDirection === 'earlier' ? 'earlier' : 'later'

      return {
        priority: 2,
        status: getStatusFromPercentage(ctx.bestWindow!.percentage),
        headline: 'So close!',
        detail: `${ctx.bestWindow!.availableCount}/${ctx.totalCount} travelers ready to go`,
        recommendation: `${blocker.name} can't make ${missingStr}, but shifting ${blocker.shiftDays} ${pluralize(blocker.shiftDays, 'day')} ${shiftDir} could get everyone on board.`,
        bestWindow: ctx.bestWindow!,
        blockerId: blocker.id,
        blockerShiftDirection: blocker.shiftDirection ?? undefined,
      }
    },
  },

  {
    priority: 3,
    matches: (ctx) => {
      if (!ctx.bestWindow || ctx.bestWindow.blockers.length !== 1) return false
      const blocker = ctx.bestWindow.blockers[0]
      const hasValidShift = blocker.shiftDirection && blocker.shiftDays > 0 &&
        validateShiftedWindow(
          ctx.bestWindow.start,
          blocker.shiftDays,
          blocker.shiftDirection,
          ctx.startRange,
          ctx.endRange,
          ctx.numDays
        )
      return !hasValidShift
    },
    create: (ctx) => {
      const blocker = ctx.bestWindow!.blockers[0]
      const missingStr = formatDateRange(blocker.missingDates)

      return {
        priority: 3,
        status: getStatusFromPercentage(ctx.bestWindow!.percentage),
        headline: 'Almost there!',
        detail: `${ctx.bestWindow!.availableCount}/${ctx.totalCount} travelers ready to go`,
        recommendation: `${blocker.name} can't make ${missingStr} — maybe they can shuffle things around?`,
        bestWindow: ctx.bestWindow!,
        blockerId: blocker.id,
      }
    },
  },

  {
    priority: 4,
    matches: (ctx) => ctx.shorterTrip !== null,
    create: (ctx) => {
      const bestPct = ctx.bestWindow?.percentage ?? 0

      return {
        priority: 4,
        status: getStatusFromPercentage(bestPct),
        headline: 'Quick trip, anyone?',
        detail: ctx.bestWindow
          ? `${ctx.numDays} days is tricky, but ${ctx.shorterTrip!.duration} days works perfectly`
          : `${ctx.numDays} days doesn't quite fit, but ${ctx.shorterTrip!.duration} days does`,
        recommendation: `Good news! ${ctx.shorterTrip!.windowCount === 1 ? "There's a" : `There are ${ctx.shorterTrip!.windowCount}`} perfect ${ctx.shorterTrip!.duration}-day ${pluralize(ctx.shorterTrip!.windowCount, 'window')} where everyone's free.`,
        shorterTripSuggestion: ctx.shorterTrip!,
        bestWindow: ctx.bestWindow ?? undefined,
        alternativeWindows: ctx.shorterTrip!.windows,
      }
    },
  },

  {
    priority: 5,
    matches: (ctx) => ctx.constrainers.length > 0,
    create: (ctx) => {
      const bestPct = ctx.bestWindow?.percentage ?? 0
      const names = ctx.constrainers.map((c) => c.name)
      const ids = ctx.constrainers.map((c) => c.id)

      let recommendation: string
      if (ctx.constrainers.length === 1) {
        const c = ctx.constrainers[0]
        recommendation = `${c.name} only has ${c.availableDays} ${pluralize(c.availableDays, 'day')} free, which limits the options. Worth checking if they can open up more dates!`
      } else {
        recommendation = `Some people have limited availability. Check the calendar to resolve scheduling conflicts!`
      }

      return {
        priority: 5,
        status: getStatusFromPercentage(bestPct),
        headline: 'We have a majority!',
        detail: ctx.bestWindow
          ? `Best window fits ${ctx.bestWindow.availableCount}/${ctx.totalCount} travelers`
          : 'Still looking for overlap',
        recommendation,
        bestWindow: ctx.bestWindow ?? undefined,
        constrainingPerson: formatNameList(names),
        constrainingPersonIds: ids,
      }
    },
  },

  {
    priority: 6,
    matches: (ctx) => (ctx.bestWindow?.percentage ?? 0) >= 80,
    create: (ctx) => {
      const alternatives = ctx.scoredWindows
        .filter((w) => w.start !== ctx.bestWindow!.start)
        .slice(0, 3)
        .map(toAlternativeWindow)

      return {
        priority: 6,
        status: getStatusFromPercentage(ctx.bestWindow!.percentage),
        headline: 'Looking good!',
        detail: `${ctx.bestWindow!.availableCount}/${ctx.totalCount} travelers can make it`,
        recommendation: `This is your best window! You could also try tweaking the date range to get everyone aligned.`,
        bestWindow: ctx.bestWindow!,
        alternativeWindows: alternatives.length > 0 ? alternatives : undefined,
      }
    },
  },

  {
    priority: 7,
    matches: (ctx) => {
      const rangeDays = differenceInDays(parseISO(ctx.endRange), parseISO(ctx.startRange)) + 1
      return rangeDays < ctx.numDays * 1.5
    },
    create: (ctx) => {
      const bestPct = ctx.bestWindow?.percentage ?? 0
      const rangeDays = differenceInDays(parseISO(ctx.endRange), parseISO(ctx.startRange)) + 1

      return {
        priority: 7,
        status: getStatusFromPercentage(bestPct),
        headline: 'Feeling cramped 😅',
        detail: ctx.bestWindow
          ? `Best window fits ${ctx.bestWindow.availableCount}/${ctx.totalCount} travelers`
          : 'No windows found yet',
        recommendation: `Fitting ${ctx.numDays} days into a ${rangeDays}-day window is tight! Try expanding the date range for more flexibility.`,
        bestWindow: ctx.bestWindow ?? undefined,
      }
    },
  },

  {
    priority: 8,
    matches: (ctx) => {
      if (!ctx.bestWindow) return false
      const comparableWindows = ctx.scoredWindows.filter(
        (w) => Math.abs(w.percentage - ctx.bestWindow!.percentage) <= 5
      )
      if (comparableWindows.length < 2) return false

      const [windowA, windowB] = comparableWindows
      const blockersA = new Set(windowA.blockers.map((b) => b.name))
      const blockersB = new Set(windowB.blockers.map((b) => b.name))
      const hasDifferentBlockers =
        ![...blockersA].every((name) => blockersB.has(name)) ||
        ![...blockersB].every((name) => blockersA.has(name))

      return hasDifferentBlockers
    },
    create: (ctx) => {
      const comparableWindows = ctx.scoredWindows
        .filter((w) => Math.abs(w.percentage - ctx.bestWindow!.percentage) <= 5)
        .slice(0, 2)

      const [windowA, windowB] = comparableWindows
      const missingA = formatNameList(windowA.blockers.map((b) => b.name))
      const missingB = formatNameList(windowB.blockers.map((b) => b.name))

      return {
        priority: 8,
        status: getStatusFromPercentage(ctx.bestWindow!.percentage),
        headline: 'Decisions, decisions!',
        detail: `${ctx.bestWindow!.availableCount}/${ctx.totalCount} can make either window`,
        recommendation: `${formatDateRangeShort(windowA.start, windowA.end)} doesn't work for ${missingA}. ${formatDateRangeShort(windowB.start, windowB.end)} doesn't work for ${missingB}. See if either group can budge!`,
        bestWindow: ctx.bestWindow!,
        alternativeWindows: comparableWindows.map(toAlternativeWindow),
      }
    },
  },

  {
    priority: 9,
    matches: () => true,
    create: (ctx) => {
      const bestPct = ctx.bestWindow?.percentage ?? 0
      const alternatives = ctx.scoredWindows.slice(0, 3).map(toAlternativeWindow)

      return {
        priority: 9,
        status: getStatusFromPercentage(bestPct),
        headline: 'Still exploring 🏔️',
        detail: ctx.bestWindow
          ? `Best window fits ${ctx.bestWindow.availableCount}/${ctx.totalCount} travelers`
          : 'Waiting for the stars to align',
        recommendation:
          bestPct > 0
            ? `The heatmap below shows where people overlap. Play with the dates to find a better fit!`
            : 'No overlap yet — waiting for more responses or try different dates.',
        bestWindow: ctx.bestWindow ?? undefined,
        alternativeWindows: alternatives.length > 0 ? alternatives : undefined,
      }
    },
  },
]

export function evaluateRules(context: RuleContext): Recommendation[] {
  return RULES
    .filter((rule) => rule.matches(context))
    .map((rule) => rule.create(context))
}

function formatDateRange(dates: string[]): string {
  if (dates.length === 0) return ''
  if (dates.length === 1) return formatSingleDate(dates[0])

  const sorted = [...dates].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return `${formatSingleDate(first)} – ${formatSingleDate(last)}`
}

function formatSingleDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

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
