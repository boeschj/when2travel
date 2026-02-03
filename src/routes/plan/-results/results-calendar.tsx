import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { format, parseISO, addMonths, eachDayOfInterval } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CalendarProvider, type AvailabilityData } from '@/components/calendar/calendar-context'
import { CalendarNavHeader } from '@/components/calendar/calendar-nav-header'
import { HeatmapDayButton } from '@/components/calendar/heatmap-day-button'
import { useMonthNavigation } from '@/components/calendar/use-month-navigation'
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

interface MonthPanelProps {
  month: Date
  dateRange: { start: Date; end: Date }
  isFirst: boolean
  isLast: boolean
  showNavigation: boolean
  showDivider: boolean
  onPrevious: () => void
  onNext: () => void
  onMonthChange: (month: Date) => void
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
  const { month: currentMonth, setMonth: setCurrentMonth, goToPrevious, goToNext } =
    useMonthNavigation(parseISO(startRange))

  const dateRange = useMemo(
    () => ({
      start: parseISO(startRange),
      end: parseISO(endRange),
    }),
    [startRange, endRange]
  )

  const availabilityMap = useMemo(
    () => buildAvailabilityMap(dateRange, responses),
    [responses, dateRange]
  )

  const months = useMemo(() => {
    const result = [currentMonth]
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1))
    }
    return result
  }, [currentMonth, numberOfMonths])

  const heatmapContext = useMemo(
    () => ({
      availabilityMap,
      selectedRespondentId,
      selectedRespondentColor,
      onDateClick,
    }),
    [availabilityMap, selectedRespondentId, selectedRespondentColor, onDateClick]
  )

  const hasMultipleMonths = numberOfMonths > 1

  return (
    <CalendarProvider value={heatmapContext}>
      <div className={cn('flex flex-wrap justify-center gap-4 md:gap-0', className)}>
        {months.map((month, index) => {
          const isFirst = index === 0
          const isLast = index === months.length - 1

          return (
            <MonthPanel
              key={format(month, 'yyyy-MM')}
              month={month}
              dateRange={dateRange}
              isFirst={isFirst}
              isLast={isLast}
              showNavigation={showNavigation}
              showDivider={isFirst && hasMultipleMonths}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onMonthChange={setCurrentMonth}
            />
          )
        })}
      </div>
    </CalendarProvider>
  )
}

function MonthPanel({
  month,
  dateRange,
  isFirst,
  isLast,
  showNavigation,
  showDivider,
  onPrevious,
  onNext,
  onMonthChange,
}: MonthPanelProps) {
  return (
    <div className="flex">
      <div className={cn('flex flex-col gap-4', !isFirst && 'hidden md:flex')}>
        <CalendarNavHeader
          month={month}
          onPrevious={onPrevious}
          onNext={onNext}
          showPrevious={showNavigation && isFirst}
          showNext={showNavigation && isLast}
        />

        <Calendar
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          showOutsideDays
          fixedWeeks
          weekStartsOn={1}
          disabled={[{ before: dateRange.start }, { after: dateRange.end }]}
          className="bg-transparent p-0 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          classNames={{
            nav: 'hidden',
            month_caption: 'hidden',
          }}
          components={{
            DayButton: HeatmapDayButton,
          }}
        />
      </div>
      {showDivider && (
        <div className="hidden md:block w-px bg-border mx-6 self-stretch" />
      )}
    </div>
  )
}

function buildAvailabilityMap(
  dateRange: { start: Date; end: Date },
  responses: Pick<PlanResponse, 'id' | 'name' | 'availableDates'>[]
): Map<string, AvailabilityData> {
  const map = new Map<string, AvailabilityData>()

  const allDates = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  for (const date of allDates) {
    const dateStr = format(date, 'yyyy-MM-dd')
    map.set(dateStr, {
      date: dateStr,
      availableCount: 0,
      totalCount: responses.length,
      respondentIds: [],
    })
  }

  for (const response of responses) {
    for (const dateStr of response.availableDates) {
      const data = map.get(dateStr)
      if (data) {
        data.availableCount += 1
        data.respondentIds.push(response.id)
      }
    }
  }

  return map
}
