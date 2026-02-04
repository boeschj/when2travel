import { useState, useCallback } from 'react'
import { eachDayOfInterval, isWithinInterval } from 'date-fns'
import { formatDateString, addDateStringsToSet } from './date-range-utilities'

const DATE_STATUS = {
  available: 'available',
  unavailable: 'unavailable',
} as const

type DateStatus = typeof DATE_STATUS[keyof typeof DATE_STATUS]

interface UseDateRangeSelectionProps {
  dateRange: { start: Date; end: Date }
  allTripDates: string[]
  selectedDatesSet: Set<string>
  onDatesChange: (dates: string[]) => void
}

export function useDateRangeSelection({ dateRange, allTripDates, selectedDatesSet, onDatesChange }: UseDateRangeSelectionProps) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  const resetRangeStart = () => setRangeStart(null)

  const toggleDateSelection = useCallback((date: Date) => {
    if (!isWithinInterval(date, dateRange)) return

    const dateStr = formatDateString(date)
    const isClickingRangeStart = rangeStart !== null && formatDateString(rangeStart) === dateStr

    if (isClickingRangeStart) {
      resetRangeStart()
      return
    }

    if (selectedDatesSet.has(dateStr)) {
      const updatedDateStringSet = new Set(selectedDatesSet)
      updatedDateStringSet.delete(dateStr)
      const updatedDateStrings = Array.from(updatedDateStringSet)
      onDatesChange(updatedDateStrings)
      resetRangeStart()
      return
    }

    const isStartingNewRange = rangeStart === null

    if (isStartingNewRange) {
      setRangeStart(date)
      const withNewDate = addDateStringsToSet(selectedDatesSet, [dateStr])
      const updatedDateStrings = Array.from(withNewDate)
      onDatesChange(updatedDateStrings)
      return
    }

    let rangeStartDate: Date
    let rangeEndDate: Date
    if (rangeStart < date) {
      rangeStartDate = rangeStart
      rangeEndDate = date
    } else {
      rangeStartDate = date
      rangeEndDate = rangeStart
    }

    const datesInRange = eachDayOfInterval({ start: rangeStartDate, end: rangeEndDate })
    const rangeDateStrings = datesInRange.map(formatDateString)
    const withRangeDates = addDateStringsToSet(selectedDatesSet, rangeDateStrings)
    const updatedDateStrings = Array.from(withRangeDates)
    onDatesChange(updatedDateStrings)
    resetRangeStart()
  }, [rangeStart, dateRange, selectedDatesSet, onDatesChange])

  const markAllAs = useCallback((status: DateStatus) => {
    resetRangeStart()
    if (status === DATE_STATUS.available) {
      onDatesChange(allTripDates)
    } else {
      onDatesChange([])
    }
  }, [allTripDates, onDatesChange])

  return { rangeStart, toggleDateSelection, markAllAs }
}

export { DATE_STATUS }
export type { DateStatus }
