import { format } from "date-fns";

import { DATE_FORMATS } from "./constants";
import type { ISODateString } from "./types";
import { parseISODate } from "./types";

export function formatDateShort(iso: ISODateString): string {
  const date = parseISODate(iso);
  const formatted = format(date, DATE_FORMATS.DISPLAY_SHORT);
  return formatted;
}

export function formatDateFull(iso: ISODateString): string {
  const date = parseISODate(iso);
  const formatted = format(date, DATE_FORMATS.DISPLAY_FULL);
  return formatted;
}

export function formatDateLong(date: Date): string {
  const formatted = format(date, DATE_FORMATS.DISPLAY_LONG);
  return formatted;
}

export function formatMonthYear(date: Date): string {
  const formatted = format(date, DATE_FORMATS.DISPLAY_MONTH_YEAR);
  return formatted;
}

export function formatRangeDisplay(
  start: ISODateString,
  end: ISODateString,
  separator = " - ",
): string {
  if (start === end) {
    const singleDateFormatted = formatDateShort(start);
    return singleDateFormatted;
  }

  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  const startMonth = format(startDate, DATE_FORMATS.DISPLAY_MONTH);
  const endMonth = format(endDate, DATE_FORMATS.DISPLAY_MONTH);

  if (startMonth === endMonth) {
    const formattedStart = formatDateShort(start);
    const formattedEndDay = format(endDate, DATE_FORMATS.DISPLAY_DAY);
    const sameMonthRange = `${formattedStart}${separator}${formattedEndDay}`;
    return sameMonthRange;
  }

  const formattedStart = formatDateShort(start);
  const formattedEnd = formatDateShort(end);
  const fullRange = `${formattedStart}${separator}${formattedEnd}`;
  return fullRange;
}
