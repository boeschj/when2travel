import type { DateRange, ChevronProps } from 'react-day-picker'
import type { DateRangeField as DateRangeFieldType } from './types'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, isBefore, startOfMonth } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { DefaultDayButton, CalendarDropdown } from '@/components/calendar'

const MAX_MONTHS_AHEAD = 24
const SUNDAY = 0

interface DateRangeFieldProps {
  field: DateRangeFieldType
}

export function DateRangeField({ field }: DateRangeFieldProps) {
  const today = new Date()
  const [displayedMonth, setDisplayedMonth] = useState(field.state.value?.from ?? today)

  const selectedDateRange = field.state.value
  const isDateRangeSelected = Boolean(selectedDateRange?.from)
  const isClearButtonHidden = !isDateRangeSelected
  const earliestSelectableMonth = startOfMonth(today)
  const monthAtMaxRange = addMonths(today, MAX_MONTHS_AHEAD)
  const latestSelectableMonth = startOfMonth(monthAtMaxRange)

  const clearSelection = () => field.handleChange(undefined)

  const updateSelectedDateRange = (selectedRange: DateRange | undefined) => {
    if (selectedRange) {
      const normalizedDateRange = normalizeToChronologicalDates(selectedRange.from, selectedRange.to)
      field.handleChange(normalizedDateRange)
    } else {
      clearSelection()
    }
  }

  return (
    <Card className="p-2 md:p-8">
      <DateRangeFieldHeader
        onClear={clearSelection}
        isClearButtonHidden={isClearButtonHidden}
      />

      <Calendar
        mode="range"
        selected={selectedDateRange}
        onSelect={updateSelectedDateRange}
        month={displayedMonth}
        onMonthChange={setDisplayedMonth}
        captionLayout="dropdown"
        startMonth={earliestSelectableMonth}
        endMonth={latestSelectableMonth}
        disabled={{ before: today }}
        showOutsideDays
        fixedWeeks
        weekStartsOn={SUNDAY}
        className="w-full sm:w-104 mx-auto bg-transparent p-0"
        classNames={{
          month_caption: 'flex items-center justify-center w-full h-10',
          dropdowns: 'flex items-center gap-1',
          weekdays: 'grid grid-cols-7 gap-x-1 mt-6',
          weekday: 'text-muted-foreground font-bold text-xs uppercase tracking-wider text-center',
          week: 'grid grid-cols-7 gap-x-1 mt-2',
          day: 'aspect-square flex items-center justify-center',
          nav: 'absolute inset-x-0 top-0 flex items-center justify-between h-10',
          button_previous: 'p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed',
          button_next: 'p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed',
        }}
        components={{
          DayButton: DefaultDayButton,
          Dropdown: CalendarDropdown,
          Chevron: CalendarChevron,
        }}
      />
    </Card>
  )
}

interface DateRangeFieldHeaderProps {
  onClear: () => void
  isClearButtonHidden: boolean
}

function DateRangeFieldHeader({ onClear, isClearButtonHidden }: DateRangeFieldHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 p-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <span className="font-bold text-foreground text-2xl">Possible Dates</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        className={cn(isClearButtonHidden && 'invisible')}
      >
        Clear
      </Button>
    </div>
  )
}

function CalendarChevron({ orientation }: ChevronProps) {
  const isLeftChevron = orientation === 'left'
  const ChevronIcon = isLeftChevron ? ChevronLeft : ChevronRight

  return (
    <Button variant="ghost" size="icon-sm" asChild>
      <ChevronIcon className="size-5 p-1" />
    </Button>
  )
}

function normalizeToChronologicalDates(firstSelectedDate: Date | undefined, secondSelectedDate: Date | undefined): DateRange {
  const areBothDatesSelected = firstSelectedDate && secondSelectedDate
  const areDatesInReverseOrder = areBothDatesSelected && isBefore(secondSelectedDate, firstSelectedDate)

  if (areDatesInReverseOrder) {
    return { from: secondSelectedDate, to: firstSelectedDate }
  }

  return { from: firstSelectedDate, to: secondSelectedDate }
}
