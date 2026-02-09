export const DATE_FORMATS = {
  ISO: "yyyy-MM-dd",
  ISO_MONTH: "yyyy-MM",
  DISPLAY_SHORT: "MMM d",
  DISPLAY_LONG: "MMMM d",
  DISPLAY_FULL: "MMMM d, yyyy",
  DISPLAY_MONTH_YEAR: "MMMM yyyy",
  DISPLAY_MONTH: "MMM",
  DISPLAY_DAY: "d",
  GOOGLE_CALENDAR: "yyyyMMdd",
} as const;

export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];
