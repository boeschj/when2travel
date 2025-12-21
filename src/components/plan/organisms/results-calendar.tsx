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
import type { PlanResponse } from '@/lib/types'

interface ResultsCalendarProps {
  startRange: string
  endRange: string
  responses: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
  selectedRespondentId?: string | null
  onDateClick?: (date: Date) => void
  showNavigation?: boolean
  className?: string
  numberOfMonths?: 1 | 2
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

type HeatmapState = 'full' | 'high' | 'partial' | 'none' | 'disabled'

function getHeatmapState(availableCount: number, totalCount: number): HeatmapState {
  if (totalCount === 0) return 'none'
  const percentage = (availableCount / totalCount) * 100
  if (percentage === 100) return 'full'
  if (percentage >= 50) return 'high'
  if (percentage > 0) return 'partial'
  return 'none'
}

function getHeatmapStyles(state: HeatmapState): string {
  switch (state) {
    case 'full':
      return 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(70,236,19,0.4)]'
    case 'high':
      return 'bg-status-yellow text-black font-bold'
    case 'partial':
      return 'bg-status-red text-white font-bold'
    case 'none':
      return 'bg-border text-foreground'
    case 'disabled':
      return ''
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
      return { availableCount: 0, totalCount: responses.length, state: 'disabled' as HeatmapState }
    }

    const dateStr = format(date, 'yyyy-MM-dd')
    const availableCount = dateAvailabilityMap.get(dateStr) ?? 0
    const totalCount = responses.length
    const state = getHeatmapState(availableCount, totalCount)

    return { availableCount, totalCount, state }
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
      return <div key={`empty-${format(month, 'yyyy-MM')}-${index}`} className="w-full aspect-square" />
    }

    const { state } = getDateInfo(date)
    const isDisabled = state === 'disabled' || !isSameMonth(date, month)
    const dateStr = format(date, 'yyyy-MM-dd')

    const isRespondentAvailable = selectedRespondentDates?.has(dateStr) ?? false
    const hasRespondentFilter = selectedRespondentDates !== null

    return (
      <button
        key={dateStr}
        type="button"
        disabled={isDisabled}
        onClick={() => handleDateClick(date)}
        className={cn(
          'group relative h-10 w-full flex items-center justify-center',
          isDisabled && 'cursor-not-allowed'
        )}
        aria-label={`${date.getDate()} - ${state}`}
      >
        {isDisabled ? (
          <span className="text-muted-foreground/50">{date.getDate()}</span>
        ) : (
          <div
            className={cn(
              'size-9 rounded-full flex items-center justify-center transition-all text-sm',
              hasRespondentFilter
                ? isRespondentAvailable
                  ? 'bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(70,236,19,0.4)]'
                  : 'bg-border text-foreground opacity-50'
                : getHeatmapStyles(state)
            )}
          >
            {date.getDate()}
          </div>
        )}
      </button>
    )
  }

  const renderMonth = (month: Date, monthIndex: number) => {
    const monthDays = getMonthDays(month)
    const isFirstMonth = monthIndex === 0
    const isLastMonth = monthIndex === months.length - 1

    return (
      <div key={format(month, 'yyyy-MM')} className={cn('flex flex-col gap-4', numberOfMonths === 1 ? 'w-full' : 'min-w-[280px] flex-1')}>
        <div className="flex items-center justify-between mb-4">
          <CalendarHeader
            date={month}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            showNavigation={showNavigation}
            showPrevious={isFirstMonth}
            showNext={isLastMonth}
          />
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 w-full max-w-[700px] mx-auto">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-text-secondary text-xs md:text-sm font-semibold uppercase tracking-widest text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 w-full max-w-[700px] mx-auto">
          {monthDays.map((date, index) => renderDateCell(date, month, index))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full gap-8',
        numberOfMonths === 1 ? 'flex flex-col' : 'flex flex-wrap justify-center',
        className
      )}
    >
      {months.map((month, index) => renderMonth(month, index))}
    </div>
  )
}
