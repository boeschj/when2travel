import { differenceInDays } from "date-fns";
import { ThumbsUp, Users } from "lucide-react";

import { formatRangeDisplay } from "@/lib/date/formatter";
import { parseISODate } from "@/lib/date/types";
import type { CompatibleDateRange } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface CompatibleDatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compatibleRanges: CompatibleDateRange[];
  onRangeSelect?: (range: CompatibleDateRange) => void;
}

export function CompatibleDatesModal({
  open,
  onOpenChange,
  compatibleRanges,
  onRangeSelect,
}: CompatibleDatesModalProps) {
  const handleRangeClick = (range: CompatibleDateRange) => {
    onRangeSelect?.(range);
    onOpenChange(false);
  };

  const hasRanges = compatibleRanges.length > 0;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <ResponsiveDialogContent className="bg-surface-dark border-border flex max-h-[80vh] max-w-md flex-col gap-6 overflow-hidden">
        <ModalHeader />
        <div className="-mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
          {hasRanges && (
            <RangeList
              ranges={compatibleRanges}
              onRangeClick={handleRangeClick}
            />
          )}
          {!hasRanges && <EmptyState />}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function ModalHeader() {
  return (
    <ResponsiveDialogHeader className="shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-surface-darker flex h-10 w-10 items-center justify-center rounded-full">
          <ThumbsUp className="text-text-secondary h-5 w-5" />
        </div>
        <ResponsiveDialogTitle className="text-foreground text-2xl font-bold">
          Compatible Date Ranges
        </ResponsiveDialogTitle>
      </div>
    </ResponsiveDialogHeader>
  );
}

interface RangeListProps {
  ranges: CompatibleDateRange[];
  onRangeClick: (range: CompatibleDateRange) => void;
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
  );
}

interface RangeCardProps {
  range: CompatibleDateRange;
  isBestMatch: boolean;
  onClick: () => void;
}

function RangeCard({ range, isBestMatch, onClick }: RangeCardProps) {
  const startDate = parseISODate(range.start);
  const endDate = parseISODate(range.end);
  const durationDays = differenceInDays(endDate, startDate) + 1;
  const formattedRange = formatRangeDisplay(range.start, range.end, " – ");

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "flex h-auto w-full flex-col items-stretch rounded-lg border p-4 text-left transition-all hover:scale-100",
        isBestMatch && "bg-primary/10 border-primary hover:bg-primary/15 hover:border-primary",
        !isBestMatch &&
          "bg-surface-darker border-border hover:bg-surface-darker hover:border-text-secondary",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">{formattedRange}</h3>
          {isBestMatch && (
            <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
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
  );
}

interface RangeDetailsProps {
  durationDays: number;
  availableCount: number;
  totalCount: number;
}

function RangeDetails({ durationDays, availableCount, totalCount }: RangeDetailsProps) {
  return (
    <div className="mt-1 flex w-full items-center justify-between">
      <p className="text-primary text-sm font-semibold">{durationDays} Days</p>
      <div className="text-primary flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        <span className="font-semibold">
          {availableCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-text-secondary py-8 text-center">No compatible date ranges found</div>
  );
}
