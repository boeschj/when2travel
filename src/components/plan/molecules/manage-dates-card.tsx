import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Trash2, Info } from 'lucide-react'
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
    <Card className="hidden xl:flex p-4 w-72 flex-col max-h-[520px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-lg font-bold">Manage Dates</h3>
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
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDeleteSelected}
          disabled={!hasSelectedRanges}
          className={`h-8 px-2 ${hasSelectedRanges ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'invisible'}`}
        >
          <Trash2 className="size-4 mr-1" />
          Clear
        </Button>
      </div>

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
