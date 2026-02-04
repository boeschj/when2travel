import { clsx, type ClassValue } from "clsx";
import { differenceInDays, format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import type { DateRange } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
}

export function groupDatesIntoRanges(dates: string[], status: DateRange["status"]): DateRange[] {
  const firstDate = dates[0];
  if (!firstDate) return [];

  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));
  const ranges: DateRange[] = [];

  const initialDate = sortedDates[0];
  if (!initialDate) return [];

  let rangeStart = initialDate;
  let rangeEnd = initialDate;

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDateStr = sortedDates[i];
    const previousDateStr = sortedDates[i - 1];
    if (!currentDateStr || !previousDateStr) continue;

    const currentDate = parseISO(currentDateStr);
    const previousDate = parseISO(previousDateStr);
    const isConsecutiveDay = differenceInDays(currentDate, previousDate) === 1;

    if (isConsecutiveDay) {
      rangeEnd = currentDateStr;
    } else {
      ranges.push(buildDateRange(rangeStart, rangeEnd, status));
      rangeStart = currentDateStr;
      rangeEnd = currentDateStr;
    }
  }

  ranges.push(buildDateRange(rangeStart, rangeEnd, status));

  return ranges;
}

export function formatDateRangeDisplay(range: DateRange): string {
  const startDate = parseISO(range.start);
  const endDate = parseISO(range.end);

  if (range.start === range.end) {
    return format(startDate, "MMM d");
  }

  const isSameMonth = startDate.getMonth() === endDate.getMonth();

  if (isSameMonth) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d")}`;
  }

  return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;
}

const DEFAULT_COLOR = { h: 195, s: 75, l: 55 } as const;

export function generateColorFromString(str: string): { hsl: string; hex: string } {
  const hash = computeStringHash(str);
  const paletteIndex = hash % AVATAR_PALETTE.length;
  const paletteEntry = AVATAR_PALETTE[paletteIndex] ?? DEFAULT_COLOR;
  const { h: hue, s: saturation, l: lightness } = paletteEntry;

  const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const hex = convertHslToHex(hue, saturation, lightness);

  return { hsl, hex };
}

// --- Helpers ---

function buildDateRange(start: string, end: string, status: DateRange["status"]): DateRange {
  const days = differenceInDays(parseISO(end), parseISO(start)) + 1;
  return {
    id: `${status}-${start}`,
    start,
    end,
    days,
    status,
  };
}

function computeStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.codePointAt(i) ?? 0;
    hash = (hash << 5) - hash + charCode;
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
}

function convertHslToHex(hue: number, saturation: number, lightness: number): string {
  const normalizedHue = hue / 360;
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;

  const chroma =
    normalizedLightness < 0.5
      ? normalizedLightness * (1 + normalizedSaturation)
      : normalizedLightness + normalizedSaturation - normalizedLightness * normalizedSaturation;
  const base = 2 * normalizedLightness - chroma;

  const red = Math.round(interpolateHueChannel(base, chroma, normalizedHue + 1 / 3) * 255);
  const green = Math.round(interpolateHueChannel(base, chroma, normalizedHue) * 255);
  const blue = Math.round(interpolateHueChannel(base, chroma, normalizedHue - 1 / 3) * 255);

  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function interpolateHueChannel(base: number, chroma: number, hueOffset: number): number {
  let normalizedOffset = hueOffset;
  if (normalizedOffset < 0) normalizedOffset += 1;
  if (normalizedOffset > 1) normalizedOffset -= 1;

  if (normalizedOffset < 1 / 6) return base + (chroma - base) * 6 * normalizedOffset;
  if (normalizedOffset < 1 / 2) return chroma;
  if (normalizedOffset < 2 / 3) return base + (chroma - base) * (2 / 3 - normalizedOffset) * 6;
  return base;
}

function toHexByte(value: number): string {
  return value.toString(16).padStart(2, "0");
}

const AVATAR_PALETTE = [
  { h: 195, s: 75, l: 55 },
  { h: 260, s: 65, l: 60 },
  { h: 320, s: 70, l: 58 },
  { h: 210, s: 70, l: 55 },
  { h: 285, s: 60, l: 58 },
  { h: 340, s: 65, l: 60 },
  { h: 180, s: 60, l: 50 },
  { h: 235, s: 65, l: 62 },
  { h: 300, s: 55, l: 60 },
  { h: 170, s: 55, l: 48 },
  { h: 245, s: 70, l: 65 },
  { h: 330, s: 60, l: 55 },
] as const;
