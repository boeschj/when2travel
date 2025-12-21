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

/**
 * Simple string hash function for consistent color generation
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Generates a consistent HSL color from a string.
 * Avoids hues that conflict with calendar heatmap colors:
 * - Red (0-30): used for low availability
 * - Yellow/Orange (30-70): used for partial availability
 * - Green (70-160): used for full availability (primary brand color)
 *
 * Safe range: 170-350 (cyan, blue, purple, magenta, pink)
 */
export function generateColorFromString(str: string): { hsl: string; hex: string } {
  const hash = hashString(str)

  // Use only safe hue range: 170-350 (180 degrees of options)
  // This avoids red, orange, yellow, and green
  const hue = 170 + (hash % 180)

  // Fixed saturation and lightness for consistency
  const saturation = 65 + (hash % 20) // 65-85%
  const lightness = 55 + (hash % 15) // 55-70%

  const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  // Convert to hex for inline styles
  const h = hue / 360
  const s = saturation / 100
  const l = lightness / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
  const g = Math.round(hue2rgb(p, q, h) * 255)
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)

  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  return { hsl, hex }
}
