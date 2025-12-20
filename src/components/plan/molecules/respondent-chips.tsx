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
  className?: string
}

function getRespondentStatus(
  respondent: Respondent,
  bestWindow: CompatibleDateRange | null
): RespondentStatus {
  if (!bestWindow) return 'unavailable'

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

export function RespondentChips({
  respondents,
  bestWindow,
  selectedRespondentId,
  onRespondentClick,
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
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-4">
        <span className="text-foreground text-xs font-semibold uppercase tracking-wider">
          Respondents ({respondents.length}/{respondents.length})
        </span>
        <span className="text-text-secondary text-sm">
          {selectedRespondentId ? (
            <>Viewing availability for: <span className="text-primary font-medium">{selectedName}</span></>
          ) : (
            'Click a person to see their availability window'
          )}
        </span>
        {selectedRespondentId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRespondentClick(null)}
            className="h-6 px-2 text-xs rounded-full border-border hover:border-primary hover:text-primary hover:scale-100 hover:bg-transparent"
          >
            Clear
          </Button>
        ) : (
          <div className="h-6 w-[52px]" aria-hidden />
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto p-1 -m-1 scrollbar-hide">
        {respondents.map(respondent => {
          const status = getRespondentStatus(respondent, bestWindow)
          const config = statusConfig[status]
          const isSelected = selectedRespondentId === respondent.id
          const StatusIcon = config.Icon

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
                className="size-6"
              />
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {respondent.isCurrentUser ? 'You' : respondent.name}
              </span>
              <StatusIcon className={cn('w-4 h-4', config.iconClass)} />
            </Button>
          )
        })}
      </div>
    </div>
  )
}
