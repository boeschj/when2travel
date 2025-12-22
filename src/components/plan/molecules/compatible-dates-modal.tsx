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
  onRangeSelect
}: CompatibleDatesModalProps) {
  const handleRangeClick = (range: CompatibleDateRange) => {
    onRangeSelect?.(range)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col gap-6">
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

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {compatibleRanges.map((range, index) => {
            const startDate = parseISO(range.start)
            const endDate = parseISO(range.end)
            const durationDays = differenceInDays(endDate, startDate) + 1
            const isBestMatch = index === 0
            const formattedRange = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`

            return (
              <Button
                key={`${range.start}-${range.end}`}
                variant="outline"
                onClick={() => handleRangeClick(range)}
                className={cn(
                  'w-full h-auto p-4 rounded-lg border transition-all text-left flex flex-col items-stretch hover:scale-100',
                  isBestMatch
                    ? 'bg-primary/10 border-primary hover:bg-primary/15 hover:border-primary'
                    : 'bg-surface-darker border-border hover:bg-surface-darker hover:border-text-secondary'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-xl">
                      {formattedRange}
                    </h3>
                    {isBestMatch && (
                      <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
                        Best Match
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between w-full mt-1">
                  <p className="text-primary text-sm font-semibold">
                    {durationDays} Days
                  </p>
                  <div className="flex items-center gap-1.5 text-primary">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">
                      {range.availableCount}/{range.totalCount}
                    </span>
                  </div>
                </div>
              </Button>
            )
          })}

          {compatibleRanges.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              No compatible date ranges found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
