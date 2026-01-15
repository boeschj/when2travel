import { useMemo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { parseISO, startOfMonth, addMonths, isSameMonth } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarProvider,
  AvailabilityDayButton,
  useMonthNavigation,
} from '@/components/calendar'

interface AvailabilityCalendarProps {
  startRange: string
  endRange: string
  selectedDates?: string[]
  onDateClick?: (date: Date) => void
  rangeStart?: Date | null
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
  showNavigation = true,
  className,
  numberOfMonths = 1,
}: AvailabilityCalendarProps) {
  const { month: currentMonth, setMonth: setCurrentMonth } =
    useMonthNavigation(parseISO(startRange))

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const dateRange = useMemo(
    () => ({
      start: parseISO(startRange),
      end: parseISO(endRange),
    }),
    [startRange, endRange]
  )

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates])

  const singleMonthRange = isSameMonth(dateRange.start, dateRange.end)
  const effectiveMonths = (isMobile && singleMonthRange) ? 1 : numberOfMonths

  const contextValue = useMemo(
    () => ({
      selectedDates: selectedDatesSet,
      rangeStart,
      onDateClick,
    }),
    [selectedDatesSet, rangeStart, onDateClick]
  )

  return (
    <CalendarProvider value={contextValue}>
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={effectiveMonths}
          startMonth={startOfMonth(dateRange.start)}
          endMonth={addMonths(startOfMonth(dateRange.end), effectiveMonths - 1)}
          showOutsideDays
          fixedWeeks
          weekStartsOn={0}
          disabled={[{ before: dateRange.start }, { after: dateRange.end }]}
          className={cn('bg-transparent p-0', className)}
          classNames={{
            months: 'flex flex-wrap justify-center gap-8 sm:gap-16',
            month: 'flex flex-col',
            month_caption: 'flex items-center justify-center h-10 mb-4',
            caption_label: 'text-foreground text-lg font-bold',
            nav: showNavigation ? 'absolute inset-x-0 top-0 flex items-center justify-between h-10' : 'hidden',
            button_previous: 'p-2 rounded-full hover:bg-white/10 text-foreground transition-colors',
            button_next: 'p-2 rounded-full hover:bg-white/10 text-foreground transition-colors',
            weekdays: 'grid grid-cols-7 gap-x-1',
            weekday: 'text-muted-foreground font-bold text-xs uppercase tracking-wider text-center',
            week: 'grid grid-cols-7 gap-x-1 mt-2',
            day: 'aspect-square flex items-center justify-center',
          }}
          components={{
            DayButton: AvailabilityDayButton,
          }}
        />
    </CalendarProvider>
  )
}
