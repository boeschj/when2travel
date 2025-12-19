import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

  const handleDateRangeSelect = (start: Date, end: Date) => {
    const dates = eachDayOfInterval({ start, end })
    const newDates = new Set(selectedDates)

    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      newDates.add(dateStr)
    })

    setSelectedDates(newDates)
  }

  const handleSelectAll = () => {
    const allDates = eachDayOfInterval({
      start: parseISO(startRange),
      end: parseISO(endRange)
    })

    const newDates = new Set(
      allDates.map(date => format(date, 'yyyy-MM-dd'))
    )

    setSelectedDates(newDates)
  }

  const handleClearAll = () => {
    setSelectedDates(new Set())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedDates.size === 0) return

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

    return `${format(parseISO(firstDate), 'MMM d')} - ${format(parseISO(lastDate), 'MMM d, yyyy')}`
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-8', className)}>
      <Card className="bg-surface-dark/40 border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-lg font-bold">
              What should we call you?
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
                  person
                </span>
              </div>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-14 sm:h-16 pl-12 pr-4 text-lg font-medium bg-surface-dark border-2 border-border focus:border-primary focus:bg-background-dark"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">
                {selectedDates.size} {selectedDates.size === 1 ? 'day' : 'days'} selected
              </span>
              <span className="text-text-secondary text-xs">
                {getSelectedDateRange()}
              </span>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || selectedDates.size === 0}
              className="w-full sm:w-auto h-14 sm:h-16 px-8 bg-primary hover:bg-primary/90 text-background-dark shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Availability'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-dark/40 border-border backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Select your dates</CardTitle>
              <CardDescription className="text-text-secondary mt-1">
                Click individual days or drag to select a range
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-10">
            <AvailabilityCalendar
              startRange={startRange}
              endRange={endRange}
              selectedDates={Array.from(selectedDates)}
              onDateClick={handleDateClick}
              onDateRangeSelect={handleDateRangeSelect}
              mode="select"
              showNavigation={true}
              className="min-w-[300px] flex-1 max-w-[400px]"
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}