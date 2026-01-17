import { Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Recommendation } from '@/lib/recommendation-types'
import { getPriorityLabel } from '@/lib/recommendation-types'

interface AlternativeSuggestionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alternatives: Recommendation[]
}

interface AlternativeSuggestionItemProps {
  recommendation: Recommendation
}

function AlternativeSuggestionItem({
  recommendation,
}: AlternativeSuggestionItemProps) {
  const priorityLabel = getPriorityLabel(recommendation.priority)

  return (
    <div className="w-full p-4 rounded-lg bg-surface-darker border border-border">
      <div className="flex items-center justify-between w-full mb-2">
        <Badge
          variant="secondary"
          className="bg-surface-dark text-text-secondary text-xs font-medium px-2 py-0.5"
        >
          {priorityLabel}
        </Badge>
      </div>
      <h3 className="text-foreground font-bold text-base mb-1">
        {recommendation.headline}
      </h3>
      <p className="text-text-secondary text-sm mb-2">{recommendation.detail}</p>
      <p className="text-foreground text-sm">{recommendation.recommendation}</p>
      {recommendation.secondary && (
        <p className="text-text-secondary text-xs mt-2">
          {recommendation.secondary}
        </p>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-text-secondary">
      No other suggestions available
    </div>
  )
}

export function AlternativeSuggestionsModal({
  open,
  onOpenChange,
  alternatives,
}: AlternativeSuggestionsModalProps) {
  const hasAlternatives = alternatives.length > 0
  const modalContentClassName =
    'bg-surface-dark border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col gap-6'
  const scrollableContentClassName =
    'flex-1 overflow-y-auto space-y-3 pr-2 -mr-2'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalContentClassName}>
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-text-secondary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Other Suggestions
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className={scrollableContentClassName}>
          {hasAlternatives ? (
            alternatives.map((recommendation, index) => (
              <AlternativeSuggestionItem
                key={`${recommendation.priority}-${index}`}
                recommendation={recommendation}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
