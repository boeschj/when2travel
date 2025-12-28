import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '../atoms/user-avatar'
import type { CompatibleDateRange } from '@/lib/types'
import { parseISO, eachDayOfInterval, format } from 'date-fns'

type RespondentStatus = 'available' | 'partial' | 'unavailable'

interface Respondent {
  id: string
  name: string
  availableDates: string[]
  isCurrentUser: boolean
}

interface RespondentChipsProps {
  respondents: Respondent[]
  bestWindow: CompatibleDateRange | null
  selectedRespondentId: string | null
  onRespondentClick: (respondentId: string | null) => void
  startRange: string
  endRange: string
  numDays: number
  className?: string
}

// TODO: Refactor into smaller functions - this has two distinct branches (with/without bestWindow)
function getRespondentStatus(
  respondent: Respondent,
  bestWindow: CompatibleDateRange | null,
  startRange: string,
  endRange: string,
  numDays: number
): RespondentStatus {
  if (bestWindow) {
    const windowStart = parseISO(bestWindow.start)
    const windowEnd = parseISO(bestWindow.end)
    const windowDates = eachDayOfInterval({ start: windowStart, end: windowEnd })

    const availableDatesSet = new Set(respondent.availableDates)
    let availableDaysInWindow = 0

    for (const date of windowDates) {
      if (availableDatesSet.has(format(date, 'yyyy-MM-dd'))) {
        availableDaysInWindow++
      }
    }

    if (availableDaysInWindow === windowDates.length) return 'available'
    if (availableDaysInWindow > 0) return 'partial'
    return 'unavailable'
  }

  const allDates = eachDayOfInterval({
    start: parseISO(startRange),
    end: parseISO(endRange)
  })

  const availableDatesSet = new Set(respondent.availableDates)
  let maxConsecutive = 0
  let currentConsecutive = 0

  for (const date of allDates) {
    if (availableDatesSet.has(format(date, 'yyyy-MM-dd'))) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 0
    }
  }

  if (maxConsecutive >= numDays) return 'available'
  if (maxConsecutive > 0) return 'partial'
  return 'unavailable'
}

const statusConfig = {
  available: {
    Icon: CheckCircle,
    iconClass: 'text-primary'
  },
  partial: {
    Icon: AlertCircle,
    iconClass: 'text-status-yellow'
  },
  unavailable: {
    Icon: XCircle,
    iconClass: 'text-status-red'
  }
} as const

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

export function RespondentChips({
  respondents,
  bestWindow,
  selectedRespondentId,
  onRespondentClick,
  startRange,
  endRange,
  numDays,
  className
}: RespondentChipsProps) {
  const handleChipClick = (respondentId: string) => {
    if (selectedRespondentId === respondentId) {
      onRespondentClick(null)
    } else {
      onRespondentClick(respondentId)
    }
  }

  const selectedRespondent = selectedRespondentId
    ? respondents.find(r => r.id === selectedRespondentId)
    : null

  const selectedName = selectedRespondent
    ? selectedRespondent.isCurrentUser
      ? 'You'
      : selectedRespondent.name
    : null

  return (
    <div className={cn('flex flex-col gap-3 min-w-0', className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-foreground text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            Respondents ({respondents.length}/{respondents.length})
          </span>
          <span className="text-text-secondary text-sm">
            {selectedRespondentId ? (
              <>Viewing: <span className="text-primary font-medium">{selectedName}</span></>
            ) : (
              'Select a person to filter'
            )}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRespondentClick(null)}
          className={cn(
            'h-6 px-2 text-xs rounded-full border-border hover:border-primary hover:text-primary hover:scale-100 hover:bg-transparent',
            !selectedRespondentId && 'invisible'
          )}
        >
          Clear
        </Button>
      </div>

      <ScrollableChipsContainer>
        <div className="flex gap-2 overflow-x-auto px-6 py-1 scrollbar-hide max-w-full">
          {respondents.map(respondent => {
            const status = getRespondentStatus(respondent, bestWindow, startRange, endRange, numDays)
            const config = statusConfig[status]
            const isSelected = selectedRespondentId === respondent.id

            return (
              <Button
                key={respondent.id}
                variant="outline"
                onClick={() => handleChipClick(respondent.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 h-auto rounded-full flex-shrink-0',
                  'bg-surface-dark hover:bg-surface-dark hover:scale-100',
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/20'
                    : respondent.isCurrentUser
                    ? 'border-primary'
                    : 'border-border'
                )}
              >
                <UserAvatar
                  name={respondent.name}
                  isCurrentUser={respondent.isCurrentUser}
                  colorId={respondent.id}
                  className="size-6"
                />
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  {respondent.isCurrentUser ? 'You' : respondent.name}
                </span>
                <config.Icon className={cn('w-4 h-4', config.iconClass)} />
              </Button>
            )
          })}
        </div>
      </ScrollableChipsContainer>
    </div>
  )
}
