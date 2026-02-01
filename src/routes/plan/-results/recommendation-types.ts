/**
 * Smart Recommendations Type Definitions
 *
 * Types for the recommendation algorithm that analyzes availability
 * and provides actionable guidance when perfect alignment doesn't exist.
 */

import { pluralize } from '@/lib/utils'

export const RECOMMENDATION_STATUS = {
  PERFECT: 'perfect',
  GREAT: 'great',
  GOOD: 'good',
  POSSIBLE: 'possible',
  UNLIKELY: 'unlikely',
} as const

export type RecommendationStatus = (typeof RECOMMENDATION_STATUS)[keyof typeof RECOMMENDATION_STATUS]

/** Priority levels for recommendation cases (P1 highest, P9 fallback) */
export type RecommendationPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Information about a respondent blocking a specific window */
export interface BlockerInfo {
  id: string
  name: string
  /** Dates within the window the blocker is missing */
  missingDates: string[]
  /** Count of missing dates */
  missingCount: number
  /** Whether blocker has availability the day before window starts */
  hasAdjacentBefore: boolean
  /** Whether blocker has availability the day after window ends */
  hasAdjacentAfter: boolean
  /** Suggested shift direction if adjacent availability exists */
  shiftDirection: 'earlier' | 'later' | null
  /** Number of days to shift to potentially align everyone */
  shiftDays: number
}

/** A window scored with availability percentage and blocker details */
export interface ScoredWindow {
  start: string
  end: string
  availableCount: number
  totalCount: number
  percentage: number
  blockers: BlockerInfo[]
}

/** Alternative window shown in recommendations (simplified view) */
export interface AlternativeWindow {
  start: string
  end: string
  percentage: number
  availableCount: number
  totalCount: number
  /** Names of respondents who can't make this window */
  missing: string[]
}

/** Suggestion for shorter trip duration (P4 case) */
export interface ShorterTripSuggestion {
  /** The shorter duration that unlocks perfect windows */
  duration: number
  /** Number of perfect windows at this duration */
  windowCount: number
  /** The actual windows (max 3) */
  windows: AlternativeWindow[]
}

/** The recommendation output from the algorithm */
export interface Recommendation {
  /** Priority case that matched (1-9) */
  priority: RecommendationPriority
  /** Status derived from best window percentage */
  status: RecommendationStatus
  /** Main headline (e.g., "All set.", "Almost there.") */
  headline: string
  /** Detail line (e.g., "80% of respondents (4/5) can make it") */
  detail: string
  /** Actionable recommendation text */
  recommendation: string
  /** Optional secondary text */
  secondary?: string
  /** Alternative windows to show (max 3) */
  alternativeWindows?: AlternativeWindow[]
  /** For P4: shorter trip suggestion with edit CTA data */
  shorterTripSuggestion?: ShorterTripSuggestion
  /** Best window data for UI rendering */
  bestWindow?: ScoredWindow
  /** For P2/P3: ID of the single blocker (for personalized CTA) */
  blockerId?: string
  /** For P2: suggested shift direction for the blocker */
  blockerShiftDirection?: 'earlier' | 'later'
  /** For P5: formatted string of constraining person name(s) */
  constrainingPerson?: string
  /** For P5: IDs of the constraining people (for personalized CTA) */
  constrainingPersonIds?: string[]
}

/** Result from the smart recommendation hook including alternatives */
export interface RecommendationResult {
  /** The primary recommendation (highest priority match) */
  primary: Recommendation
  /** Other recommendations that also matched (lower priority) */
  alternatives: Recommendation[]
}

/** Status thresholds for percentage-to-status mapping */
export const STATUS_THRESHOLDS = {
  PERFECT: 100,
  GREAT: 80,
  GOOD: 67,
  POSSIBLE: 50,
} as const

/** Get status from percentage */
export function getStatusFromPercentage(percentage: number): RecommendationStatus {
  if (percentage >= STATUS_THRESHOLDS.PERFECT) return RECOMMENDATION_STATUS.PERFECT
  if (percentage >= STATUS_THRESHOLDS.GREAT) return RECOMMENDATION_STATUS.GREAT
  if (percentage >= STATUS_THRESHOLDS.GOOD) return RECOMMENDATION_STATUS.GOOD
  if (percentage >= STATUS_THRESHOLDS.POSSIBLE) return RECOMMENDATION_STATUS.POSSIBLE
  return RECOMMENDATION_STATUS.UNLIKELY
}

/** Format a list of names with truncation (max 3 shown) */
export function formatNameList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]}`

  const displayNames = names.slice(0, 3)
  const remaining = names.length - 3
  return `${displayNames.join(', ')}, and ${remaining} ${pluralize(remaining, 'other')}`
}

/** Get a short label for each priority case */
export function getPriorityLabel(priority: RecommendationPriority): string {
  switch (priority) {
    case 1:
      return 'Perfect Match'
    case 2:
      return 'Shift Window'
    case 3:
      return 'Single Blocker'
    case 4:
      return 'Shorter Trip'
    case 5:
      return 'Schedule Conflict'
    case 6:
      return 'Good Enough'
    case 7:
      return 'Expand Range'
    case 8:
      return 'Multiple Options'
    case 9:
      return 'General'
    default:
      return 'Suggestion'
  }
}
