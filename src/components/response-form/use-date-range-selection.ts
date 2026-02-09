import { useCallback, useState } from "react";
import { eachDayOfInterval, isWithinInterval } from "date-fns";

import { toISODateString } from "@/lib/date/types";

const DATE_STATUS = {
  available: "available",
  unavailable: "unavailable",
} as const;

type DateStatus = (typeof DATE_STATUS)[keyof typeof DATE_STATUS];

interface UseDateRangeSelectionProps {
  dateRange: { start: Date; end: Date };
  allTripDates: string[];
  selectedDatesSet: Set<string>;
  onDatesChange: (dates: string[]) => void;
}

export function useDateRangeSelection({
  dateRange,
  allTripDates,
  selectedDatesSet,
  onDatesChange,
}: UseDateRangeSelectionProps) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);

  const resetRangeStart = () => setRangeStart(null);

  const toggleDateSelection = useCallback(
    (date: Date) => {
      const isOutOfBounds = !isWithinInterval(date, dateRange);
      if (isOutOfBounds) return;

      const dateStr = toISODateString(date);
      const rangeStartStr = rangeStart === null ? null : toISODateString(rangeStart);
      const isClickingRangeStart = rangeStartStr === dateStr;

      if (isClickingRangeStart) {
        resetRangeStart();
        return;
      }

      if (selectedDatesSet.has(dateStr)) {
        const updatedDateStringSet = new Set(selectedDatesSet);
        updatedDateStringSet.delete(dateStr);
        const updatedDateStrings = [...updatedDateStringSet];
        onDatesChange(updatedDateStrings);
        resetRangeStart();
        return;
      }

      const isStartingNewRange = rangeStart === null;

      if (isStartingNewRange) {
        setRangeStart(date);
        const withNewDate = addDateStringsToSet(selectedDatesSet, [dateStr]);
        const updatedDateStrings = [...withNewDate];
        onDatesChange(updatedDateStrings);
        return;
      }

      let rangeStartDate: Date;
      let rangeEndDate: Date;
      if (rangeStart < date) {
        rangeStartDate = rangeStart;
        rangeEndDate = date;
      } else {
        rangeStartDate = date;
        rangeEndDate = rangeStart;
      }

      const interval = { start: rangeStartDate, end: rangeEndDate };
      const datesInRange = eachDayOfInterval(interval);
      const rangeDateStrings = datesInRange.map(d => toISODateString(d));
      const withRangeDates = addDateStringsToSet(selectedDatesSet, rangeDateStrings);
      const updatedDateStrings = [...withRangeDates];
      onDatesChange(updatedDateStrings);
      resetRangeStart();
    },
    [rangeStart, dateRange, selectedDatesSet, onDatesChange],
  );

  const markAllAs = useCallback(
    (status: DateStatus) => {
      resetRangeStart();
      if (status === DATE_STATUS.available) {
        onDatesChange(allTripDates);
      } else {
        onDatesChange([]);
      }
    },
    [allTripDates, onDatesChange],
  );

  return { rangeStart, toggleDateSelection, markAllAs };
}

export { DATE_STATUS };
export type { DateStatus };

function addDateStringsToSet(dateStringSet: Set<string>, dateStrings: string[]): Set<string> {
  const updatedSet = new Set(dateStringSet);
  for (const dateString of dateStrings) {
    updatedSet.add(dateString);
  }
  return updatedSet;
}
