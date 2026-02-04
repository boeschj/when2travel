import { createContext, useContext } from "react";

export interface AvailabilityData {
  date: string;
  availableCount: number;
  totalCount: number;
  respondentIds: string[];
}

interface CalendarContextValue {
  availabilityMap?: Map<string, AvailabilityData>;
  selectedDates?: Set<string>;
  rangeStart?: Date | null;
  selectedRespondentId?: string | null;
  selectedRespondentColor?: string | null;
  onDateClick?: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextValue>({});

export const CalendarProvider = CalendarContext.Provider;

export function useCalendarContext() {
  return useContext(CalendarContext);
}
