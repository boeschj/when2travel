import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { formatRangeDisplay } from "./date/formatter";
import { getRangeDays, groupConsecutiveDates } from "./date/range";
import { assertISODateString } from "./date/types";
import type { DateRange } from "./types";

export function cn(...inputs: ClassValue[]) {
  const merged = twMerge(clsx(inputs));
  return merged;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  const pluralForm = plural ?? `${singular}s`;
  return pluralForm;
}

interface GroupDatesIntoRangesArgs {
  dates: string[];
  status: DateRange["status"];
}

export function groupDatesIntoRanges({ dates, status }: GroupDatesIntoRangesArgs): DateRange[] {
  if (dates.length === 0) return [];

  const isoDateStrings = dates.map(element => assertISODateString(element));
  const consecutiveRanges = groupConsecutiveDates(isoDateStrings);

  const dateRanges = consecutiveRanges.map(range => ({
    id: `${status}-${range.start}`,
    start: range.start,
    end: range.end,
    days: getRangeDays(range),
    status,
  }));
  return dateRanges;
}

export function formatDateRangeDisplay(range: DateRange): string {
  const display = formatRangeDisplay(range.start, range.end);
  return display;
}

export interface AvatarColor {
  hsl: string;
  hex: string;
}

const GOLDEN_ANGLE = 137.508;
const AVATAR_SATURATION = 65;
const AVATAR_LIGHTNESS = 55;

export function getColorByIndex(index: number): AvatarColor {
  const hue = (index * GOLDEN_ANGLE) % 360;

  const hsl = `hsl(${Math.round(hue)}, ${AVATAR_SATURATION}%, ${AVATAR_LIGHTNESS}%)`;
  const hex = convertHslToHex({ hue, saturation: AVATAR_SATURATION, lightness: AVATAR_LIGHTNESS });

  return { hsl, hex };
}

export function buildColorMap(ids: string[]): Record<string, AvatarColor> {
  const entries = ids.map((id, index) => [id, getColorByIndex(index)] as const);
  const colorMap = Object.fromEntries(entries);
  return colorMap;
}

interface HslArgs {
  hue: number;
  saturation: number;
  lightness: number;
}

function convertHslToHex({ hue, saturation, lightness }: HslArgs): string {
  const normalizedHue = hue / 360;
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;

  const chroma =
    normalizedLightness < 0.5
      ? normalizedLightness * (1 + normalizedSaturation)
      : normalizedLightness + normalizedSaturation - normalizedLightness * normalizedSaturation;
  const base = 2 * normalizedLightness - chroma;

  const red = Math.round(
    interpolateHueChannel({ base, chroma, hueOffset: normalizedHue + 1 / 3 }) * 255,
  );
  const green = Math.round(interpolateHueChannel({ base, chroma, hueOffset: normalizedHue }) * 255);
  const blue = Math.round(
    interpolateHueChannel({ base, chroma, hueOffset: normalizedHue - 1 / 3 }) * 255,
  );

  const hexString = `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
  return hexString;
}

interface InterpolateHueChannelArgs {
  base: number;
  chroma: number;
  hueOffset: number;
}

function interpolateHueChannel({ base, chroma, hueOffset }: InterpolateHueChannelArgs): number {
  let normalizedOffset = hueOffset;
  if (normalizedOffset < 0) normalizedOffset += 1;
  if (normalizedOffset > 1) normalizedOffset -= 1;

  if (normalizedOffset < 1 / 6) {
    const interpolated = base + (chroma - base) * 6 * normalizedOffset;
    return interpolated;
  }
  if (normalizedOffset < 1 / 2) return chroma;
  if (normalizedOffset < 2 / 3) {
    const interpolated = base + (chroma - base) * (2 / 3 - normalizedOffset) * 6;
    return interpolated;
  }
  return base;
}

function toHexByte(value: number): string {
  const hex = value.toString(16).padStart(2, "0");
  return hex;
}
