import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useDayButtonFocus } from './use-day-button-focus'

type DayButtonProps = React.ComponentProps<typeof DayButtonType>

export function DefaultDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = useDayButtonFocus(modifiers.focused)

  const isEndpoint = modifiers.range_start || modifiers.range_end
  const isInRange = modifiers.range_middle
  const isSelected = isEndpoint || isInRange || modifiers.selected
  const isOutside = modifiers.outside
  const isDisabled = modifiers.disabled

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={cn(
        'size-10 md:size-12 flex items-center justify-center rounded-full text-sm font-medium transition-all',
        isDisabled && 'text-muted-foreground/50 cursor-not-allowed',
        isOutside && !isSelected && 'text-muted-foreground/50',
        !isDisabled && !isOutside && !isSelected && 'bg-primary/10 text-foreground hover:bg-primary/20',
        isSelected && 'bg-primary text-primary-foreground',
        isEndpoint && 'font-bold shadow-[0_0_15px_rgba(70,236,19,0.4)]',
        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </button>
  )
}
