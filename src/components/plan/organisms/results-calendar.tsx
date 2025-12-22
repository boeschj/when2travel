import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO
} from 'date-fns'
import { CalendarHeader } from '../molecules/calendar-header'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { PlanResponse } from '@/lib/types'

interface ResultsCalendarProps {
  startRange: string
  endRange: string
  responses: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
  selectedRespondentId?: string | null
  selectedRespondentColor?: string | null
  onDateClick?: (date: Date) => void
  showNavigation?: boolean
  className?: string
  numberOfMonths?: 1 | 2
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

// Discrete heatmap color stops for maximum visual distinction
// Each stop represents a percentage threshold and its color
const HEATMAP_STOPS = [
  { threshold: 1.0,  color: '#46ec13', textColor: '#0a1208', glow: true },  // 100% - Bright lime green
  { threshold: 0.8,  color: '#a3e635', textColor: '#0a1208', glow: false }, // 80%+ - Lime/yellow
  { threshold: 0.6,  color: '#facc15', textColor: '#0a1208', glow: false }, // 60%+ - Yellow
  { threshold: 0.4,  color: '#f97316', textColor: '#0a1208', glow: false }, // 40%+ - Orange
  { threshold: 0.2,  color: '#ea580c', textColor: '#ffffff', glow: false }, // 20%+ - Dark orange
  { threshold: 0.0,  color: '#ef4444', textColor: '#ffffff', glow: false }, // 0%+ - Red
] as const

/**
 * Gets the heatmap color based on availability percentage.
 * Uses discrete color stops for clear visual distinction.
 */
function getHeatmapColor(availableCount: number, totalCount: number): {
  backgroundColor: string
  color: string
  glow: string | null
} {
  if (totalCount === 0) {
    return { backgroundColor: 'var(--color-border)', color: 'var(--color-foreground)', glow: null }
  }

  const percentage = availableCount / totalCount

  // Find the appropriate color stop
  const stop = HEATMAP_STOPS.find(s => percentage >= s.threshold) ?? HEATMAP_STOPS[HEATMAP_STOPS.length - 1]

  return {
    backgroundColor: stop.color,
    color: stop.textColor,
    glow: stop.glow ? 'rgba(70, 236, 19, 0.4)' : null
  }
}

function getMonthDays(month: Date): (Date | null)[] {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const dayOfWeek = getDay(monthStart)
  const emptyDaysBeforeMonthStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const leadingEmptyDays = Array(emptyDaysBeforeMonthStart).fill(null)

  const totalCells = leadingEmptyDays.length + daysInMonth.length
  const trailingEmptyDays = Array(42 - totalCells).fill(null)

  return [...leadingEmptyDays, ...daysInMonth, ...trailingEmptyDays]
}

export function ResultsCalendar({
  startRange,
  endRange,
  responses,
  selectedRespondentId,
  selectedRespondentColor,
  onDateClick,
  showNavigation = true,
  className,
  numberOfMonths = 2,
}: ResultsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(startRange))
  )

  const dateRange = useMemo(() => ({
    start: parseISO(startRange),
    end: parseISO(endRange)
  }), [startRange, endRange])

  const dateAvailabilityMap = useMemo(() => {
    const map = new Map<string, number>()

    const allDates = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    for (const date of allDates) {
      map.set(format(date, 'yyyy-MM-dd'), 0)
    }

    responses.forEach(response => {
      response.availableDates.forEach(dateStr => {
        const current = map.get(dateStr)
        if (current !== undefined) {
          map.set(dateStr, current + 1)
        }
      })
    })

    return map
  }, [responses, dateRange])

  const selectedRespondentDates = useMemo(() => {
    if (!selectedRespondentId) return null
    const respondent = responses.find(r => r.id === selectedRespondentId)
    return respondent ? new Set(respondent.availableDates) : null
  }, [selectedRespondentId, responses])

  const months = useMemo(() => {
    const result = [currentMonth]
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1))
    }
    return result
  }, [currentMonth, numberOfMonths])

  const getDateInfo = useCallback((date: Date) => {
    const isOutsideRange = !isWithinInterval(date, dateRange)
    if (isOutsideRange) {
      return { availableCount: 0, totalCount: responses.length, isDisabled: true, heatmapColor: null }
    }

    const dateStr = format(date, 'yyyy-MM-dd')
    const availableCount = dateAvailabilityMap.get(dateStr) ?? 0
    const totalCount = responses.length
    const heatmapColor = getHeatmapColor(availableCount, totalCount)

    return { availableCount, totalCount, isDisabled: false, heatmapColor }
  }, [dateRange, dateAvailabilityMap, responses.length])

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date)
    }
  }

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  const renderDateCell = (date: Date | null, month: Date, index: number) => {
    if (!date) {
      return <div key={`empty-${format(month, 'yyyy-MM')}-${index}`} className="min-h-11" />
    }

    const { isDisabled, heatmapColor, availableCount, totalCount } = getDateInfo(date)
    const isOutOfMonth = !isSameMonth(date, month)
    const dateStr = format(date, 'yyyy-MM-dd')

    const isRespondentAvailable = selectedRespondentDates?.has(dateStr) ?? false
    const hasRespondentFilter = selectedRespondentDates !== null

    // Determine the style to apply
    let cellStyle: React.CSSProperties | undefined
    let cellClassName = 'size-9 rounded-full flex items-center justify-center transition-all text-sm font-bold'

    if (hasRespondentFilter) {
      if (isRespondentAvailable && selectedRespondentColor) {
        cellStyle = {
          backgroundColor: selectedRespondentColor,
          color: '#1a1a1a',
          boxShadow: `0 0 10px ${selectedRespondentColor}66`
        }
      } else if (isRespondentAvailable) {
        cellClassName = cn(cellClassName, 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(70,236,19,0.4)]')
      } else {
        cellClassName = cn(cellClassName, 'bg-border text-foreground opacity-50')
      }
    } else if (heatmapColor) {
      cellStyle = {
        backgroundColor: heatmapColor.backgroundColor,
        color: heatmapColor.color,
        boxShadow: heatmapColor.glow ? `0 0 10px ${heatmapColor.glow}` : undefined
      }
    }

    const isClickable = !isDisabled && !isOutOfMonth
    const tooltipText = `${availableCount}/${totalCount} people available`

    const button = (
      <button
        key={dateStr}
        type="button"
        disabled={!isClickable}
        onClick={() => handleDateClick(date)}
        className={cn(
          'group relative min-h-11 flex items-center justify-center',
          isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
        )}
        aria-label={`${format(date, 'MMMM d')} - ${tooltipText}`}
      >
        {!isClickable ? (
          <span className="text-muted-foreground/50">{date.getDate()}</span>
        ) : (
          <div className={cellClassName} style={cellStyle}>
            {date.getDate()}
          </div>
        )}
      </button>
    )

    if (!isClickable) {
      return button
    }

    return (
      <Tooltip key={dateStr}>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const renderMonth = (month: Date, monthIndex: number) => {
    const monthDays = getMonthDays(month)
    const isFirstMonth = monthIndex === 0
    const isLastMonth = monthIndex === months.length - 1

    return (
      <div key={format(month, 'yyyy-MM')} className="flex flex-col gap-4">
        <div className="flex items-center w-[308px]">
          <CalendarHeader
            date={month}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            showNavigation={showNavigation}
            showPrevious={isFirstMonth}
            showNext={isLastMonth}
          />
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center min-h-11 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {monthDays.map((date, index) => renderDateCell(date, month, index))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap justify-center gap-4 sm:gap-8', className)}>
      {months.map((month, index) => renderMonth(month, index))}
    </div>
  )
}
