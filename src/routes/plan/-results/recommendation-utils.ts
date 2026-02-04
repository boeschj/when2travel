import { format, parseISO } from 'date-fns'
import {
  CheckCircle2,
  ThumbsUp,
  Users,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import { pluralize } from '@/lib/utils'
import { RECOMMENDATION_STATUS } from './recommendation-types'

import type { RecommendationStatus } from './recommendation-types'

export function buildGoogleCalendarUrl(planName: string, startDate: string, endDate: string): string {
  const formatDateForCalendar = (iso: string) => iso.replace(/-/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: planName,
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function formatDateRangeDisplay(start: string, end: string): string {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`
}

export function getStatusIcon(status: RecommendationStatus) {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT:
      return CheckCircle2
    case RECOMMENDATION_STATUS.GREAT:
      return ThumbsUp
    case RECOMMENDATION_STATUS.GOOD:
      return Users
    case RECOMMENDATION_STATUS.POSSIBLE:
      return AlertCircle
    case RECOMMENDATION_STATUS.UNLIKELY:
      return AlertTriangle
  }
}

export function getStatusStyles(status: RecommendationStatus): {
  iconColor: string
  bgColor: string
  accentColor: string
} {
  switch (status) {
    case RECOMMENDATION_STATUS.PERFECT:
    case RECOMMENDATION_STATUS.GREAT:
      return { iconColor: 'text-primary', bgColor: 'bg-primary/20', accentColor: 'text-primary' }
    case RECOMMENDATION_STATUS.GOOD:
    case RECOMMENDATION_STATUS.POSSIBLE:
      return { iconColor: 'text-status-yellow', bgColor: 'bg-status-yellow/20', accentColor: 'text-status-yellow' }
    case RECOMMENDATION_STATUS.UNLIKELY:
      return { iconColor: 'text-status-red', bgColor: 'bg-status-red/20', accentColor: 'text-status-red' }
  }
}

export function derivePersonalizedCTA({ isCurrentUserBlocker, isCurrentUserConstrainer, priority, blockerShiftDirection }: {
  isCurrentUserBlocker: boolean
  isCurrentUserConstrainer: boolean
  priority: number
  blockerShiftDirection?: string
}): {
  label: string
  emphasis: boolean
} | null {
  if (isCurrentUserBlocker) {
    if (priority === 2 && blockerShiftDirection) {
      const directionLabel = blockerShiftDirection === 'earlier' ? 'Earlier' : 'Later'
      return { label: `Shift Your Dates ${directionLabel}`, emphasis: true }
    }
    if (priority === 3) {
      return { label: 'Update Your Dates', emphasis: true }
    }
  }
  if (isCurrentUserConstrainer && priority === 5) {
    return { label: 'Add More Dates', emphasis: true }
  }
  return null
}

interface BestWindow {
  totalCount: number
  availableCount: number
}

export function deriveAvailabilityText(
  bestWindow: BestWindow | undefined,
  isPerfect: boolean,
): string | null {
  if (!bestWindow) return null

  if (isPerfect) {
    return `All ${bestWindow.totalCount} ${pluralize(bestWindow.totalCount, 'person', 'people')} available`
  }

  return `${bestWindow.availableCount}/${bestWindow.totalCount} ${pluralize(bestWindow.totalCount, 'person', 'people')} available`
}
