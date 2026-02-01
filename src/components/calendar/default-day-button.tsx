import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { dayButtonVariants } from './day-button-variants'
import { useDayButtonFocus } from './use-day-button-focus'

type DayButtonProps = React.ComponentProps<typeof DayButtonType>

const DAY_BUTTON_STATES = {
  disabled: 'disabled',
  selected: 'selected',
  outside: 'outside',
  default: 'default',
} as const

type DayButtonState = (typeof DAY_BUTTON_STATES)[keyof typeof DAY_BUTTON_STATES]

function resolveDayButtonState(
  isDisabled: boolean | undefined,
  isSelected: boolean | undefined,
  isOutside: boolean | undefined,
): DayButtonState {
  if (isDisabled) return DAY_BUTTON_STATES.disabled
  if (isSelected) return DAY_BUTTON_STATES.selected
  if (isOutside) return DAY_BUTTON_STATES.outside
  return DAY_BUTTON_STATES.default
}

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
  const isDisabled = modifiers.disabled
  const isOutside = modifiers.outside
  const dayNumber = day.date.getDate()

  const state = resolveDayButtonState(isDisabled, isSelected, isOutside)

  const buttonClassName = cn(
    dayButtonVariants({ state, emphasis: !!isEndpoint }),
    className
  )

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={buttonClassName}
      {...props}
    >
      {dayNumber}
    </button>
  )
}
