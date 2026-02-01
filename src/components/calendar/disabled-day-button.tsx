import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useDayButtonFocus } from './use-day-button-focus'

type DayButtonProps = React.ComponentProps<typeof DayButtonType>

export function DisabledDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = useDayButtonFocus(modifiers.focused)

  const dayNumber = day.date.getDate()

  return (
    <button
      ref={ref}
      type="button"
      disabled={modifiers.disabled}
      className={cn(
        'flex min-h-11 min-w-11 items-center justify-center text-sm text-muted-foreground/50',
        modifiers.disabled && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {dayNumber}
    </button>
  )
}
