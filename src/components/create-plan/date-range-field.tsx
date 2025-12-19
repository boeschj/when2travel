import { useState, useCallback, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse, isValid, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addYears, subYears, isSameMonth, isWithinInterval, isBefore, isAfter, eachDayOfInterval } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DateRangeField as DateRangeFieldType } from './types'

type ViewMode = 'day' | 'week' | 'month'

interface DateRangeFieldProps {
  field: DateRangeFieldType
}

const WEEK_STARTS_ON = 0
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const WEEKS_TO_SHOW = 5
const DAYS_PER_WEEK = 7

interface RangeState {
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
}

function getIntervalRangeState(
  intervalStart: Date,
  intervalEnd: Date,
  dateRange: DateRange | undefined
): RangeState {
  if (!dateRange?.from) {
    return { isRangeStart: false, isRangeEnd: false, isInRange: false }
  }

  const rangeEnd = dateRange.to || dateRange.from
  const isRangeStart = isWithinInterval(dateRange.from, { start: intervalStart, end: intervalEnd })
  const isRangeEnd = dateRange.to ? isWithinInterval(dateRange.to, { start: intervalStart, end: intervalEnd }) : false
  const overlapsRange = !(isAfter(intervalStart, rangeEnd) || isBefore(intervalEnd, dateRange.from))

  return {
    isRangeStart,
    isRangeEnd,
    isInRange: overlapsRange && !isRangeStart && !isRangeEnd
  }
}

function generateWeeks(startDate: Date, count: number): Date[][] {
  const monthStart = startOfMonth(startDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON })

  const days: Date[] = []
  let day = calendarStart
  for (let i = 0; i < count * DAYS_PER_WEEK; i++) {
    days.push(day)
    day = new Date(day)
    day.setDate(day.getDate() + 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK))
  }

  return weeks
}

function WeekdayHeaders() {
  return (
    <div className="grid grid-cols-7 gap-x-1 text-center mb-1">
      {WEEKDAY_LABELS.map((day) => (
        <span key={day} className="text-xs font-bold text-foreground/40 uppercase py-1">
          {day}
        </span>
      ))}
    </div>
  )
}

export function DateRangeField({ field }: DateRangeFieldProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [startDateInput, setStartDateInput] = useState('')
  const [endDateInput, setEndDateInput] = useState('')

  const dateRange = field.state.value
  const displayStartDate = dateRange?.from ? format(dateRange.from, 'MM/dd/yyyy') : startDateInput
  const displayEndDate = dateRange?.to ? format(dateRange.to, 'MM/dd/yyyy') : endDateInput

  const handleDateInputChange = useCallback((value: string, isStart: boolean) => {
    const setInput = isStart ? setStartDateInput : setEndDateInput
    setInput(value)

    const parsed = parse(value, 'MM/dd/yyyy', new Date())
    if (isValid(parsed)) {
      field.handleChange({
        from: isStart ? parsed : dateRange?.from,
        to: isStart ? dateRange?.to : parsed
      })
    }
  }, [dateRange?.from, dateRange?.to, field])

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    const isPrev = direction === 'prev'
    const isYearNav = viewMode === 'month'
    const navFn = isYearNav
      ? (isPrev ? subYears : addYears)
      : (isPrev ? subMonths : addMonths)
    setCurrentDate(prev => navFn(prev, 1))
  }, [viewMode])

  const handleDayClick = useCallback((date: Date) => {
    if (!dateRange?.from || dateRange.to) {
      field.handleChange({ from: date, to: undefined })
    } else {
      if (isBefore(date, dateRange.from)) {
        field.handleChange({ from: date, to: dateRange.from })
      } else {
        field.handleChange({ from: dateRange.from, to: date })
      }
    }
  }, [dateRange, field])

  const handleWeekClick = useCallback((weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: WEEK_STARTS_ON })

    if (!dateRange?.from || dateRange.to) {
      field.handleChange({ from: weekStart, to: undefined })
    } else {
      const firstWeekEnd = endOfWeek(dateRange.from, { weekStartsOn: WEEK_STARTS_ON })
      if (isBefore(weekStart, dateRange.from)) {
        field.handleChange({ from: weekStart, to: firstWeekEnd })
      } else {
        field.handleChange({ from: dateRange.from, to: weekEnd })
      }
    }
  }, [dateRange, field])

  const handleMonthClick = useCallback((monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)

    if (!dateRange?.from || dateRange.to) {
      field.handleChange({ from: monthStart, to: undefined })
    } else {
      const firstMonthEnd = endOfMonth(dateRange.from)
      if (isBefore(monthStart, dateRange.from)) {
        field.handleChange({ from: monthStart, to: firstMonthEnd })
      } else {
        field.handleChange({ from: dateRange.from, to: monthEnd })
      }
    }
  }, [dateRange, field])

  const clearDates = useCallback(() => {
    field.handleChange(undefined)
    setStartDateInput('')
    setEndDateInput('')
  }, [field])

  const navigationLabel = viewMode === 'month'
    ? format(currentDate, 'yyyy')
    : format(currentDate, 'MMMM yyyy')

  return (
    <div className="bg-card border border-border/5 shadow-2xl shadow-black/20 rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Possible Dates</h3>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList variant="tertiary">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <TabsTrigger key={mode} value={mode} variant="tertiary" className="capitalize">
                {mode}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-4 mb-6 items-end">
        <DateInput
          label="Start Date"
          value={displayStartDate}
          onChange={(value) => handleDateInputChange(value, true)}
        />
        <DateInput
          label="End Date"
          value={displayEndDate}
          onChange={(value) => handleDateInputChange(value, false)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!dateRange?.from}
          onClick={clearDates}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap h-auto",
            dateRange?.from
              ? "text-foreground/60 hover:text-foreground hover:bg-transparent"
              : "text-foreground/20 cursor-not-allowed"
          )}
        >
          Clear Dates
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground"
          onClick={() => handleNavigation('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-foreground font-medium">{navigationLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground"
          onClick={() => handleNavigation('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-[300px] overflow-hidden">
        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            dateRange={dateRange}
            onDayClick={handleDayClick}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            dateRange={dateRange}
            onWeekClick={handleWeekClick}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            dateRange={dateRange}
            onMonthClick={handleMonthClick}
          />
        )}
      </div>
    </div>
  )
}

interface DateInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function DateInput({ label, value, onChange }: DateInputProps) {
  return (
    <div className="flex-1">
      <Label className="block text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2">
        {label}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="MM/DD/YYYY"
        readOnly
        variant="tertiary"
        icon={<CalendarIcon className="w-4 h-4 text-foreground/40" />}
        className="cursor-default"
      />
    </div>
  )
}

interface DayViewProps {
  currentDate: Date
  dateRange: DateRange | undefined
  onDayClick: (date: Date) => void
}

function DayView({ currentDate, dateRange, onDayClick }: DayViewProps) {
  const weeks = useMemo(() => generateWeeks(currentDate, WEEKS_TO_SHOW), [currentDate])

  const getDayState = useCallback((date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentDate)
    const isRangeStart = dateRange?.from && format(date, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')
    const isRangeEnd = dateRange?.to && format(date, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')
    const isInRange = dateRange?.from && dateRange?.to && isWithinInterval(date, { start: dateRange.from, end: dateRange.to })

    return { isCurrentMonth, isRangeStart, isRangeEnd, isInRange }
  }, [currentDate, dateRange])

  return (
    <div>
      <WeekdayHeaders />
      <div className="grid grid-cols-7 grid-rows-5 gap-2">
        {weeks.map((week, weekIndex) => (
          week.map((date, dayIndex) => {
            const { isCurrentMonth, isRangeStart, isRangeEnd, isInRange } = getDayState(date)

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                onClick={() => onDayClick(date)}
                className={cn(
                  "h-12 flex items-center justify-center rounded-full text-base font-medium transition-all",
                  !isCurrentMonth && "text-foreground/30",
                  isCurrentMonth && !isInRange && !isRangeStart && "text-foreground/60 hover:bg-foreground/10",
                  isInRange && !isRangeStart && !isRangeEnd && "bg-primary/20 text-foreground",
                  (isRangeStart || isRangeEnd) && "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(70,236,19,0.4)]"
                )}
              >
                {format(date, 'd')}
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
}

interface WeekViewProps {
  currentDate: Date
  dateRange: DateRange | undefined
  onWeekClick: (weekStart: Date) => void
}

function WeekView({ currentDate, dateRange, onWeekClick }: WeekViewProps) {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON })

    const result: Date[] = []
    let week = calendarStart
    for (let i = 0; i < WEEKS_TO_SHOW; i++) {
      result.push(week)
      week = new Date(week)
      week.setDate(week.getDate() + DAYS_PER_WEEK)
    }
    return result
  }, [currentDate])

  const getWeekState = useCallback((weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: WEEK_STARTS_ON })
    return getIntervalRangeState(weekStart, weekEnd, dateRange)
  }, [dateRange])

  const allDays = useMemo(() => {
    return weeks.flatMap(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: WEEK_STARTS_ON })
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    })
  }, [weeks])

  const getDayInWeekState = useCallback((date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON })
    const { isRangeStart, isRangeEnd, isInRange } = getWeekState(weekStart)
    const isWeekSelected = isRangeStart || isRangeEnd || isInRange
    return { isWeekSelected, isRangeStart, isRangeEnd, isInRange }
  }, [getWeekState])

  return (
    <div>
      <WeekdayHeaders />
      <div className="grid grid-cols-7 grid-rows-5 gap-2">
        {allDays.map((date, index) => {
          const weekStart = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON })
          const { isWeekSelected, isRangeStart, isRangeEnd, isInRange } = getDayInWeekState(date)
          const isCurrentMonth = isSameMonth(date, currentDate)
          const isEndpoint = isRangeStart || isRangeEnd

          return (
            <button
              key={index}
              type="button"
              onClick={() => onWeekClick(weekStart)}
              className={cn(
                "h-12 flex items-center justify-center rounded-full text-base font-medium transition-all",
                !isCurrentMonth && "text-foreground/30",
                isCurrentMonth && !isWeekSelected && "text-foreground/60 hover:bg-foreground/10",
                isWeekSelected && isInRange && "bg-primary/20 text-foreground",
                isWeekSelected && isEndpoint && "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(70,236,19,0.4)]"
              )}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  dateRange: DateRange | undefined
  onMonthClick: (monthDate: Date) => void
}

function MonthView({ currentDate, dateRange, onMonthClick }: MonthViewProps) {
  const months = useMemo(() => {
    const year = currentDate.getFullYear()
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
  }, [currentDate])

  const getMonthState = useCallback((monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    return getIntervalRangeState(monthStart, monthEnd, dateRange)
  }, [dateRange])

  return (
    <div className="grid grid-cols-3 gap-3">
      {months.map((monthDate, index) => {
        const { isRangeStart, isRangeEnd, isInRange } = getMonthState(monthDate)
        const isEndpoint = isRangeStart || isRangeEnd

        return (
          <button
            key={index}
            type="button"
            onClick={() => onMonthClick(monthDate)}
            className={cn(
              "py-4 px-3 rounded-2xl text-sm font-medium transition-all",
              !isEndpoint && !isInRange && "text-foreground/60 hover:bg-foreground/10",
              isInRange && !isEndpoint && "bg-primary/20 text-foreground",
              isEndpoint && "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(70,236,19,0.4)]"
            )}
          >
            {format(monthDate, 'MMM')}
          </button>
        )
      })}
    </div>
  )
}
