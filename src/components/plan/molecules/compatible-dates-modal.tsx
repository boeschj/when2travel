import { format, parseISO, differenceInDays } from 'date-fns'
import { ThumbsUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CompatibleDateRange } from '@/lib/types'

interface CompatibleDatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compatibleRanges: CompatibleDateRange[]
  onRangeSelect?: (range: CompatibleDateRange) => void
}

export function CompatibleDatesModal({
  open,
  onOpenChange,
  compatibleRanges,
  onRangeSelect,
}: CompatibleDatesModalProps) {
  const handleRangeClick = (range: CompatibleDateRange) => {
    onRangeSelect?.(range)
    onOpenChange(false)
  }

  const hasRanges = compatibleRanges.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col gap-6">
        <ModalHeader />
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {hasRanges && (
            <RangeList
              ranges={compatibleRanges}
              onRangeClick={handleRangeClick}
            />
          )}
          {!hasRanges && <EmptyState />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ModalHeader() {
  return (
    <DialogHeader className="shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
          <ThumbsUp className="w-5 h-5 text-text-secondary" />
        </div>
        <DialogTitle className="text-2xl font-bold text-foreground">
          Compatible Date Ranges
        </DialogTitle>
      </div>
    </DialogHeader>
  )
}

interface RangeListProps {
  ranges: CompatibleDateRange[]
  onRangeClick: (range: CompatibleDateRange) => void
}

function RangeList({ ranges, onRangeClick }: RangeListProps) {
  return (
    <>
      {ranges.map((range, index) => (
        <RangeCard
          key={`${range.start}-${range.end}`}
          range={range}
          isBestMatch={index === 0}
          onClick={() => onRangeClick(range)}
        />
      ))}
    </>
  )
}

interface RangeCardProps {
  range: CompatibleDateRange
  isBestMatch: boolean
  onClick: () => void
}

function RangeCard({ range, isBestMatch, onClick }: RangeCardProps) {
  const startDate = parseISO(range.start)
  const endDate = parseISO(range.end)
  const durationDays = differenceInDays(endDate, startDate) + 1
  const formattedRange = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        'w-full h-auto p-4 rounded-lg border transition-all text-left flex flex-col items-stretch hover:scale-100',
        isBestMatch
          && 'bg-primary/10 border-primary hover:bg-primary/15 hover:border-primary',
        !isBestMatch
          && 'bg-surface-darker border-border hover:bg-surface-darker hover:border-text-secondary',
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-xl">{formattedRange}</h3>
          {isBestMatch && (
            <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
              Best Match
            </Badge>
          )}
        </div>
      </div>
      <RangeDetails
        durationDays={durationDays}
        availableCount={range.availableCount}
        totalCount={range.totalCount}
      />
    </Button>
  )
}

interface RangeDetailsProps {
  durationDays: number
  availableCount: number
  totalCount: number
}

function RangeDetails({ durationDays, availableCount, totalCount }: RangeDetailsProps) {
  return (
    <div className="flex items-center justify-between w-full mt-1">
      <p className="text-primary text-sm font-semibold">{durationDays} Days</p>
      <div className="flex items-center gap-1.5 text-primary">
        <Users className="w-4 h-4" />
        <span className="font-semibold">
          {availableCount}/{totalCount}
        </span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-text-secondary">
      No compatible date ranges found
    </div>
  )
}
