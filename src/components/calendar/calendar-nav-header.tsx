import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatMonthYear } from "@/lib/date/formatter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CalendarNavHeaderProps {
  month: Date;
  onPrevious: () => void;
  onNext: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  nextClassName?: string;
}

export function CalendarNavHeader({
  month,
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
  nextClassName,
}: CalendarNavHeaderProps) {
  const monthLabel = formatMonthYear(month);

  return (
    <div className="flex w-full items-center">
      <NavButton
        direction="previous"
        visible={showPrevious}
        onClick={onPrevious}
      />
      <h2 className="text-foreground flex-1 text-center text-lg font-bold">{monthLabel}</h2>
      <NavButton
        direction="next"
        visible={showNext}
        onClick={onNext}
        className={nextClassName}
      />
    </div>
  );
}

interface NavButtonProps {
  direction: "previous" | "next";
  visible: boolean;
  onClick: () => void;
  className?: string;
}

function NavButton({ direction, visible, onClick, className }: NavButtonProps) {
  if (!visible) {
    return <div className={cn("size-8", className)} />;
  }

  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Previous month" : "Next month";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={cn("text-foreground rounded-full transition-colors hover:bg-white/10", className)}
      aria-label={label}
    >
      <Icon className="size-5" />
    </Button>
  );
}
