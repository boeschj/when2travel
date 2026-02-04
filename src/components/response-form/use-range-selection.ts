import { useState, useCallback } from 'react'
import {
  expandRangeToDates,
  addDateStringsToSet,
  removeDateStringsFromSet,
} from './date-range-utilities'

import type { DateRange } from '@/lib/types'

interface UseRangeSelectionProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedDatesSet: Set<string>
  onDatesChange: (dates: string[]) => void
}

export function useRangeSelection({
  availableRanges,
  unavailableRanges,
  selectedDatesSet,
  onDatesChange,
}: UseRangeSelectionProps) {
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set())

  const totalRangeCount = availableRanges.length + unavailableRanges.length
  const isSingleFullRange = totalRangeCount === 1 && selectedRangeIds.size === 1
  const hasSelectedRanges = selectedRangeIds.size > 0 && !isSingleFullRange

  const toggleRangeSelection = useCallback((rangeId: string) => {
    setSelectedRangeIds(prev => {
      const updatedRangeIds = new Set(prev)
      if (updatedRangeIds.has(rangeId)) {
        updatedRangeIds.delete(rangeId)
      } else {
        updatedRangeIds.add(rangeId)
      }
      return updatedRangeIds
    })
  }, [])

  const deleteSelectedRanges = useCallback(() => {
    const allRangesSelected = selectedRangeIds.size === totalRangeCount

    if (allRangesSelected) {
      onDatesChange([])
      setSelectedRangeIds(new Set())
      return
    }

    let updatedDateStringSet = new Set(selectedDatesSet)

    for (const rangeId of selectedRangeIds) {
      const availableRange = availableRanges.find(r => r.id === rangeId)
      if (availableRange) {
        const rangeDateStrings = expandRangeToDates(availableRange)
        updatedDateStringSet = removeDateStringsFromSet(updatedDateStringSet, rangeDateStrings)
      }

      const unavailableRange = unavailableRanges.find(r => r.id === rangeId)
      if (unavailableRange) {
        const rangeDateStrings = expandRangeToDates(unavailableRange)
        updatedDateStringSet = addDateStringsToSet(updatedDateStringSet, rangeDateStrings)
      }
    }

    const updatedDateStrings = Array.from(updatedDateStringSet)
    onDatesChange(updatedDateStrings)
    setSelectedRangeIds(new Set())
  }, [selectedRangeIds, totalRangeCount, availableRanges, unavailableRanges, selectedDatesSet, onDatesChange])

  return { selectedRangeIds, hasSelectedRanges, toggleRangeSelection, deleteSelectedRanges }
}
