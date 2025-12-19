import { cn } from '@/lib/utils'
import { UserAvatar } from '../atoms/user-avatar'
import { format, parseISO } from 'date-fns'
import type { PlanResponse } from '@/lib/types'

interface RespondentCardProps extends Pick<PlanResponse, 'name'> {
  availableDates?: PlanResponse['availableDates']
  isCurrentUser?: boolean
  onClick?: () => void
  className?: string
}

export function RespondentCard({
  name,
  availableDates = [],
  isCurrentUser,
  onClick,
  className
}: RespondentCardProps) {
  const getAvailabilityText = () => {
    if (availableDates.length === 0) return 'No availability set'
    if (availableDates.length === 1) {
      return format(parseISO(availableDates[0]), 'MMM d')
    }

    const sortedDates = [...availableDates].sort()
    const earliestDate = sortedDates[0]
    const latestDate = sortedDates[sortedDates.length - 1]

    return `Available ${format(parseISO(earliestDate), 'MMM d')}-${format(parseISO(latestDate), 'd')}`
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-white/5 group',
        isCurrentUser && 'bg-white/5 border border-border/50',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <UserAvatar name={name} isCurrentUser={isCurrentUser} />
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={cn(
            'text-white text-sm font-semibold truncate',
            onClick && 'group-hover:text-primary transition-colors'
          )}
        >
          {name} {isCurrentUser && '(You)'}
        </span>
        <span className="text-text-secondary text-xs truncate">
          {getAvailabilityText()}
        </span>
      </div>
    </div>
  )
}