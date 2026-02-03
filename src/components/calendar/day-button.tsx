import { format, isSameDay } from 'date-fns'
import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { dayButtonVariants } from './day-button-variants'
import { useCalendarContext } from './calendar-context'
import { useDayButtonFocus } from './use-day-button-focus'

const DAY_BUTTON_MODES = {
  range: 'range',
  multiselect: 'multiselect',
  display: 'display',
} as const

type DayButtonMode = (typeof DAY_BUTTON_MODES)[keyof typeof DAY_BUTTON_MODES]

type DayButtonProps = React.ComponentProps<typeof DayButtonType> & {
  mode?: DayButtonMode
}

const DAY_BUTTON_STATES = {
  disabled: 'disabled',
  selected: 'selected',
  outside: 'outside',
  default: 'default',
} as const

type DayButtonState = (typeof DAY_BUTTON_STATES)[keyof typeof DAY_BUTTON_STATES]

interface SelectionState {
  isDisabled: boolean
  isSelected: boolean
  isOutside: boolean
  isEmphasis: boolean
}

function useRangeSelectionState(modifiers: DayButtonProps['modifiers']): SelectionState {
  const isEndpoint = modifiers.range_start || modifiers.range_end
  const isInRange = modifiers.range_middle
  const isSelected = !!(isEndpoint || isInRange || modifiers.selected)

  return {
    isDisabled: !!modifiers.disabled,
    isSelected,
    isOutside: !!modifiers.outside,
    isEmphasis: !!isEndpoint,
  }
}

function useMultiselectSelectionState(modifiers: DayButtonProps['modifiers'], day: DayButtonProps['day']): SelectionState {
  const { selectedDates, rangeStart } = useCalendarContext()

  const dateStr = format(day.date, 'yyyy-MM-dd')
  const isSelectedInContext = selectedDates?.has(dateStr) ?? false
  const isRangeStart = rangeStart ? isSameDay(day.date, rangeStart) : false
  const isHighlighted = isSelectedInContext || isRangeStart

  return {
    isDisabled: !!modifiers.disabled,
    isSelected: isHighlighted,
    isOutside: !!modifiers.outside && !isSelectedInContext,
    isEmphasis: isHighlighted,
  }
}

function useDisplaySelectionState(modifiers: DayButtonProps['modifiers']): SelectionState {
  return {
    isDisabled: !!modifiers.disabled,
    isSelected: false,
    isOutside: true,
    isEmphasis: false,
  }
}

function useSelectionState(mode: DayButtonMode, modifiers: DayButtonProps['modifiers'], day: DayButtonProps['day']): SelectionState {
  const rangeState = useRangeSelectionState(modifiers)
  const multiselectState = useMultiselectSelectionState(modifiers, day)
  const displayState = useDisplaySelectionState(modifiers)

  switch (mode) {
    case DAY_BUTTON_MODES.range:
      return rangeState
    case DAY_BUTTON_MODES.multiselect:
      return multiselectState
    case DAY_BUTTON_MODES.display:
      return displayState
  }
}

function resolveButtonState(selectionState: SelectionState): DayButtonState {
  if (selectionState.isDisabled) return DAY_BUTTON_STATES.disabled
  if (selectionState.isSelected) return DAY_BUTTON_STATES.selected
  if (selectionState.isOutside) return DAY_BUTTON_STATES.outside
  return DAY_BUTTON_STATES.default
}

function useClickHandler(mode: DayButtonMode, props: DayButtonProps) {
  const { onDateClick } = useCalendarContext()

  if (mode !== DAY_BUTTON_MODES.multiselect) {
    return props.onClick
  }

  return (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    onDateClick?.(props.day.date)
  }
}

export function DayButton({
  mode = DAY_BUTTON_MODES.range,
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = useDayButtonFocus(modifiers.focused)

  const selectionState = useSelectionState(mode, modifiers, day)
  const buttonState = resolveButtonState(selectionState)
  const handleClick = useClickHandler(mode, { day, modifiers, ...props })

  const dayNumber = day.date.getDate()

  return (
    <button
      ref={ref}
      type="button"
      disabled={selectionState.isDisabled}
      className={cn(
        dayButtonVariants({ state: buttonState, emphasis: selectionState.isEmphasis }),
        className
      )}
      {...props}
      onClick={handleClick}
    >
      {dayNumber}
    </button>
  )
}
