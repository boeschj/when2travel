import { Info, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useDateInteractionActions, useDateInteractionValue } from "./date-interaction-context";
import { DateRangeList } from "./date-range-list";

export function ManageDatesCard() {
  const { availableRanges, unavailableRanges, selectedRangeIds, hasSelectedRanges } =
    useDateInteractionValue();
  const { toggleRangeSelection, deleteSelectedRanges } = useDateInteractionActions();

  return (
    <Card className="hidden max-h-0 min-h-full w-72 flex-col overflow-hidden p-4 xl:flex">
      <CardHeader
        hasSelectedRanges={hasSelectedRanges}
        onDeleteSelected={deleteSelectedRanges}
      />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 pr-2">
          <DateRangeList
            title="Available Dates"
            ranges={availableRanges}
            selectedIds={selectedRangeIds}
            onToggleSelection={toggleRangeSelection}
          />
          <DateRangeList
            title="Unavailable Dates"
            ranges={unavailableRanges}
            selectedIds={selectedRangeIds}
            onToggleSelection={toggleRangeSelection}
          />
        </div>
      </ScrollArea>
    </Card>
  );
}

interface CardHeaderProps {
  hasSelectedRanges: boolean;
  onDeleteSelected: () => void;
}

function CardHeader({ hasSelectedRanges, onDeleteSelected }: CardHeaderProps) {
  const destructiveStyles = "text-destructive hover:text-destructive hover:bg-destructive/10";
  const clearButtonClassName = cn(
    "h-8 px-2",
    hasSelectedRanges && destructiveStyles,
    !hasSelectedRanges && "invisible",
  );

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-foreground text-lg font-bold">Manage Dates</h3>
        <InfoTooltip />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDeleteSelected}
        disabled={!hasSelectedRanges}
        className={clearButtonClassName}
      >
        <Trash2 className="mr-1 size-4" />
        Clear
      </Button>
    </div>
  );
}

function InfoTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-6"
        >
          <Info className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[200px]"
      >
        All dates are unavailable by default. Select dates on the calendar to mark them as
        available.
      </TooltipContent>
    </Tooltip>
  );
}
