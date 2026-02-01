import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Trash2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRangeList } from './date-range-list'
import type { DateRange } from '@/lib/types'

interface ManageDatesCardProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedRangeIds: Set<string>
  hasSelectedRanges: boolean
  onToggleRangeSelection: (rangeId: string) => void
  onDeleteSelected: () => void
}

export function ManageDatesCard({
  availableRanges,
  unavailableRanges,
  selectedRangeIds,
  hasSelectedRanges,
  onToggleRangeSelection,
  onDeleteSelected
}: ManageDatesCardProps) {
  return (
    <Card className="hidden xl:flex p-4 w-72 flex-col overflow-hidden">
      <CardHeader
        hasSelectedRanges={hasSelectedRanges}
        onDeleteSelected={onDeleteSelected}
      />
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
        <DateRangeList
          title="Available Dates"
          ranges={availableRanges}
          selectedIds={selectedRangeIds}
          onToggleSelection={onToggleRangeSelection}
        />
        <DateRangeList
          title="Unavailable Dates"
          ranges={unavailableRanges}
          selectedIds={selectedRangeIds}
          onToggleSelection={onToggleRangeSelection}
        />
      </div>
    </Card>
  )
}

interface CardHeaderProps {
  hasSelectedRanges: boolean
  onDeleteSelected: () => void
}

function CardHeader({ hasSelectedRanges, onDeleteSelected }: CardHeaderProps) {
  const destructiveStyles = 'text-destructive hover:text-destructive hover:bg-destructive/10'
  const clearButtonClassName = cn(
    'h-8 px-2',
    hasSelectedRanges && destructiveStyles,
    !hasSelectedRanges && 'invisible'
  )

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-foreground text-lg font-bold">Manage Dates</h3>
        <InfoTooltip />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDeleteSelected}
        disabled={!hasSelectedRanges}
        className={clearButtonClassName}
      >
        <Trash2 className="size-4 mr-1" />
        Clear
      </Button>
    </div>
  )
}

function InfoTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-foreground">
          <Info className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        All dates are unavailable by default. Select dates on the calendar to mark them as available.
      </TooltipContent>
    </Tooltip>
  )
}
