import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { User, CheckCircle, Ban, Trash2, Info } from 'lucide-react'
import { format, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns'
import { AvailabilityCalendar } from './availability-calendar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { ResponseFormData, PlanWithResponses } from '@/lib/types'

interface DateRange {
  id: string
  start: string
  end: string
  days: number
  status: 'available' | 'unavailable'
}

interface ResponseFormProps {
  startRange: PlanWithResponses['startRange']
  endRange: PlanWithResponses['endRange']
  numDays: number
  initialName?: string
  initialDates?: string[]
  onSubmit: (data: ResponseFormData) => void
  isSubmitting?: boolean
  className?: string
}

function groupDatesIntoRanges(dates: string[], status: 'available' | 'unavailable'): DateRange[] {
  if (dates.length === 0) return []

  const sortedDates = [...dates].sort()
  const ranges: DateRange[] = []
  let rangeStart = sortedDates[0]
  let rangeEnd = sortedDates[0]

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = parseISO(sortedDates[i])
    const prevDate = parseISO(sortedDates[i - 1])
    const daysDiff = differenceInDays(currentDate, prevDate)

    if (daysDiff === 1) {
      rangeEnd = sortedDates[i]
    } else {
      const days = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1
      ranges.push({
        id: `${status}-${rangeStart}`,
        start: rangeStart,
        end: rangeEnd,
        days,
        status
      })
      rangeStart = sortedDates[i]
      rangeEnd = sortedDates[i]
    }
  }

  const days = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1
  ranges.push({
    id: `${status}-${rangeStart}`,
    start: rangeStart,
    end: rangeEnd,
    days,
    status
  })

  return ranges
}

export function ResponseForm({
  startRange,
  endRange,
  numDays,
  initialName = '',
  initialDates = [],
  onSubmit,
  isSubmitting,
  className
}: ResponseFormProps) {
  const [name, setName] = useState(initialName)
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    new Set(initialDates)
  )
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set())

  const allTripDates = useMemo(() => {
    return eachDayOfInterval({
      start: parseISO(startRange),
      end: parseISO(endRange)
    }).map(d => format(d, 'yyyy-MM-dd'))
  }, [startRange, endRange])

  const availableRanges = useMemo(
    () => groupDatesIntoRanges(Array.from(selectedDates), 'available'),
    [selectedDates]
  )

  const compatibleWindowsCount = useMemo(() => {
    // Count how many possible windows of numDays length exist
    // For each range >= numDays, there are (range.days - numDays + 1) possible windows
    return availableRanges
      .filter(range => range.days >= numDays)
      .reduce((total, range) => total + (range.days - numDays + 1), 0)
  }, [availableRanges, numDays])

  const unavailableDatesArray = useMemo(() => {
    return allTripDates.filter(date => !selectedDates.has(date))
  }, [allTripDates, selectedDates])

  const unavailableRanges = useMemo(
    () => groupDatesIntoRanges(unavailableDatesArray, 'unavailable'),
    [unavailableDatesArray]
  )

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const newDates = new Set(selectedDates)

    if (newDates.has(dateStr)) {
      newDates.delete(dateStr)
    } else {
      newDates.add(dateStr)
    }

    setSelectedDates(newDates)
  }

  const handleDateRangeSelect = (start: Date, end: Date, action: 'select' | 'deselect') => {
    const dates = eachDayOfInterval({ start, end })
    const newDates = new Set(selectedDates)

    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      if (action === 'select') {
        newDates.add(dateStr)
      } else {
        newDates.delete(dateStr)
      }
    })

    setSelectedDates(newDates)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name: name.trim(),
      availableDates: Array.from(selectedDates).sort()
    })
  }

  const toggleRangeSelection = (rangeId: string) => {
    const newSelected = new Set(selectedRangeIds)
    if (newSelected.has(rangeId)) {
      newSelected.delete(rangeId)
    } else {
      newSelected.add(rangeId)
    }
    setSelectedRangeIds(newSelected)
  }

  const deleteSelectedRanges = () => {
    const newDates = new Set(selectedDates)

    selectedRangeIds.forEach(rangeId => {
      const availableRange = availableRanges.find(r => r.id === rangeId)
      if (availableRange) {
        const dates = eachDayOfInterval({
          start: parseISO(availableRange.start),
          end: parseISO(availableRange.end)
        })
        dates.forEach(d => newDates.delete(format(d, 'yyyy-MM-dd')))
      }

      // For unavailable ranges, "deleting" means marking them as available
      const unavailableRange = unavailableRanges.find(r => r.id === rangeId)
      if (unavailableRange) {
        const dates = eachDayOfInterval({
          start: parseISO(unavailableRange.start),
          end: parseISO(unavailableRange.end)
        })
        dates.forEach(d => newDates.add(format(d, 'yyyy-MM-dd')))
      }
    })

    setSelectedDates(newDates)
    setSelectedRangeIds(new Set())
  }

  const markAllAs = (status: 'available' | 'unavailable') => {
    if (status === 'available') {
      setSelectedDates(new Set(allTripDates))
    } else {
      setSelectedDates(new Set())
    }
  }

  const formatRangeDisplay = (range: DateRange) => {
    const startDate = parseISO(range.start)
    const endDate = parseISO(range.end)

    if (range.start === range.end) {
      return format(startDate, 'MMM d')
    }

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`
    }

    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
  }

  const totalRanges = availableRanges.length + unavailableRanges.length
  const isSingleFullRange = totalRanges === 1 && selectedRangeIds.size === 1
  const hasSelectedRanges = selectedRangeIds.size > 0 && !isSingleFullRange

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Your Information Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
          <label className="flex flex-col gap-3 flex-grow max-w-[480px]">
            <span className="text-foreground text-lg font-bold leading-normal">
              What should we call you?
            </span>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <User className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                variant="pill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 sm:h-14 pl-12 pr-4 text-base font-medium"
              />
            </div>
          </label>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 px-6"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Availability'}
          </Button>
        </div>
      </Card>

      {/* Calendar and Manage Dates Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Select Dates Card */}
        <Card className="p-5 sm:p-6 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <h3 className="text-foreground text-lg font-bold">Select your dates</h3>
              {selectedDates.size > 0 && (
                <Badge className={compatibleWindowsCount === 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}>
                  {compatibleWindowsCount} compatible {compatibleWindowsCount === 1 ? 'window' : 'windows'}
                </Badge>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-border pl-3 pr-4">
                <CheckCircle className="size-4 text-primary" />
                <p className="text-foreground text-sm font-medium">Available</p>
              </div>
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-background pl-3 pr-4 border border-border">
                <Ban className="size-4 text-muted-foreground" />
                <p className="text-muted-foreground text-sm font-medium">Unavailable</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm -mt-2">
            Click and drag to select range, or tap individual days.
          </p>

          <AvailabilityCalendar
            startRange={startRange}
            endRange={endRange}
            selectedDates={Array.from(selectedDates)}
            onDateClick={handleDateClick}
            onDateRangeSelect={handleDateRangeSelect}
            mode="select"
            showNavigation={true}
            cellVariant="circle"
            numberOfMonths={2}
          />
        </Card>

        {/* Manage Dates Card */}
        <Card className="p-5 sm:p-6 w-full lg:w-80 h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-lg font-bold">Manage Dates</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  All dates are unavailable by default. Select dates on the calendar to mark them as available.
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={deleteSelectedRanges}
              disabled={!hasSelectedRanges}
              className={`h-8 px-2 ${hasSelectedRanges ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'invisible'}`}
            >
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
            {/* Available Dates Section */}
            {availableRanges.length > 0 && (
              <div>
                <div className="mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Available Dates
                  </span>
                </div>

                <div className="space-y-2">
                  {availableRanges.map(range => (
                    <div
                      key={range.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/50 hover:bg-surface-darker transition-colors"
                    >
                      <Checkbox
                        checked={selectedRangeIds.has(range.id)}
                        onCheckedChange={() => toggleRangeSelection(range.id)}
                        className="border-muted-foreground"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium">
                          {formatRangeDisplay(range)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {range.days} {range.days === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Dates Section */}
            {unavailableRanges.length > 0 && (
              <div>
                <div className="mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Unavailable Dates
                  </span>
                </div>

                <div className="space-y-2">
                  {unavailableRanges.map(range => (
                    <div
                      key={range.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/50 hover:bg-surface-darker transition-colors"
                    >
                      <Checkbox
                        checked={selectedRangeIds.has(range.id)}
                        onCheckedChange={() => toggleRangeSelection(range.id)}
                        className="border-muted-foreground"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium">
                          {formatRangeDisplay(range)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {range.days} {range.days === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mark All Actions */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick actions</p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAllAs('available')}
                className="w-full text-xs h-8 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
              >
                <CheckCircle className="size-3 mr-1" />
                Mark all available
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAllAs('unavailable')}
                className="w-full text-xs h-8 border-muted-foreground/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Ban className="size-3 mr-1" />
                Mark all unavailable
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  )
}
