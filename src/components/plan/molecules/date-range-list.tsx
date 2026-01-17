import { Checkbox } from '@/components/ui/checkbox'
import { formatDateRangeDisplay, pluralize } from '@/lib/utils'
import type { DateRange } from '@/lib/types'

interface DateRangeListProps {
  title: string
  ranges: DateRange[]
  selectedIds: Set<string>
  onToggleSelection: (rangeId: string) => void
}

export function DateRangeList({
  title,
  ranges,
  selectedIds,
  onToggleSelection
}: DateRangeListProps) {
  if (ranges.length === 0) return null

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div className="space-y-2">
        {ranges.map(range => (
          <div
            key={range.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/50 hover:bg-surface-darker transition-colors"
          >
            <Checkbox
              checked={selectedIds.has(range.id)}
              onCheckedChange={() => onToggleSelection(range.id)}
              variant="light"
            />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium">
                {formatDateRangeDisplay(range)}
              </p>
              <p className="text-muted-foreground text-xs">
                {range.days} {pluralize(range.days, 'day')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
