import { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { format, parseISO, addMonths } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarProvider,
  CalendarNavHeader,
  AvailabilityDayButton,
  useMonthNavigation,
} from '@/components/calendar'

interface AvailabilityCalendarProps {
  startRange: string
  endRange: string
  selectedDates?: string[]
  onDateClick?: (date: Date) => void
  rangeStart?: Date | null
  mode?: 'view' | 'select'
  showNavigation?: boolean
  className?: string
  numberOfMonths?: 1 | 2
}

export function AvailabilityCalendar({
  startRange,
  endRange,
  selectedDates = [],
  onDateClick,
  rangeStart = null,
  mode = 'view',
  showNavigation = true,
  className,
  numberOfMonths = 1,
}: AvailabilityCalendarProps) {
  const { month: currentMonth, setMonth: setCurrentMonth, goToPrevious, goToNext } =
    useMonthNavigation(parseISO(startRange))

  const dateRange = useMemo(
    () => ({
      start: parseISO(startRange),
      end: parseISO(endRange),
    }),
    [startRange, endRange]
  )

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates])

  const months = useMemo(() => {
    const result = [currentMonth]
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1))
    }
    return result
  }, [currentMonth, numberOfMonths])

  const handleDateClick = useCallback(
    (date: Date) => {
      if (mode === 'select' && onDateClick) {
        onDateClick(date)
      }
    },
    [mode, onDateClick]
  )

  const contextValue = useMemo(
    () => ({
      selectedDates: selectedDatesSet,
      rangeStart,
      onDateClick: handleDateClick,
    }),
    [selectedDatesSet, rangeStart, handleDateClick]
  )

  return (
    <CalendarProvider value={contextValue}>
      <div className={cn('flex flex-wrap justify-center gap-4 sm:gap-8', className)}>
        {months.map((month, index) => {
          const isFirst = index === 0
          const isLast = index === months.length - 1

          return (
            <div key={format(month, 'yyyy-MM')} className="flex flex-col gap-4">
              <CalendarNavHeader
                month={month}
                onPrevious={goToPrevious}
                onNext={goToNext}
                showPrevious={showNavigation && isFirst}
                showNext={showNavigation && isLast}
              />

              <Calendar
                month={month}
                onMonthChange={setCurrentMonth}
                showOutsideDays
                fixedWeeks
                weekStartsOn={0}
                disabled={[{ before: dateRange.start }, { after: dateRange.end }]}
                className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
                classNames={{
                  nav: 'hidden',
                  month_caption: 'hidden',
                }}
                components={{
                  DayButton: AvailabilityDayButton,
                }}
              />
            </div>
          )
        })}
      </div>
    </CalendarProvider>
  )
}
