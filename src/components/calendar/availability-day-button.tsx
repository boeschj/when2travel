import { format, isSameDay } from 'date-fns'
import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useCalendarContext } from './calendar-context'
import { useDayButtonFocus } from './use-day-button-focus'
import { DisabledDayButton } from './disabled-day-button'

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    onDateClick?.(day.date)
  }

  if (modifiers.disabled || modifiers.outside) {
    return <DisabledDayButton className={className} day={day} modifiers={modifiers} {...props} />
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group flex min-h-11 min-w-11 items-center justify-center',
        className
      )}
      {...props}
      onClick={handleClick}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-full text-sm transition-all',
          !isSelected && !isRangeStart && 'bg-border text-foreground font-medium group-hover:ring-2 group-hover:ring-primary/50',
          isSelected && !isRangeStart && 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(70,236,19,0.4)]',
          isRangeStart && 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse'
        )}
      >
        {day.date.getDate()}
      </span>
    </button>
  )
}
