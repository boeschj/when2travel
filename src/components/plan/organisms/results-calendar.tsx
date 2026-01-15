import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { format, parseISO, addMonths, eachDayOfInterval } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarProvider,
  CalendarNavHeader,
  HeatmapDayButton,
  useMonthNavigation,
  type AvailabilityData,
} from '@/components/calendar'
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

  const availabilityMap = useMemo(() => {
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

    responses.forEach((response) => {
      response.availableDates.forEach((dateStr) => {
        const data = map.get(dateStr)
        if (data) {
          data.availableCount += 1
          data.respondentIds.push(response.id)
        }
      })
    })

    return map
  }, [responses, dateRange])

  const months = useMemo(() => {
    const result = [currentMonth]
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1))
    }
    return result
  }, [currentMonth, numberOfMonths])

  const contextValue = useMemo(
    () => ({
      availabilityMap,
      selectedRespondentId,
      selectedRespondentColor,
      onDateClick,
    }),
    [availabilityMap, selectedRespondentId, selectedRespondentColor, onDateClick]
  )

  return (
    <CalendarProvider value={contextValue}>
      <div className={cn('flex flex-wrap justify-center gap-4 md:gap-0', className)}>
        {months.map((month, index) => {
          const isFirst = index === 0
          const isLast = index === months.length - 1
          const showDivider = isFirst && numberOfMonths > 1

          return (
            <div key={format(month, 'yyyy-MM')} className="flex">
              <div className={cn('flex flex-col gap-4', !isFirst && 'hidden md:flex')}>
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
                  weekStartsOn={1}
                  disabled={[{ before: dateRange.start }, { after: dateRange.end }]}
                  className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
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
        })}
      </div>
    </CalendarProvider>
  )
}
