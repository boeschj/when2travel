import { ArrowRight, Save } from "lucide-react";
import { motion } from "motion/react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PlanSummaryCardProps {
  numDays: number;
  dateRange: DateRange | undefined;
  isPending: boolean;
  isEditMode?: boolean;
  planId?: string;
  hasChanges?: boolean;
}

export function PlanSummaryCard({
  numDays,
  dateRange,
  isPending,
  isEditMode = false,
  planId,
  hasChanges = false,
}: PlanSummaryCardProps) {
  const hasDateRange = Boolean(dateRange?.from) && Boolean(dateRange?.to);
  const formattedDateRange = formatDateRange(dateRange);
  const isEditing = isEditMode && Boolean(planId);

  return (
    <Card
      variant="action"
      className="p-6"
    >
      <CardContent className="flex flex-col gap-4 p-0">
        <SummaryText
          numDays={numDays}
          hasDateRange={hasDateRange}
          formattedDateRange={formattedDateRange}
        />
      </CardContent>
      <CardFooter className="mt-4 p-0">
        <FooterAction
          isEditing={isEditing}
          isPending={isPending}
          hasChanges={hasChanges}
        />
      </CardFooter>
    </Card>
  );
}

function SummaryText({
  numDays,
  hasDateRange,
  formattedDateRange,
}: {
  numDays: number;
  hasDateRange: boolean;
  formattedDateRange: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-primary mb-1 text-xs font-bold tracking-wider uppercase">Summary</p>
        <p className="text-foreground leading-snug font-medium">
          Planning a{" "}
          <span className="text-foreground font-bold whitespace-nowrap">{numDays} day</span> trip
          <DateRangeLabel
            hasDateRange={hasDateRange}
            formattedDateRange={formattedDateRange}
          />
        </p>
      </div>
    </div>
  );
}

function DateRangeLabel({
  hasDateRange,
  formattedDateRange,
}: {
  hasDateRange: boolean;
  formattedDateRange: string;
}) {
  if (!hasDateRange) {
    return (
      <span className="invisible">
        {" "}
        between <span className="font-bold whitespace-nowrap">Jan 1 - Jan 31</span>
      </span>
    );
  }

  return (
    <>
      {" "}
      between{" "}
      <span className="text-foreground font-bold whitespace-nowrap">{formattedDateRange}.</span>
    </>
  );
}

function SaveChangesButton({ isPending, hasChanges }: { isPending: boolean; hasChanges: boolean }) {
  const isDisabled = isPending || !hasChanges;
  const hoverAnimation = isDisabled ? {} : { scale: 1.02 };
  const tapAnimation = isDisabled ? {} : { scale: 0.98 };
  const showTooltip = !hasChanges && !isPending;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="w-full"
          whileHover={hoverAnimation}
          whileTap={tapAnimation}
        >
          <Button
            type="submit"
            disabled={isDisabled}
            size="cta"
          >
            <SaveChangesIcon isPending={isPending} />
            Save Changes
          </Button>
        </motion.div>
      </TooltipTrigger>
      {showTooltip && (
        <TooltipContent>
          <p>No new changes to save</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function CreatePlanButton({ isPending }: { isPending: boolean }) {
  const hoverAnimation = isPending ? {} : { scale: 1.02 };
  const tapAnimation = isPending ? {} : { scale: 0.98 };

  if (isPending) {
    return (
      <motion.div className="w-full">
        <Button
          type="submit"
          disabled
          size="cta"
        >
          Creating Plan...
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
    >
      <Button
        type="submit"
        size="cta"
      >
        Next: Invite Friends
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
}

function FooterAction({
  isEditing,
  isPending,
  hasChanges,
}: {
  isEditing: boolean;
  isPending: boolean;
  hasChanges: boolean;
}) {
  if (isEditing) {
    return (
      <SaveChangesButton
        isPending={isPending}
        hasChanges={hasChanges}
      />
    );
  }
  return <CreatePlanButton isPending={isPending} />;
}

function SaveChangesIcon({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return <Spinner className="mr-2 h-5 w-5" />;
  }
  return <Save className="mr-2 h-5 w-5" />;
}

function formatDateRange(dateRange: DateRange | undefined): string {
  if (!dateRange?.from || !dateRange.to) return "";
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const from = dateRange.from.toLocaleDateString("en-US", options);
  const to = dateRange.to.toLocaleDateString("en-US", options);
  return `${from} - ${to}`;
}
