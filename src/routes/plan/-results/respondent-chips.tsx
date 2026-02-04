import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './user-avatar'
import { useResultsValue, useResultsActions } from './results-context'
import { parseISO, eachDayOfInterval, format } from 'date-fns'

import type { CompatibleDateRange } from '@/lib/types'
import type { Respondent } from './results-context'

const RESPONDENT_STATUS = {
  AVAILABLE: 'available',
  PARTIAL: 'partial',
  UNAVAILABLE: 'unavailable'
} as const

type RespondentStatus = (typeof RESPONDENT_STATUS)[keyof typeof RESPONDENT_STATUS]

interface RespondentChipsProps {
  className?: string
}

interface RespondentChipProps {
  respondent: Respondent
  status: RespondentStatus
  isSelected: boolean
  onClick: () => void
}

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

function getRespondentStatus({
  respondent,
  bestWindow,
  startRange,
  endRange,
  requiredDays
}: {
  respondent: Respondent
  bestWindow: CompatibleDateRange | null
  startRange: string
  endRange: string
  requiredDays: number
}): RespondentStatus {
  if (bestWindow) {
    return getWindowAvailabilityStatus(respondent, bestWindow)
  }
  return getConsecutiveAvailabilityStatus({ respondent, startRange, endRange, requiredDays })
}

const STATUS_DISPLAY = {
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

function getDisplayName(respondent: Respondent): string {
  if (respondent.isCurrentUser) return 'You'
  return respondent.name
}

export function RespondentChips({ className }: RespondentChipsProps) {
  const { respondents, bestWindow, selectedRespondentId, plan } = useResultsValue()
  const { onRespondentClick } = useResultsActions()

  const selectedRespondent = respondents.find(
    respondent => respondent.id === selectedRespondentId
  )
  const selectedDisplayName = selectedRespondent && getDisplayName(selectedRespondent)
  const hasSelection = Boolean(selectedRespondentId)

  const handleChipClick = (respondentId: string) => {
    if (selectedRespondentId === respondentId) {
      onRespondentClick(null)
      return
    }
    onRespondentClick(respondentId)
  }

  return (
    <div className={cn('flex flex-col gap-3 min-w-0', className)}>
      <ChipsHeader
        respondentCount={respondents.length}
        selectedName={selectedDisplayName}
        hasSelection={hasSelection}
        onClear={() => onRespondentClick(null)}
      />

      <ScrollableChipsContainer>
        <div className="flex gap-2 overflow-x-auto px-6 py-1 scrollbar-hide max-w-full">
          {respondents.map(respondent => {
            const status = getRespondentStatus({
              respondent,
              bestWindow,
              startRange: plan.startRange,
              endRange: plan.endRange,
              requiredDays: plan.numDays
            })
            const isSelected = selectedRespondentId === respondent.id

            return (
              <RespondentChip
                key={respondent.id}
                respondent={respondent}
                status={status}
                isSelected={isSelected}
                onClick={() => handleChipClick(respondent.id)}
              />
            )
          })}
        </div>
      </ScrollableChipsContainer>
    </div>
  )
}

interface ChipsHeaderProps {
  respondentCount: number
  selectedName: string | undefined
  hasSelection: boolean
  onClear: () => void
}

function ChipsHeader({ respondentCount, selectedName, hasSelection, onClear }: ChipsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-foreground text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
          Respondents ({respondentCount}/{respondentCount})
        </span>
        <FilterStatus selectedName={selectedName} />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className={cn(
          'h-6 px-2 text-xs rounded-full border-border hover:border-primary hover:text-primary hover:scale-100 hover:bg-transparent',
          !hasSelection && 'invisible'
        )}
      >
        Clear
      </Button>
    </div>
  )
}

function FilterStatus({ selectedName }: { selectedName: string | undefined }) {
  if (!selectedName) {
    return <span className="text-text-secondary text-sm">Select a person to filter</span>
  }

  return (
    <span className="text-text-secondary text-sm">
      Viewing: <span className="text-primary font-medium">{selectedName}</span>
    </span>
  )
}

function ScrollableChipsContainer({ children }: { children: React.ReactNode }) {
  const fadeGradientBase = 'pointer-events-none absolute top-0 bottom-0 z-10'

  return (
    <div className="relative overflow-hidden">
      <div
        className={cn(fadeGradientBase, 'left-0 w-12')}
        style={{
          background: 'linear-gradient(to right, var(--color-surface-dark) 0%, var(--color-surface-dark) 20%, transparent 100%)'
        }}
      />
      <div
        className={cn(fadeGradientBase, 'right-0 w-16')}
        style={{
          background: 'linear-gradient(to left, var(--color-surface-dark) 0%, var(--color-surface-dark) 30%, transparent 100%)'
        }}
      />
      {children}
    </div>
  )
}

function RespondentChip({ respondent, status, isSelected, onClick }: RespondentChipProps) {
  const { StatusIcon, iconClass } = STATUS_DISPLAY[status]
  const displayName = getDisplayName(respondent)

  const chipClassName = cn(
    'flex items-center gap-2 px-3 py-2 h-auto rounded-full flex-shrink-0',
    'bg-surface-dark hover:bg-surface-dark hover:scale-100',
    isSelected && 'ring-2 ring-primary bg-primary/20',
    !isSelected && respondent.isCurrentUser && 'border-primary',
    !isSelected && !respondent.isCurrentUser && 'border-border'
  )

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={chipClassName}
    >
      <UserAvatar
        name={respondent.name}
        colorId={respondent.id}
        className="size-6"
      />
      <span className="text-sm font-medium text-white whitespace-nowrap">
        {displayName}
      </span>
      <StatusIcon className={cn('w-4 h-4', iconClass)} />
    </Button>
  )
}
