import { differenceInDays, eachDayOfInterval } from "date-fns";

import type { ISODateString } from "./types";
import { parseISODate, toISODateString } from "./types";

export interface DateRangeInput {
  start: ISODateString;
  end: ISODateString;
}

export function expandRange(range: DateRangeInput): ISODateString[] {
  const interval = eachDayOfInterval({
    start: parseISODate(range.start),
    end: parseISODate(range.end),
  });
  const isoStrings = interval.map(element => toISODateString(element));
  return isoStrings;
}

export function getRangeDays(range: DateRangeInput): number {
  const startDate = parseISODate(range.start);
  const endDate = parseISODate(range.end);
  const difference = differenceInDays(endDate, startDate);
  const totalDays = difference + 1;
  return totalDays;
}

export function groupConsecutiveDates(dates: ISODateString[]): DateRangeInput[] {
  if (dates.length === 0) {
    return [];
  }

  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));

  const firstDate = sortedDates[0];
  if (!firstDate) {
    return [];
  }

  const ranges: DateRangeInput[] = [];
  let rangeStart = firstDate;
  let previousDate = firstDate;

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    if (!currentDate) continue;

    const previousParsed = parseISODate(previousDate);
    const currentParsed = parseISODate(currentDate);
    const daysDifference = differenceInDays(currentParsed, previousParsed);
    const isConsecutive = daysDifference === 1;

    if (!isConsecutive) {
      ranges.push({ start: rangeStart, end: previousDate });
      rangeStart = currentDate;
    }

    previousDate = currentDate;
  }

  ranges.push({ start: rangeStart, end: previousDate });

  return ranges;
}
