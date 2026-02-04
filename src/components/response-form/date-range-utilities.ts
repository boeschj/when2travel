import { eachDayOfInterval, format, parseISO } from "date-fns";

import type { DateRange } from "@/lib/types";

const DATE_FORMAT = "yyyy-MM-dd";

export const formatDateString = (date: Date) => format(date, DATE_FORMAT);

export function expandRangeToDates(range: DateRange): string[] {
  const rangeStart = parseISO(range.start);
  const rangeEnd = parseISO(range.end);
  const datesInRange = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const dateStrings = datesInRange.map(d => formatDateString(d));
  return dateStrings;
}

export function addDateStringsToSet(
  dateStringSet: Set<string>,
  dateStrings: string[],
): Set<string> {
  const updatedSet = new Set(dateStringSet);
  for (const dateString of dateStrings) {
    updatedSet.add(dateString);
  }
  return updatedSet;
}

export function removeDateStringsFromSet(
  dateStringSet: Set<string>,
  dateStrings: string[],
): Set<string> {
  const updatedSet = new Set(dateStringSet);
  for (const dateString of dateStrings) {
    updatedSet.delete(dateString);
  }
  return updatedSet;
}

export function countCompatibleWindows(ranges: DateRange[], minDays: number): number {
  const rangesLongEnough = ranges.filter(range => {
    const isLongEnough = range.days >= minDays;
    return isLongEnough;
  });

  const totalWindows = rangesLongEnough.reduce((windowCount, range) => {
    const windowsInRange = range.days - minDays + 1;
    return windowCount + windowsInRange;
  }, 0);

  return totalWindows;
}
