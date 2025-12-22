import { Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Recommendation } from '@/lib/recommendation-types'

interface AlternativeSuggestionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alternatives: Recommendation[]
}

/** Get a short label for each priority case */
function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return 'Perfect Match'
    case 2:
      return 'Shift Window'
    case 3:
      return 'Single Blocker'
    case 4:
      return 'Shorter Trip'
    case 5:
      return 'Schedule Conflict'
    case 6:
      return 'Good Enough'
    case 7:
      return 'Expand Range'
    case 8:
      return 'Multiple Options'
    case 9:
      return 'General'
    default:
      return 'Suggestion'
  }
}

export function AlternativeSuggestionsModal({
  open,
  onOpenChange,
  alternatives,
}: AlternativeSuggestionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col gap-6">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-text-secondary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Other Suggestions
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {alternatives.map((rec, index) => (
            <div
              key={`${rec.priority}-${index}`}
              className="w-full p-4 rounded-lg bg-surface-darker border border-border"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Badge
                  variant="secondary"
                  className="bg-surface-dark text-text-secondary text-xs font-medium px-2 py-0.5"
                >
                  {getPriorityLabel(rec.priority)}
                </Badge>
              </div>
              <h3 className="text-foreground font-bold text-base mb-1">{rec.headline}</h3>
              <p className="text-text-secondary text-sm mb-2">{rec.detail}</p>
              <p className="text-foreground text-sm">{rec.recommendation}</p>
              {rec.secondary && (
                <p className="text-text-secondary text-xs mt-2">{rec.secondary}</p>
              )}
            </div>
          ))}

          {alternatives.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              No other suggestions available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
