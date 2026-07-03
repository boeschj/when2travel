import { CalendarSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

import type { AlternativeWindow } from "./availability-analysis";
import { formatNameList } from "./recommendation-types";
import { formatDateRangeDisplay } from "./recommendation-utils";

interface AlternativeSuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alternatives: AlternativeWindow[];
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
        <AlternativeWindowList alternatives={alternatives} />
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
          Other Date Options
        </ResponsiveDialogTitle>
      </div>
    </ResponsiveDialogHeader>
  );
}

function ModalIcon() {
  return (
    <div className="bg-surface-darker flex h-10 w-10 items-center justify-center rounded-full">
      <CalendarSearch className="text-text-secondary h-5 w-5" />
    </div>
  );
}

interface AlternativeWindowListProps {
  alternatives: AlternativeWindow[];
}

function AlternativeWindowList({ alternatives }: AlternativeWindowListProps) {
  const hasAlternatives = alternatives.length > 0;

  if (!hasAlternatives) {
    return <EmptyState />;
  }

  return (
    <div className="-mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
      {alternatives.map(alternativeWindow => (
        <AlternativeWindowCard
          key={`${alternativeWindow.start}-${alternativeWindow.end}`}
          window={alternativeWindow}
        />
      ))}
    </div>
  );
}

interface AlternativeWindowCardProps {
  window: AlternativeWindow;
}

function AlternativeWindowCard({ window }: AlternativeWindowCardProps) {
  const dateRangeDisplay = formatDateRangeDisplay(window.start, window.end);
  const availabilityLabel = `${window.availableCount}/${window.totalCount} available`;

  return (
    <div className="bg-surface-darker border-border w-full rounded-lg border p-4">
      <div className="mb-2 flex w-full items-center justify-between">
        <h3 className="text-foreground text-base font-bold">{dateRangeDisplay}</h3>
        <Badge
          variant="secondary"
          className="bg-surface-dark text-text-secondary px-2 py-0.5 text-xs font-medium"
        >
          {availabilityLabel}
        </Badge>
      </div>
      <MissingParticipants missing={window.missing} />
    </div>
  );
}

function MissingParticipants({ missing }: { missing: string[] }) {
  if (missing.length === 0) {
    return <p className="text-primary text-sm">Everyone's free</p>;
  }

  return <p className="text-text-secondary text-sm">Missing: {formatNameList(missing)}</p>;
}

function EmptyState() {
  return <div className="text-text-secondary py-8 text-center">No other options available</div>;
}
