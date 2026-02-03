import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { parseISO, startOfMonth, addMonths, isSameMonth } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CalendarProvider } from '@/components/calendar/calendar-context'
import { AvailabilityDayButton } from '@/components/calendar/availability-day-button'
import { useMonthNavigation } from '@/components/calendar/use-month-navigation'
import { useMediaQuery } from '@/hooks/use-media-query'

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

const CALENDAR_CLASSNAMES = {
  months: 'flex flex-wrap justify-center gap-8 sm:gap-16',
  month: 'flex flex-col',
  month_caption: 'flex items-center justify-center h-10 mb-4',
  caption_label: 'text-foreground text-lg font-bold',
  button_previous:
    'p-2 rounded-full hover:bg-white/10 text-foreground transition-colors',
  button_next:
    'p-2 rounded-full hover:bg-white/10 text-foreground transition-colors',
  weekdays: 'grid grid-cols-7 gap-x-1',
  weekday:
    'text-muted-foreground font-bold text-xs uppercase tracking-wider text-center',
  week: 'grid grid-cols-7 gap-x-1 mt-2',
  day: 'aspect-square flex items-center justify-center',
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

  const isMobile = useMediaQuery('(max-width: 640px)')

  const dateRange = useMemo(
    () => ({
      start: parseISO(startRange),
      end: parseISO(endRange),
    }),
    [startRange, endRange]
  )

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates])

  const isEntireRangeWithinOneMonth = isSameMonth(dateRange.start, dateRange.end)
  const shouldCollapseToSingleMonth = isMobile && isEntireRangeWithinOneMonth
  const effectiveMonths = shouldCollapseToSingleMonth ? 1 : numberOfMonths

  const availabilityContext = useMemo(
    () => ({
      selectedDates: selectedDatesSet,
      rangeStart,
      onDateClick,
    }),
    [selectedDatesSet, rangeStart, onDateClick]
  )

  const calendarStartMonth = startOfMonth(dateRange.start)
  const calendarEndMonth = addMonths(
    startOfMonth(dateRange.end),
    effectiveMonths - 1
  )
  const datesOutsideRange = [
    { before: dateRange.start },
    { after: dateRange.end },
  ]
  const navClassName = cn(
    'absolute inset-x-0 top-0 flex items-center justify-between h-10',
    !showNavigation && 'hidden'
  )
  const calendarClassNames = { ...CALENDAR_CLASSNAMES, nav: navClassName }

  return (
    <CalendarProvider value={availabilityContext}>
      <Calendar
        mode="single"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        numberOfMonths={effectiveMonths}
        startMonth={calendarStartMonth}
        endMonth={calendarEndMonth}
        showOutsideDays
        fixedWeeks
        weekStartsOn={0}
        disabled={datesOutsideRange}
        className={cn('bg-transparent p-0', className)}
        classNames={calendarClassNames}
        components={{
          DayButton: AvailabilityDayButton,
        }}
      />
    </CalendarProvider>
  )
}
