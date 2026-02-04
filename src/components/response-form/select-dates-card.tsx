import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AvailabilityCalendar } from './availability-calendar'
import { AvailabilityActions } from './availability-actions'
import { useDateInteractionValue, useDateInteractionActions } from './date-interaction-context'
import { pluralize } from '@/lib/utils'

export function SelectDatesCard() {
  const {
    startRange,
    endRange,
    selectedDatesSet,
    compatibleWindowsCount,
    rangeStart,
  } = useDateInteractionValue()
  const { handleDateClick } = useDateInteractionActions()

  const selectedDates = Array.from(selectedDatesSet)
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
        <AvailabilityActions />
      </div>
      <Separator className="mb-4" />
      <AvailabilityCalendar
        startRange={startRange}
        endRange={endRange}
        selectedDates={selectedDates}
        rangeStart={rangeStart}
        onDateClick={handleDateClick}
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
    <Badge className={badgeVariantClassName}>
      {count} compatible {windowLabel}
    </Badge>
  )
}
