import { useMemo } from "react";
import { addMonths, eachDayOfInterval, format } from "date-fns";

import { DATE_FORMATS } from "@/lib/date/constants";
import { parseAPIDate, toISODateString } from "@/lib/date/types";
import type { PlanResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarProvider, type AvailabilityData } from "@/components/calendar/calendar-context";
import { CalendarNavHeader } from "@/components/calendar/calendar-nav-header";
import { HeatmapDayButton } from "@/components/calendar/heatmap-day-button";
import { useMonthNavigation } from "@/components/calendar/use-month-navigation";
import { Calendar } from "@/components/ui/calendar";

import { useResultsActions, useResultsValue } from "./results-context";

interface ResultsCalendarProps {
  showNavigation?: boolean;
  className?: string;
  numberOfMonths?: 1 | 2;
}

interface MonthPanelProps {
  month: Date;
  dateRange: { start: Date; end: Date };
  isFirst: boolean;
  isLast: boolean;
  isSingleVisible: boolean;
  showNavigation: boolean;
  showDivider: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onMonthChange: (month: Date) => void;
}

export function ResultsCalendar({
  showNavigation = true,
  className,
  numberOfMonths = 2,
}: ResultsCalendarProps) {
  const { plan, selectedRespondentId, respondentColorMap } = useResultsValue();
  const { onDateClick } = useResultsActions();

  const {
    month: currentMonth,
    setMonth: setCurrentMonth,
    goToPrevious,
    goToNext,
  } = useMonthNavigation(parseAPIDate(plan.startRange));

  const dateRange = useMemo(
    () => ({
      start: parseAPIDate(plan.startRange),
      end: parseAPIDate(plan.endRange),
    }),
    [plan.startRange, plan.endRange],
  );

  const responses = useMemo(() => plan.responses ?? [], [plan.responses]);

  const availabilityMap = useMemo(() => {
    const map = buildAvailabilityMap(dateRange, responses);
    return map;
  }, [dateRange, responses]);

  const months = useMemo(() => {
    const result = [currentMonth];
    if (numberOfMonths === 2) {
      result.push(addMonths(currentMonth, 1));
    }
    return result;
  }, [currentMonth, numberOfMonths]);

  const heatmapContext = useMemo(
    () => ({
      availabilityMap,
      selectedRespondentId,
      respondentColorMap,
      onDateClick,
    }),
    [availabilityMap, selectedRespondentId, respondentColorMap, onDateClick],
  );

  const hasMultipleMonths = numberOfMonths > 1;

  return (
    <CalendarProvider value={heatmapContext}>
      <div className={cn("flex flex-wrap justify-center gap-4 md:gap-0", className)}>
        {months.map((month, index) => {
          const isFirst = index === 0;
          const isLast = index === months.length - 1;

          return (
            <MonthPanel
              key={format(month, DATE_FORMATS.ISO_MONTH)}
              month={month}
              dateRange={dateRange}
              isFirst={isFirst}
              isLast={isLast}
              isSingleVisible={isFirst && hasMultipleMonths}
              showNavigation={showNavigation}
              showDivider={isFirst && hasMultipleMonths}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onMonthChange={setCurrentMonth}
            />
          );
        })}
      </div>
    </CalendarProvider>
  );
}

function MonthPanel({
  month,
  dateRange,
  isFirst,
  isLast,
  isSingleVisible,
  showNavigation,
  showDivider,
  onPrevious,
  onNext,
  onMonthChange,
}: MonthPanelProps) {
  const showNextButton = showNavigation && (isLast || isSingleVisible);
  const nextButtonHiddenOnDesktop = isSingleVisible && !isLast;

  return (
    <div className="flex">
      <div className={cn("flex flex-col gap-4", !isFirst && "hidden md:flex")}>
        <CalendarNavHeader
          month={month}
          onPrevious={onPrevious}
          onNext={onNext}
          showPrevious={showNavigation && isFirst}
          showNext={showNextButton}
          nextClassName={nextButtonHiddenOnDesktop ? "md:invisible" : undefined}
        />

        <Calendar
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          showOutsideDays
          fixedWeeks
          weekStartsOn={1}
          disabled={[{ before: dateRange.start }, { after: dateRange.end }]}
          className="bg-transparent p-0 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          classNames={{
            nav: "hidden",
            month_caption: "hidden",
          }}
          components={{
            DayButton: HeatmapDayButton,
          }}
        />
      </div>
      {showDivider && <div className="bg-border mx-6 hidden w-px self-stretch md:block" />}
    </div>
  );
}

function buildAvailabilityMap(
  dateRange: { start: Date; end: Date },
  responses: Pick<PlanResponse, "id" | "name" | "availableDates">[],
): Map<string, AvailabilityData> {
  const map = new Map<string, AvailabilityData>();

  const allDates = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  for (const date of allDates) {
    const dateStr = toISODateString(date);
    map.set(dateStr, {
      date: dateStr,
      availableCount: 0,
      totalCount: responses.length,
      respondentIds: [],
    });
  }

  for (const response of responses) {
    for (const dateStr of response.availableDates) {
      const data = map.get(dateStr);
      if (data) {
        data.availableCount += 1;
        data.respondentIds.push(response.id);
      }
    }
  }

  return map;
}
