import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { User, CheckCircle, Ban } from 'lucide-react'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { AvailabilityCalendar } from './availability-calendar'
import type { ResponseFormData, PlanWithResponses } from '@/lib/types'

interface ResponseFormProps {
  startRange: PlanWithResponses['startRange']
  endRange: PlanWithResponses['endRange']
  initialName?: string
  initialDates?: string[]
  onSubmit: (data: ResponseFormData) => void
  isSubmitting?: boolean
  className?: string
}

export function ResponseForm({
  startRange,
  endRange,
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

  const getSelectedDateRange = () => {
    if (selectedDates.size === 0) return 'No dates selected'
    if (selectedDates.size === 1) {
      const date = Array.from(selectedDates)[0]
      return format(parseISO(date), 'MMM d, yyyy')
    }

    const sortedDates = Array.from(selectedDates).sort()
    const firstDate = sortedDates[0]
    const lastDate = sortedDates[sortedDates.length - 1]

    return `${format(parseISO(firstDate), 'MMM d')} - ${format(parseISO(lastDate), 'd')}`
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Your Information Card */}
      <div className="bg-card/40 border border-border rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
          <label className="flex flex-col gap-3 flex-grow max-w-[480px]">
            <span className="text-foreground text-lg font-bold leading-normal">
              What should we call you?
            </span>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex w-full min-w-0 rounded-full text-foreground placeholder:text-muted-foreground/50 bg-muted border-2 border-border focus:border-primary focus:ring-0 focus:bg-background h-12 sm:h-14 pl-12 pr-4 text-base font-medium leading-normal transition-all duration-200 outline-none"
              />
            </div>
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col lg:items-end px-2">
              <span className="text-foreground font-bold text-sm">
                {selectedDates.size} {selectedDates.size === 1 ? 'day' : 'days'} selected
              </span>
              <span className="text-muted-foreground text-xs">
                {getSelectedDateRange()}
              </span>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full sm:w-auto h-12 sm:h-14 px-6"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Availability'}
            </Button>
          </div>
        </div>
      </div>

      {/* Select Dates Card */}
      <div className="bg-card/40 border border-border rounded-xl p-5 sm:p-6 backdrop-blur-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h3 className="text-foreground text-lg font-bold mb-1">Select your dates</h3>
            <p className="text-muted-foreground text-sm">
              Click and drag to select range, or tap individual days.
            </p>
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
      </div>
    </form>
  )
}