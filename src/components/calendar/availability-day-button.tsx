import { format, isSameDay } from 'date-fns'
import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useCalendarContext } from './calendar-context'
import { useDayButtonFocus } from './use-day-button-focus'

type DayButtonProps = React.ComponentProps<typeof DayButtonType>

export function AvailabilityDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = useDayButtonFocus(modifiers.focused)
  const { selectedDates, rangeStart, onDateClick } = useCalendarContext()

  const dateStr = format(day.date, 'yyyy-MM-dd')
  const isSelected = selectedDates?.has(dateStr) ?? false
  const isRangeStart = rangeStart ? isSameDay(day.date, rangeStart) : false
  const isDisabled = modifiers.disabled
  const isOutside = modifiers.outside
  const dayNumber = day.date.getDate()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    onDateClick?.(day.date)
  }

  const isHighlighted = isSelected || isRangeStart
  const isDefaultState = !isDisabled && !isOutside && !isHighlighted

  const buttonClassName = cn(
    'size-10 md:size-12 flex items-center justify-center rounded-full text-sm font-medium transition-all',
    isDisabled && 'text-muted-foreground/50 cursor-not-allowed',
    isOutside && !isSelected && 'text-muted-foreground/50',
    isDefaultState && 'bg-primary/10 text-foreground hover:bg-primary/20',
    isHighlighted && 'bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(70,236,19,0.4)]',
    className
  )

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={buttonClassName}
      {...props}
      onClick={handleClick}
    >
      {dayNumber}
    </button>
  )
}
