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
  const monthLabel = format(month, 'MMMM yyyy')

  return (
    <div className="flex items-center w-[308px]">
      <NavButton
        direction="previous"
        visible={showPrevious}
        onClick={onPrevious}
      />

      <h2 className="text-foreground text-lg font-bold flex-1 text-center">
        {monthLabel}
      </h2>

      <NavButton
        direction="next"
        visible={showNext}
        onClick={onNext}
      />
    </div>
  )
}

interface NavButtonProps {
  direction: 'previous' | 'next'
  visible: boolean
  onClick: () => void
}

function NavButton({ direction, visible, onClick }: NavButtonProps) {
  if (!visible) {
    return <div className="size-8" />
  }

  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  const label = direction === 'previous' ? 'Previous month' : 'Next month'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className="rounded-full hover:bg-white/10 text-foreground transition-colors"
      aria-label={label}
    >
      <Icon className="size-5" />
    </Button>
  )
}
