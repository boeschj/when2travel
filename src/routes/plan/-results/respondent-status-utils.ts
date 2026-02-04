import { parseISO, eachDayOfInterval, format } from 'date-fns'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

import type { CompatibleDateRange } from '@/lib/types'
import type { Respondent } from './results-context'

export const RESPONDENT_STATUS = {
  AVAILABLE: 'available',
  PARTIAL: 'partial',
  UNAVAILABLE: 'unavailable'
} as const

export type RespondentStatus = (typeof RESPONDENT_STATUS)[keyof typeof RESPONDENT_STATUS]

function getWindowAvailabilityStatus(
  respondent: Respondent,
  bestWindow: CompatibleDateRange
): RespondentStatus {
  const windowDates = eachDayOfInterval({
    start: parseISO(bestWindow.start),
    end: parseISO(bestWindow.end)
  })

  const availableDatesSet = new Set(respondent.availableDates)
  const availableDaysInWindow = windowDates.filter(date =>
    availableDatesSet.has(format(date, 'yyyy-MM-dd'))
  ).length

  if (availableDaysInWindow === windowDates.length) return RESPONDENT_STATUS.AVAILABLE
  if (availableDaysInWindow > 0) return RESPONDENT_STATUS.PARTIAL
  return RESPONDENT_STATUS.UNAVAILABLE
}

function getConsecutiveAvailabilityStatus({
  respondent,
  startRange,
  endRange,
  requiredDays
}: {
  respondent: Respondent
  startRange: string
  endRange: string
  requiredDays: number
}): RespondentStatus {
  const allDates = eachDayOfInterval({
    start: parseISO(startRange),
    end: parseISO(endRange)
  })

  const availableDatesSet = new Set(respondent.availableDates)
  let maxConsecutiveDays = 0
  let currentConsecutiveDays = 0

  for (const date of allDates) {
    if (availableDatesSet.has(format(date, 'yyyy-MM-dd'))) {
      currentConsecutiveDays++
      maxConsecutiveDays = Math.max(maxConsecutiveDays, currentConsecutiveDays)
    } else {
      currentConsecutiveDays = 0
    }
  }

  if (maxConsecutiveDays >= requiredDays) return RESPONDENT_STATUS.AVAILABLE
  if (maxConsecutiveDays > 0) return RESPONDENT_STATUS.PARTIAL
  return RESPONDENT_STATUS.UNAVAILABLE
}

interface GetRespondentStatusInput {
  respondent: Respondent
  bestWindow: CompatibleDateRange | null
  startRange: string
  endRange: string
  requiredDays: number
}

export function getRespondentStatus({
  respondent,
  bestWindow,
  startRange,
  endRange,
  requiredDays
}: GetRespondentStatusInput): RespondentStatus {
  if (bestWindow) {
    return getWindowAvailabilityStatus(respondent, bestWindow)
  }
  return getConsecutiveAvailabilityStatus({ respondent, startRange, endRange, requiredDays })
}

export const STATUS_DISPLAY = {
  [RESPONDENT_STATUS.AVAILABLE]: {
    StatusIcon: CheckCircle,
    iconClass: 'text-primary'
  },
  [RESPONDENT_STATUS.PARTIAL]: {
    StatusIcon: AlertCircle,
    iconClass: 'text-status-yellow'
  },
  [RESPONDENT_STATUS.UNAVAILABLE]: {
    StatusIcon: XCircle,
    iconClass: 'text-status-red'
  }
} as const satisfies Record<RespondentStatus, { StatusIcon: typeof CheckCircle; iconClass: string }>

export function getDisplayName(respondent: Respondent): string {
  if (respondent.isCurrentUser) return 'You'
  return respondent.name
}
