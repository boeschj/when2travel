import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvailabilityCalendar } from '../organisms/availability-calendar'
import { AvailabilityActions } from './availability-actions'
import type { DateRange } from '@/lib/types'

function SelectionStatusBar({
  hasSelectedDates,
  compatibleWindowsCount
}: {
  hasSelectedDates: boolean
  compatibleWindowsCount: number
}) {
  const badgeVisible = hasSelectedDates
  const isZeroCompatible = compatibleWindowsCount === 0
  const badgeClassName = [
    "shrink-0",
    !badgeVisible
      ? "invisible"
      : isZeroCompatible
      ? "bg-destructive text-destructive-foreground"
      : "bg-primary text-primary-foreground"
  ].join(" ")

  const windowLabel = `window${compatibleWindowsCount === 1 ? '' : 's'}`

  return (
    <div className="flex items-center justify-between gap-4 -mt-2">
      <p className="text-muted-foreground text-sm">
        Tap once to start a range, tap again to complete it.
      </p>
      <Badge className={badgeClassName}>
        {compatibleWindowsCount} compatible {windowLabel}
      </Badge>
    </div>
  )
}

interface SelectDatesCardProps {
  startRange: string
  endRange: string
  selectedDates: string[]
  compatibleWindowsCount: number
  rangeStart: Date | null
  onDateClick: (date: Date) => void
  onMarkAllAs: (status: 'available' | 'unavailable') => void
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  onToggleRangeSelection: (rangeId: string) => void
  onDeleteSelected: () => void
}

export function SelectDatesCard({
  startRange,
  endRange,
  selectedDates,
  compatibleWindowsCount,
  rangeStart,
  onDateClick,
  onMarkAllAs,
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  onToggleRangeSelection,
  onDeleteSelected
}: SelectDatesCardProps) {
  const hasSelectedDates = selectedDates.length > 0
  const hasAnyRanges = availableRanges.length > 0 || unavailableRanges.length > 0

  return (
    <Card className="p-4 w-full md:w-fit items-center">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 w-full">
        <h3 className="text-foreground text-lg font-bold">Set your availability</h3>
        <AvailabilityActions
          availableRanges={availableRanges}
          unavailableRanges={unavailableRanges}
          selectedRangeIds={selectedRangeIds}
          hasSelectedRanges={hasSelectedRanges}
          hasAnyRanges={hasAnyRanges}
          onToggleRangeSelection={onToggleRangeSelection}
          onDeleteSelected={onDeleteSelected}
          onMarkAllAs={onMarkAllAs}
        />
      </div>
      <SelectionStatusBar
        hasSelectedDates={hasSelectedDates}
        compatibleWindowsCount={compatibleWindowsCount}
      />
      <AvailabilityCalendar
        startRange={startRange}
        endRange={endRange}
        selectedDates={selectedDates}
        rangeStart={rangeStart}
        onDateClick={onDateClick}
        numberOfMonths={2}
      />
    </Card>
  )
}
