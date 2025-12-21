import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format, parseISO } from "date-fns"
import type { DateRange } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Groups an array of date strings into contiguous date ranges.
 */
export function groupDatesIntoRanges(
  dates: string[],
  status: DateRange['status']
): DateRange[] {
  if (dates.length === 0) return []

  const sortedDates = [...dates].sort()
  const ranges: DateRange[] = []
  let rangeStart = sortedDates[0]
  let rangeEnd = sortedDates[0]

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = parseISO(sortedDates[i])
    const prevDate = parseISO(sortedDates[i - 1])
    const daysDiff = differenceInDays(currentDate, prevDate)

    if (daysDiff === 1) {
      rangeEnd = sortedDates[i]
    } else {
      const days = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1
      ranges.push({
        id: `${status}-${rangeStart}`,
        start: rangeStart,
        end: rangeEnd,
        days,
        status
      })
      rangeStart = sortedDates[i]
      rangeEnd = sortedDates[i]
    }
  }

  const days = differenceInDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1
  ranges.push({
    id: `${status}-${rangeStart}`,
    start: rangeStart,
    end: rangeEnd,
    days,
    status
  })

  return ranges
}

/**
 * Formats a DateRange for display (e.g., "Jan 1 - 5" or "Jan 1 - Feb 3").
 */
export function formatDateRangeDisplay(range: DateRange): string {
  const startDate = parseISO(range.start)
  const endDate = parseISO(range.end)

  if (range.start === range.end) {
    return format(startDate, 'MMM d')
  }

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`
  }

  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
}
