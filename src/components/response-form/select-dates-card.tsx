import type { ReactNode } from "react";

import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AvailabilityActions } from "./availability-actions";
import { AvailabilityCalendar } from "./availability-calendar";
import { useDateInteractionActions, useDateInteractionValue } from "./date-interaction-context";

export function SelectDatesCard() {
  const { startRange, endRange, selectedDatesSet, compatibleWindowsCount, rangeStart } =
    useDateInteractionValue();
  const { handleDateClick } = useDateInteractionActions();

  const selectedDates = [...selectedDatesSet];
  const hasSelectedDates = selectedDates.length > 0;

  return (
    <Card className="w-full items-center p-4 md:w-fit">
      <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <SectionHeader>Set your availability</SectionHeader>
            {hasSelectedDates && <CompatibleWindowsBadge count={compatibleWindowsCount} />}
          </div>
          <SectionSubheader>Tap once to start a range, tap again to complete it.</SectionSubheader>
        </div>
        <AvailabilityActions />
      </div>
      <Separator className="mb-4" />
      <AvailabilityCalendar
        startRange={startRange}
        endRange={endRange}
        selectedDates={selectedDates}
        rangeStart={rangeStart}
        onDateClick={handleDateClick}
        numberOfMonths={2}
      />
    </Card>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return <h3 className="text-foreground text-lg font-bold">{children}</h3>;
}

function SectionSubheader({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground mt-1 text-sm">{children}</p>;
}

interface CompatibleWindowsBadgeProps {
  count: number;
}

function CompatibleWindowsBadge({ count }: CompatibleWindowsBadgeProps) {
  const isZeroCompatible = count === 0;
  const windowLabel = pluralize(count, "window");

  let badgeVariantClassName = "bg-primary text-primary-foreground";
  if (isZeroCompatible) {
    badgeVariantClassName = "bg-destructive text-destructive-foreground";
  }

  return (
    <Badge className={badgeVariantClassName}>
      {count} compatible {windowLabel}
    </Badge>
  );
}
