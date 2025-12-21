import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface CalendarHeaderProps {
  date: Date
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  showNavigation?: boolean
  showPrevious?: boolean
  showNext?: boolean
  className?: string
}

export function CalendarHeader({
  date,
  onPreviousMonth,
  onNextMonth,
  showNavigation = true,
  showPrevious = true,
  showNext = true,
  className
}: CalendarHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showNavigation && showPrevious && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPreviousMonth}
          className="rounded-full hover:bg-white/10 text-foreground transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-5" />
        </Button>
      )}

      <h2 className="text-foreground text-2xl font-bold">
        {format(date, 'MMMM yyyy')}
      </h2>

      {showNavigation && showNext && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNextMonth}
          className="rounded-full hover:bg-white/10 text-foreground transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </Button>
      )}
    </div>
  )
}