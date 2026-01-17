import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AvailabilityCalendar } from '../organisms/availability-calendar'
import { AvailabilityActions } from './availability-actions'
import { cn, pluralize } from '@/lib/utils'
import type { DateRange } from '@/lib/types'
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
  const hasAnyRanges = availableRanges.length > 0 || unavailableRanges.length > 0
  const hasSelectedDates = selectedDates.length > 0
  const isZeroCompatible = compatibleWindowsCount === 0

  return (
    <Card className="p-4 w-full md:w-fit items-center">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <CardHeader>Set your availability</CardHeader>
            {hasSelectedDates && (
              <SelectionBadge
                compatibleWindowsCount={compatibleWindowsCount}
                isZeroCompatible={isZeroCompatible}
              />
            )}
          </div>
          <CardSubheader>
            Tap once to start a range, tap again to complete it.
          </CardSubheader>
        </div>
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
      <Separator className="mb-4" />
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

function CardHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-foreground text-lg font-bold">{children}</h3>
  )
}

interface SelectionBadgeProps {
  compatibleWindowsCount: number
  isZeroCompatible: boolean
}

function SelectionBadge({
  compatibleWindowsCount,
  isZeroCompatible
}: SelectionBadgeProps) {
  const windowLabel = pluralize(compatibleWindowsCount, 'window')

  return (
    <Badge className={cn(
      isZeroCompatible
        ? "bg-destructive text-destructive-foreground"
        : "bg-primary text-primary-foreground"
    )}>
      {compatibleWindowsCount} compatible {windowLabel}
    </Badge>
  )
}

function CardSubheader({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm mt-1">{children}</p>
  )
}