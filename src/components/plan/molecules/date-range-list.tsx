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
      <SectionHeader title={title} />
      <div className="space-y-2">
        {ranges.map(range => (
          <DateRangeRow
            key={range.id}
            range={range}
            isSelected={selectedIds.has(range.id)}
            onToggle={() => onToggleSelection(range.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface DateRangeRowProps {
  range: DateRange
  isSelected: boolean
  onToggle: () => void
}

function DateRangeRow({ range, isSelected, onToggle }: DateRangeRowProps) {
  const dateDisplay = formatDateRangeDisplay(range)
  const daysLabel = `${range.days} ${pluralize(range.days, 'day')}`

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-darker/50 hover:bg-surface-darker transition-colors">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        variant="light"
      />
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-medium">{dateDisplay}</p>
        <p className="text-muted-foreground text-xs">{daysLabel}</p>
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
    </div>
  )
}
