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
  parseISO,
  isSameDay
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DateCell } from '../atoms/date-cell'
import type { DateCellState } from '../atoms/date-cell'
import type { PlanResponse } from '@/lib/types'
import { AVAILABILITY_THRESHOLDS } from '@/lib/constants'

interface AvailabilityCalendarProps {
  startRange: string
  endRange: string
  responses?: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
  selectedDates?: string[]
  onDateClick?: (date: Date) => void
  rangeStart?: Date | null
  mode?: 'view' | 'select'
  showNavigation?: boolean
  className?: string
  numberOfMonths?: 1 | 2
}

const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function calculateDateState(
  date: Date,
  dateRange: { start: Date; end: Date },
  mode: 'view' | 'select',
  selectedDates: string[],
  responses: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
): { state: DateCellState; count?: { available: number; total: number } } {
  const isOutsideAllowedRange = !isWithinInterval(date, dateRange)
  if (isOutsideAllowedRange) {
    return { state: 'disabled' }
  }

  const dateStr = format(date, 'yyyy-MM-dd')

  if (mode === 'select') {
    const isSelected = selectedDates.includes(dateStr)
    if (isSelected) {
      return { state: 'selected' }
    }
    return { state: 'available' }
  }

  const availableRespondentCount = responses.filter(r =>
    r.availableDates.includes(dateStr)
  ).length
  const totalRespondentCount = responses.length

  if (totalRespondentCount === 0) {
    return { state: 'available' }
  }

  const availabilityRatio = availableRespondentCount / totalRespondentCount

  let state: DateCellState = 'unavailable'
  if (availabilityRatio === 1) {
    state = 'available'
  } else if (availabilityRatio >= AVAILABILITY_THRESHOLDS.PARTIAL) {
    state = 'partial'
  }

  return {
    state,
    count: { available: availableRespondentCount, total: totalRespondentCount }
  }
}

function getMonthDays(month: Date) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const emptyDaysBeforeMonthStart = getDay(monthStart)
  const leadingEmptyDays = Array(emptyDaysBeforeMonthStart).fill(null)

  const totalCells = leadingEmptyDays.length + daysInMonth.length
  const trailingEmptyDays = Array(42 - totalCells).fill(null) // Always 6 rows to prevent layout shift

  return [...leadingEmptyDays, ...daysInMonth, ...trailingEmptyDays]
}

export function AvailabilityCalendar({
  startRange,
  endRange,
  responses = [],
  selectedDates = [],
  onDateClick,
  rangeStart = null,
  mode = 'view',
  showNavigation = true,
  className,
  numberOfMonths = 1
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(startRange))
  )

  const dateRange = useMemo(() => ({
    start: parseISO(startRange),
    end: parseISO(endRange)
  }), [startRange, endRange])

  const months = useMemo(() => {
    const result = [currentMonth]
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1))
    }
    return result
  }, [currentMonth, numberOfMonths])

  const getDateState = useCallback((date: Date) => {
    return calculateDateState(date, dateRange, mode, selectedDates, responses)
  }, [dateRange, mode, selectedDates, responses])

  const handleDateClick = (date: Date) => {
    if (mode === 'select' && onDateClick) {
      onDateClick(date)
    }
  }

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  return (
    <div className={cn('flex flex-wrap justify-center gap-8', className)}>
      {months.map((month, index) => {
        const isFirst = index === 0
        const isLast = index === months.length - 1
        const monthDays = getMonthDays(month)

        return (
          <div key={format(month, 'yyyy-MM')} className="flex flex-col gap-4">
            {/* Month header */}
            <div className="flex items-center w-[308px]">
              {showNavigation && isFirst && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={goToPreviousMonth}
                  className="rounded-full hover:bg-white/10 text-foreground transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-5" />
                </Button>
              )}

              <h2 className="text-foreground text-lg font-bold flex-1 text-center">
                {format(month, 'MMMM yyyy')}
              </h2>

              {showNavigation && isLast && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={goToNextMonth}
                  className="rounded-full hover:bg-white/10 text-foreground transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-5" />
                </Button>
              )}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center min-h-11 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}

              {monthDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${format(month, 'yyyy-MM')}-${idx}`} className="min-h-11" />
                }

                const { state } = getDateState(date)
                const isRangeStartDate = rangeStart !== null && isSameDay(date, rangeStart)

                return (
                  <DateCell
                    key={format(date, 'yyyy-MM-dd')}
                    date={date.getDate()}
                    state={state}
                    isRangeStart={isRangeStartDate}
                    onClick={() => handleDateClick(date)}
                    disabled={!isSameMonth(date, month)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
