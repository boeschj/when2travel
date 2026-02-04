import { Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

import type { Recommendation } from "./recommendation-types";
import { getPriorityLabel } from "./recommendation-types";

interface AlternativeSuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alternatives: Recommendation[];
}

export function AlternativeSuggestionsModal({
  open,
  onOpenChange,
  alternatives,
}: AlternativeSuggestionsModalProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <ResponsiveDialogContent className="bg-surface-dark border-border flex max-h-[80vh] max-w-md flex-col gap-6 overflow-hidden">
        <ModalHeader />
        <SuggestionsList alternatives={alternatives} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function ModalHeader() {
  return (
    <ResponsiveDialogHeader className="shrink-0">
      <div className="flex items-center gap-3">
        <ModalIcon />
        <ResponsiveDialogTitle className="text-foreground text-2xl font-bold">
          Other Suggestions
        </ResponsiveDialogTitle>
      </div>
    </ResponsiveDialogHeader>
  );
}

function ModalIcon() {
  return (
    <div className="bg-surface-darker flex h-10 w-10 items-center justify-center rounded-full">
      <Lightbulb className="text-text-secondary h-5 w-5" />
    </div>
  );
}

interface SuggestionsListProps {
  alternatives: Recommendation[];
}

function SuggestionsList({ alternatives }: SuggestionsListProps) {
  const hasAlternatives = alternatives.length > 0;

  if (!hasAlternatives) {
    return <EmptyState />;
  }

  return (
    <div className="-mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
      {alternatives.map((recommendation, index) => (
        <SuggestionCard
          key={`${recommendation.priority}-${index}`}
          recommendation={recommendation}
        />
      ))}
    </div>
  );
}

interface SuggestionCardProps {
  recommendation: Recommendation;
}

function SuggestionCard({ recommendation }: SuggestionCardProps) {
  const priorityLabel = getPriorityLabel(recommendation.priority);

  return (
    <div className="bg-surface-darker border-border w-full rounded-lg border p-4">
      <PriorityBadge label={priorityLabel} />
      <SuggestionContent
        headline={recommendation.headline}
        detail={recommendation.detail}
        recommendationText={recommendation.recommendation}
      />
      {recommendation.secondary && <SecondaryNote text={recommendation.secondary} />}
    </div>
  );
}

interface PriorityBadgeProps {
  label: string;
}

function PriorityBadge({ label }: PriorityBadgeProps) {
  return (
    <div className="mb-2 flex w-full items-center justify-between">
      <Badge
        variant="secondary"
        className="bg-surface-dark text-text-secondary px-2 py-0.5 text-xs font-medium"
      >
        {label}
      </Badge>
    </div>
  );
}

interface SuggestionContentProps {
  headline: string;
  detail: string;
  recommendationText: string;
}

function SuggestionContent({ headline, detail, recommendationText }: SuggestionContentProps) {
  return (
    <>
      <h3 className="text-foreground mb-1 text-base font-bold">{headline}</h3>
      <p className="text-text-secondary mb-2 text-sm">{detail}</p>
      <p className="text-foreground text-sm">{recommendationText}</p>
    </>
  );
}

interface SecondaryNoteProps {
  text: string;
}

function SecondaryNote({ text }: SecondaryNoteProps) {
  return <p className="text-text-secondary mt-2 text-xs">{text}</p>;
}

function EmptyState() {
  return <div className="text-text-secondary py-8 text-center">No other suggestions available</div>;
}
