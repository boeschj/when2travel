import { cn } from '@/lib/utils'
import { UserAvatar } from '../atoms/user-avatar'
import { format, parseISO } from 'date-fns'
import type { PlanResponse } from '@/lib/types'

interface RespondentCardProps extends Pick<PlanResponse, 'name' | 'id'> {
  availableDates?: PlanResponse['availableDates']
  isCurrentUser?: boolean
  onClick?: () => void
  className?: string
}

export function RespondentCard({
  id,
  name,
  availableDates = [],
  isCurrentUser,
  onClick,
  className
}: RespondentCardProps) {
  const isClickable = !!onClick
  const availabilityText = formatAvailabilityText(availableDates)
  const displayName = isCurrentUser ? `${name} (You)` : name

  const containerClassName = cn(
    'flex items-center gap-3 p-3 rounded-lg transition-colors',
    isClickable && 'cursor-pointer hover:bg-white/5 group',
    isCurrentUser && 'bg-white/5 border border-border/50',
    className
  )

  const nameClassName = cn(
    'text-white text-sm font-semibold truncate',
    isClickable && 'group-hover:text-primary transition-colors'
  )

  return (
    <div
      className={containerClassName}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <UserAvatar name={name} colorId={id} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className={nameClassName}>{displayName}</span>
        <span className="text-text-secondary text-xs truncate">
          {availabilityText}
        </span>
      </div>
    </div>
  )
}

function formatAvailabilityText(availableDates: string[]): string {
  const hasNoDates = availableDates.length === 0
  if (hasNoDates) return 'No availability set'

  const sortedDates = [...availableDates].sort()
  const earliestFormatted = format(parseISO(sortedDates[0]), 'MMM d')

  const hasSingleDate = sortedDates.length === 1
  if (hasSingleDate) return earliestFormatted

  const latestFormatted = format(parseISO(sortedDates[sortedDates.length - 1]), 'd')

  return `Available ${earliestFormatted}-${latestFormatted}`
}
