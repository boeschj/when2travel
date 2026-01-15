import { format } from 'date-fns'
import type { DayButton as DayButtonType } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useCalendarContext } from './calendar-context'
import { useDayButtonFocus } from './use-day-button-focus'
import { DisabledDayButton } from './disabled-day-button'

type DayButtonProps = React.ComponentProps<typeof DayButtonType>

const HEATMAP_STOPS = [
  { threshold: 1.0, color: '#46ec13', textColor: '#0a1208', glow: true },
  { threshold: 0.8, color: '#a3e635', textColor: '#0a1208', glow: false },
  { threshold: 0.6, color: '#facc15', textColor: '#0a1208', glow: false },
  { threshold: 0.4, color: '#f97316', textColor: '#0a1208', glow: false },
  { threshold: 0.2, color: '#ea580c', textColor: '#ffffff', glow: false },
  { threshold: 0.0, color: '#ef4444', textColor: '#ffffff', glow: false },
] as const

function getHeatmapStyle(availableCount: number, totalCount: number): React.CSSProperties {
  if (totalCount === 0) {
    return { backgroundColor: 'var(--color-border)', color: 'var(--color-foreground)' }
  }

  const percentage = availableCount / totalCount
  const stop = HEATMAP_STOPS.find(s => percentage >= s.threshold) ?? HEATMAP_STOPS[HEATMAP_STOPS.length - 1]

  return {
    backgroundColor: stop.color,
    color: stop.textColor,
    boxShadow: stop.glow ? '0 0 10px rgba(70, 236, 19, 0.4)' : undefined,
  }
}

function getRespondentStyle(
  isAvailable: boolean,
  color: string | null | undefined
): React.CSSProperties {
  if (!isAvailable) {
    return { backgroundColor: 'var(--color-border)', color: 'var(--color-foreground)', opacity: 0.5 }
  }

  if (color) {
    return {
      backgroundColor: color,
      color: 'var(--color-foreground)',
      boxShadow: `0 0 10px ${color}66`,
    }
  }

  return {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-primary-foreground)',
    boxShadow: '0 0 10px rgba(70,236,19,0.4)',
  }
}

export function HeatmapDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = useDayButtonFocus(modifiers.focused)
  const { availabilityMap, selectedRespondentId, selectedRespondentColor, onDateClick } =
    useCalendarContext()

  const dateStr = format(day.date, 'yyyy-MM-dd')
  const data = availabilityMap?.get(dateStr)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    onDateClick?.(day.date)
  }

  if (modifiers.disabled || modifiers.outside || !data) {
    return <DisabledDayButton className={className} day={day} modifiers={modifiers} {...props} />
  }

  const hasRespondentFilter = !!selectedRespondentId
  const isRespondentAvailable = hasRespondentFilter && data.respondentIds.includes(selectedRespondentId)

  const style = hasRespondentFilter
    ? getRespondentStyle(isRespondentAvailable, selectedRespondentColor)
    : getHeatmapStyle(data.availableCount, data.totalCount)

  const tooltipText = `${data.availableCount}/${data.totalCount} people available`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          type="button"
          className={cn(
            'flex min-h-11 min-w-11 items-center justify-center',
            className
          )}
          aria-label={`${format(day.date, 'MMMM d')} - ${tooltipText}`}
          {...props}
          onClick={handleClick}
        >
          <span
            className="flex size-10 items-center justify-center rounded-full text-sm font-bold"
            style={style}
          >
            {day.date.getDate()}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  )
}
