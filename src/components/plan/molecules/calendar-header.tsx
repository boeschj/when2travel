import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface CalendarHeaderProps {
  date: Date
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  showNavigation?: boolean
  className?: string
}

export function CalendarHeader({
  date,
  onPreviousMonth,
  onNextMonth,
  showNavigation = true,
  className
}: CalendarHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      {showNavigation ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Button>
      ) : (
        <div className="w-10" />
      )}

      <p className="text-white text-lg font-bold">
        {format(date, 'MMMM yyyy')}
      </p>

      {showNavigation ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Button>
      ) : (
        <div className="w-10" />
      )}
    </div>
  )
}