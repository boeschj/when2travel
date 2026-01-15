import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarNavHeaderProps {
  month: Date
  onPrevious: () => void
  onNext: () => void
  showPrevious?: boolean
  showNext?: boolean
}

export function CalendarNavHeader({
  month,
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
}: CalendarNavHeaderProps) {
  return (
    <div className="flex items-center w-[308px]">
      {showPrevious ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPrevious}
          className="rounded-full hover:bg-white/10 text-foreground transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-5" />
        </Button>
      ) : (
        <div className="size-8" />
      )}

      <h2 className="text-foreground text-lg font-bold flex-1 text-center">
        {format(month, 'MMMM yyyy')}
      </h2>

      {showNext ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onNext}
          className="rounded-full hover:bg-white/10 text-foreground transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </Button>
      ) : (
        <div className="size-8" />
      )}
    </div>
  )
}
