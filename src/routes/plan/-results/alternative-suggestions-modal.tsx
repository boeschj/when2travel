import { Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Recommendation } from './recommendation-types'
import { getPriorityLabel } from './recommendation-types'

interface AlternativeSuggestionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alternatives: Recommendation[]
}

export function AlternativeSuggestionsModal({
  open,
  onOpenChange,
  alternatives,
}: AlternativeSuggestionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-dark border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col gap-6">
        <ModalHeader />
        <SuggestionsList alternatives={alternatives} />
      </DialogContent>
    </Dialog>
  )
}

function ModalHeader() {
  return (
    <DialogHeader className="shrink-0">
      <div className="flex items-center gap-3">
        <ModalIcon />
        <DialogTitle className="text-2xl font-bold text-foreground">
          Other Suggestions
        </DialogTitle>
      </div>
    </DialogHeader>
  )
}

function ModalIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-surface-darker flex items-center justify-center">
      <Lightbulb className="w-5 h-5 text-text-secondary" />
    </div>
  )
}

interface SuggestionsListProps {
  alternatives: Recommendation[]
}

function SuggestionsList({ alternatives }: SuggestionsListProps) {
  const hasAlternatives = alternatives.length > 0

  if (!hasAlternatives) {
    return <EmptyState />
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
      {alternatives.map((recommendation, index) => (
        <SuggestionCard
          key={`${recommendation.priority}-${index}`}
          recommendation={recommendation}
        />
      ))}
    </div>
  )
}

interface SuggestionCardProps {
  recommendation: Recommendation
}

function SuggestionCard({ recommendation }: SuggestionCardProps) {
  const priorityLabel = getPriorityLabel(recommendation.priority)

  return (
    <div className="w-full p-4 rounded-lg bg-surface-darker border border-border">
      <PriorityBadge label={priorityLabel} />
      <SuggestionContent
        headline={recommendation.headline}
        detail={recommendation.detail}
        recommendationText={recommendation.recommendation}
      />
      {recommendation.secondary && (
        <SecondaryNote text={recommendation.secondary} />
      )}
    </div>
  )
}

interface PriorityBadgeProps {
  label: string
}

function PriorityBadge({ label }: PriorityBadgeProps) {
  return (
    <div className="flex items-center justify-between w-full mb-2">
      <Badge
        variant="secondary"
        className="bg-surface-dark text-text-secondary text-xs font-medium px-2 py-0.5"
      >
        {label}
      </Badge>
    </div>
  )
}

interface SuggestionContentProps {
  headline: string
  detail: string
  recommendationText: string
}

function SuggestionContent({
  headline,
  detail,
  recommendationText,
}: SuggestionContentProps) {
  return (
    <>
      <h3 className="text-foreground font-bold text-base mb-1">{headline}</h3>
      <p className="text-text-secondary text-sm mb-2">{detail}</p>
      <p className="text-foreground text-sm">{recommendationText}</p>
    </>
  )
}

interface SecondaryNoteProps {
  text: string
}

function SecondaryNote({ text }: SecondaryNoteProps) {
  return (
    <p className="text-text-secondary text-xs mt-2">{text}</p>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-text-secondary">
      No other suggestions available
    </div>
  )
}
