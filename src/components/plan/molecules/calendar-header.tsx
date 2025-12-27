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
  /** Additional class name for the next button (useful for responsive hiding) */
  nextButtonClassName?: string
}

export function CalendarHeader({
  date,
  onPreviousMonth,
  onNextMonth,
  showNavigation = true,
  showPrevious = true,
  showNext = true,
  className,
  nextButtonClassName
}: CalendarHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
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

      <h2 className="text-foreground text-2xl font-bold flex-1 text-center">
        {format(date, 'MMMM yyyy')}
      </h2>

      {showNavigation && showNext && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNextMonth}
          className={cn("rounded-full hover:bg-white/10 text-foreground transition-colors", nextButtonClassName)}
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </Button>
      )}
    </div>
  )
}