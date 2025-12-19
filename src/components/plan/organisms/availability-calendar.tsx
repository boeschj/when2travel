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
import { DateCell } from '../atoms/date-cell'
import { CalendarHeader } from '../molecules/calendar-header'
import type { DateCellState } from '../atoms/date-cell'
import type { PlanResponse } from '@/lib/types'
import { AVAILABILITY_THRESHOLDS } from '@/lib/constants'

interface AvailabilityCalendarProps {
  startRange: string
  endRange: string
  responses?: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
  selectedDates?: string[]
  onDateClick?: (date: Date) => void
  onDateRangeSelect?: (start: Date, end: Date) => void
  mode?: 'view' | 'select'
  showNavigation?: boolean
  className?: string
}

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function calculateDateState(
  date: Date,
  dateRange: { start: Date; end: Date },
  mode: 'view' | 'select',
  selectedDates: string[],
  dragStart: Date | null,
  dragEnd: Date | null,
  responses: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
): { state: DateCellState; count?: { available: number; total: number } } {
  const isOutsideAllowedRange = !isWithinInterval(date, dateRange)
  if (isOutsideAllowedRange) {
    return { state: 'disabled' }
  }

  const dateStr = format(date, 'yyyy-MM-dd')

  if (mode === 'select') {
    const isSelected = selectedDates.includes(dateStr)
    const isInDragRange = dragStart && dragEnd &&
      isWithinInterval(date, {
        start: dragStart < dragEnd ? dragStart : dragEnd,
        end: dragStart < dragEnd ? dragEnd : dragStart
      })

    if (isSelected || isInDragRange) {
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

export function AvailabilityCalendar({
  startRange,
  endRange,
  responses = [],
  selectedDates = [],
  onDateClick,
  onDateRangeSelect,
  mode = 'view',
  showNavigation = true,
  className
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(startRange))
  )
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const [dragEnd, setDragEnd] = useState<Date | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dateRange = useMemo(() => ({
    start: parseISO(startRange),
    end: parseISO(endRange)
  }), [startRange, endRange])

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const emptyDaysBeforeMonthStart = getDay(monthStart)
    const leadingEmptyDays = Array(emptyDaysBeforeMonthStart).fill(null)

    return [...leadingEmptyDays, ...daysInMonth]
  }, [currentMonth])

  const getDateState = useCallback((date: Date) => {
    return calculateDateState(date, dateRange, mode, selectedDates, dragStart, dragEnd, responses)
  }, [dateRange, mode, selectedDates, dragStart, dragEnd, responses])

  const handleDateClick = (date: Date) => {
    if (mode === 'select' && onDateClick) {
      onDateClick(date)
    }
  }

  const handleMouseDown = (date: Date) => {
    if (mode === 'select' && onDateRangeSelect) {
      setDragStart(date)
      setDragEnd(date)
      setIsDragging(true)
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(date)
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && onDateRangeSelect) {
      const start = dragStart < dragEnd ? dragStart : dragEnd
      const end = dragStart < dragEnd ? dragEnd : dragStart
      onDateRangeSelect(start, end)
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CalendarHeader
        date={currentMonth}
        onPreviousMonth={showNavigation ? goToPreviousMonth : undefined}
        onNextMonth={showNavigation ? goToNextMonth : undefined}
        showNavigation={showNavigation}
      />

      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-text-secondary text-xs font-bold uppercase tracking-wider text-center h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}

        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const { state, count } = getDateState(date)
          const isToday = isSameDay(date, new Date())

          return (
            <DateCell
              key={format(date, 'yyyy-MM-dd')}
              date={date.getDate()}
              state={state}
              availableCount={count?.available}
              totalCount={count?.total}
              isToday={isToday}
              onClick={() => handleDateClick(date)}
              onMouseDown={() => handleMouseDown(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              disabled={!isSameMonth(date, currentMonth)}
            />
          )
        })}
      </div>
    </div>
  )
}
