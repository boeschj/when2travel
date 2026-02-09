import { useMemo } from "react";

import { expandRange } from "@/lib/date/range";
import { assertISODateString, parseAPIDate } from "@/lib/date/types";
import type { DateRange } from "@/lib/types";
import { groupDatesIntoRanges } from "@/lib/utils";

import { DATE_STATUS, useDateRangeSelection } from "./use-date-range-selection";
import { useRangeSelection } from "./use-range-selection";

interface UseDateInteractionProps {
  startRange: string;
  endRange: string;
  numDays: number;
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

export function useDateInteraction({
  startRange,
  endRange,
  numDays,
  selectedDates,
  onDatesChange,
}: UseDateInteractionProps) {
  const allTripDates = useMemo(() => {
    const start = assertISODateString(startRange);
    const end = assertISODateString(endRange);
    const dateRange = { start, end };
    const expandedDates = expandRange(dateRange);
    return expandedDates;
  }, [startRange, endRange]);

  const dateRangeStart = parseAPIDate(startRange);
  const dateRangeEnd = parseAPIDate(endRange);
  const dateRange = { start: dateRangeStart, end: dateRangeEnd };

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const { rangeStart, toggleDateSelection, markAllAs } = useDateRangeSelection({
    dateRange,
    allTripDates,
    selectedDatesSet,
    onDatesChange,
  });

  const unavailableDates = allTripDates.filter(date => !selectedDatesSet.has(date));

  const availableRanges = groupDatesIntoRanges({
    dates: selectedDates,
    status: DATE_STATUS.available,
  });
  const unavailableRanges = groupDatesIntoRanges({
    dates: unavailableDates,
    status: DATE_STATUS.unavailable,
  });
  const compatibleWindowsCount = countCompatibleWindows({
    ranges: availableRanges,
    minDays: numDays,
  });

  const { selectedRangeIds, hasSelectedRanges, toggleRangeSelection, deleteSelectedRanges } =
    useRangeSelection({
      availableRanges,
      unavailableRanges,
      selectedDatesSet,
      onDatesChange,
    });

  return {
    selectedDatesSet,
    selectedRangeIds,
    rangeStart,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    handleDateClick: toggleDateSelection,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
  };
}

export { type DateStatus, DATE_STATUS } from "./use-date-range-selection";

interface CountCompatibleWindowsArgs {
  ranges: DateRange[];
  minDays: number;
}

function countCompatibleWindows({ ranges, minDays }: CountCompatibleWindowsArgs): number {
  const rangesLongEnough = ranges.filter(range => range.days >= minDays);

  const totalWindows = rangesLongEnough.reduce((windowCount, range) => {
    const windowsInRange = range.days - minDays + 1;
    const updatedCount = windowCount + windowsInRange;
    return updatedCount;
  }, 0);

  return totalWindows;
}
