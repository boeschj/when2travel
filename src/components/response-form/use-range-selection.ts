import { useCallback, useState } from "react";

import { expandRange } from "@/lib/date/range";
import type { DateRange } from "@/lib/types";

interface UseRangeSelectionProps {
  availableRanges: DateRange[];
  unavailableRanges: DateRange[];
  selectedDatesSet: Set<string>;
  onDatesChange: (dates: string[]) => void;
}

export function useRangeSelection({
  availableRanges,
  unavailableRanges,
  selectedDatesSet,
  onDatesChange,
}: UseRangeSelectionProps) {
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set());

  const totalRangeCount = availableRanges.length + unavailableRanges.length;
  const isSingleFullRange = totalRangeCount === 1 && selectedRangeIds.size === 1;
  const hasSelectedRanges = selectedRangeIds.size > 0 && !isSingleFullRange;

  const toggleRangeSelection = useCallback((rangeId: string) => {
    setSelectedRangeIds(prev => {
      const updatedRangeIds = new Set(prev);
      if (updatedRangeIds.has(rangeId)) {
        updatedRangeIds.delete(rangeId);
      } else {
        updatedRangeIds.add(rangeId);
      }
      return updatedRangeIds;
    });
  }, []);

  const deleteSelectedRanges = useCallback(() => {
    const allRangesSelected = selectedRangeIds.size === totalRangeCount;

    if (allRangesSelected) {
      const emptyDates: string[] = [];
      const emptyRangeIds = new Set<string>();
      onDatesChange(emptyDates);
      setSelectedRangeIds(emptyRangeIds);
      return;
    }

    let updatedDateStringSet = new Set(selectedDatesSet);

    for (const rangeId of selectedRangeIds) {
      const availableRange = availableRanges.find(r => r.id === rangeId);
      if (availableRange) {
        const rangeDateStrings = expandRange(availableRange);
        updatedDateStringSet = removeDateStringsFromSet({
          dateStringSet: updatedDateStringSet,
          dateStrings: rangeDateStrings,
        });
      }

      const unavailableRange = unavailableRanges.find(r => r.id === rangeId);
      if (unavailableRange) {
        const rangeDateStrings = expandRange(unavailableRange);
        updatedDateStringSet = addDateStringsToSet({
          dateStringSet: updatedDateStringSet,
          dateStrings: rangeDateStrings,
        });
      }
    }

    const updatedDateStrings = [...updatedDateStringSet];
    const emptyRangeIds = new Set<string>();
    onDatesChange(updatedDateStrings);
    setSelectedRangeIds(emptyRangeIds);
  }, [
    selectedRangeIds,
    totalRangeCount,
    availableRanges,
    unavailableRanges,
    selectedDatesSet,
    onDatesChange,
  ]);

  return { selectedRangeIds, hasSelectedRanges, toggleRangeSelection, deleteSelectedRanges };
}

interface DateStringSetArgs {
  dateStringSet: Set<string>;
  dateStrings: string[];
}

function addDateStringsToSet({ dateStringSet, dateStrings }: DateStringSetArgs): Set<string> {
  const updatedSet = new Set(dateStringSet);
  for (const dateString of dateStrings) {
    updatedSet.add(dateString);
  }
  return updatedSet;
}

function removeDateStringsFromSet({ dateStringSet, dateStrings }: DateStringSetArgs): Set<string> {
  const updatedSet = new Set(dateStringSet);
  for (const dateString of dateStrings) {
    updatedSet.delete(dateString);
  }
  return updatedSet;
}
