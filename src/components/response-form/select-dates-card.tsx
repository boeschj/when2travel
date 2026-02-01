import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AvailabilityCalendar } from './availability-calendar'
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

  return (
    <Card className="p-4 w-full md:w-fit items-center">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <SectionHeader>Set your availability</SectionHeader>
            {hasSelectedDates && (
              <CompatibleWindowsBadge count={compatibleWindowsCount} />
            )}
          </div>
          <SectionSubheader>
            Tap once to start a range, tap again to complete it.
          </SectionSubheader>
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

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-foreground text-lg font-bold">{children}</h3>
  )
}

function SectionSubheader({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm mt-1">{children}</p>
  )
}

interface CompatibleWindowsBadgeProps {
  count: number
}

function CompatibleWindowsBadge({ count }: CompatibleWindowsBadgeProps) {
  const isZeroCompatible = count === 0
  const windowLabel = pluralize(count, 'window')

  let badgeVariantClassName = 'bg-primary text-primary-foreground'
  if (isZeroCompatible) {
    badgeVariantClassName = 'bg-destructive text-destructive-foreground'
  }

  return (
    <Badge className={cn(badgeVariantClassName)}>
      {count} compatible {windowLabel}
    </Badge>
  )
}
