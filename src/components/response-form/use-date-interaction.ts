import { useMemo } from "react";
import { eachDayOfInterval, parseISO } from "date-fns";

import { groupDatesIntoRanges } from "@/lib/utils";

import { countCompatibleWindows, formatDateString } from "./date-range-utilities";
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
    const start = parseISO(startRange);
    const end = parseISO(endRange);
    const datesInInterval = eachDayOfInterval({ start, end });
    const dateStrings = datesInInterval.map(d => formatDateString(d));
    return dateStrings;
  }, [startRange, endRange]);

  const dateRangeStart = parseISO(startRange);
  const dateRangeEnd = parseISO(endRange);
  const dateRange = { start: dateRangeStart, end: dateRangeEnd };

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const { rangeStart, toggleDateSelection, markAllAs } = useDateRangeSelection({
    dateRange,
    allTripDates,
    selectedDatesSet,
    onDatesChange,
  });

  const unavailableDates = allTripDates.filter(date => !selectedDatesSet.has(date));

  const availableRanges = groupDatesIntoRanges(selectedDates, DATE_STATUS.available);
  const unavailableRanges = groupDatesIntoRanges(unavailableDates, DATE_STATUS.unavailable);
  const compatibleWindowsCount = countCompatibleWindows(availableRanges, numDays);

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
