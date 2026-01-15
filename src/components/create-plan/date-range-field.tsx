import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, isBefore, startOfMonth } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { DefaultDayButton, CalendarDropdown } from '@/components/calendar'
import type { DateRangeField as DateRangeFieldType } from './types'

const MAX_MONTHS_AHEAD = 24

interface DateRangeFieldProps {
  field: DateRangeFieldType
}

function normalizeRange(from: Date | undefined, to: Date | undefined): DateRange {
  if (from && to && isBefore(to, from)) {
    return { from: to, to: from }
  }
  return { from, to }
}

export function DateRangeField({ field }: DateRangeFieldProps) {
  const dateRange = field.state.value
  const [month, setMonth] = useState<Date>(dateRange?.from ?? new Date())

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      field.handleChange(normalizeRange(range.from, range.to))
    } else {
      field.handleChange(undefined)
    }
  }

  const minMonth = startOfMonth(new Date())
  const maxMonth = startOfMonth(addMonths(new Date(), MAX_MONTHS_AHEAD))

  return (
    <Card className="p-2 md:p-8">
      <div className="flex items-center justify-between mb-4 p-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-2xl">Possible Dates</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => field.handleChange(undefined)}
          className={dateRange?.from ? '' : 'invisible'}
        >
          Clear
        </Button>
      </div>

      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={handleSelect}
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown"
        startMonth={minMonth}
        endMonth={maxMonth}
        disabled={{ before: new Date() }}
        showOutsideDays
        fixedWeeks
        weekStartsOn={0}
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
          Chevron: ({ orientation }) =>
            orientation === 'left'
              ? <Button variant="ghost" size="icon-sm" asChild><ChevronLeft className="size-5 p-1" /></Button>
              : <Button variant="ghost" size="icon-sm" asChild><ChevronRight className="size-5 p-1" /></Button>,
        }}
      />
    </Card>
  )
}
