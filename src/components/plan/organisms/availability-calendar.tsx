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
import type { DateCellState, DateCellVariant } from '../atoms/date-cell'
import type { PlanResponse } from '@/lib/types'
import { AVAILABILITY_THRESHOLDS } from '@/lib/constants'

interface AvailabilityCalendarProps {
  startRange: string
  endRange: string
  responses?: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
  selectedDates?: string[]
  onDateClick?: (date: Date) => void
  onDateRangeSelect?: (start: Date, end: Date, action: 'select' | 'deselect') => void
  mode?: 'view' | 'select'
  showNavigation?: boolean
  className?: string
  cellVariant?: DateCellVariant
  numberOfMonths?: 1 | 2
}

const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function calculateDateState(
  date: Date,
  dateRange: { start: Date; end: Date },
  mode: 'view' | 'select',
  selectedDates: string[],
  dragStart: Date | null,
  dragEnd: Date | null,
  dragAction: 'select' | 'deselect',
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

    // During drag, show preview based on drag action
    if (isInDragRange) {
      return { state: dragAction === 'select' ? 'selected' : 'available' }
    }

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
  const trailingEmptyDays = Array(42 - totalCells).fill(null) // Always 6 rows (42 cells)

  return [...leadingEmptyDays, ...daysInMonth, ...trailingEmptyDays]
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
  className,
  cellVariant = 'square',
  numberOfMonths = 1
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(startRange))
  )
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const [dragEnd, setDragEnd] = useState<Date | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<'select' | 'deselect'>('select')

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
    return calculateDateState(date, dateRange, mode, selectedDates, dragStart, dragEnd, dragAction, responses)
  }, [dateRange, mode, selectedDates, dragStart, dragEnd, dragAction, responses])

  const handleDateClick = (date: Date) => {
    if (mode === 'select' && onDateClick) {
      onDateClick(date)
    }
  }

  const handleMouseDown = (date: Date) => {
    if (mode === 'select' && onDateRangeSelect) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const isCurrentlySelected = selectedDates.includes(dateStr)
      // Determine action based on whether the start date is selected
      setDragAction(isCurrentlySelected ? 'deselect' : 'select')
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
      // Only call range select if we actually dragged (more than one day)
      const isSingleClick = isSameDay(dragStart, dragEnd)
      if (!isSingleClick) {
        const start = dragStart < dragEnd ? dragStart : dragEnd
        const end = dragStart < dragEnd ? dragEnd : dragStart
        onDateRangeSelect(start, end, dragAction)
      }
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  const renderMonth = (month: Date, monthIndex: number) => {
    const monthDays = getMonthDays(month)
    const isFirstMonth = monthIndex === 0
    const isLastMonth = monthIndex === months.length - 1

    return (
      <div key={format(month, 'yyyy-MM')} className="flex flex-col gap-4 min-w-[280px] flex-1">
        <CalendarHeader
          date={month}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          showNavigation={showNavigation}
          showPrevious={isFirstMonth}
          showNext={isLastMonth}
        />

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {monthDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${format(month, 'yyyy-MM')}-${index}`} className="h-10" />
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
                disabled={!isSameMonth(date, month)}
                variant={cellVariant}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-wrap justify-center gap-8', className)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {months.map((month, index) => renderMonth(month, index))}
    </div>
  )
}
