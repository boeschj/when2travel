import { useState, useMemo, useCallback } from 'react'
import { eachDayOfInterval, parseISO, format, isWithinInterval } from 'date-fns'
import { groupDatesIntoRanges } from '@/lib/utils'

import type { DateRange } from '@/lib/types'

const DATE_FORMAT = 'yyyy-MM-dd'

const formatDateString = (date: Date) => format(date, DATE_FORMAT)

const DATE_STATUS = {
  available: 'available',
  unavailable: 'unavailable',
} as const

type DateStatus = typeof DATE_STATUS[keyof typeof DATE_STATUS]

interface UseDateInteractionProps {
  startRange: string
  endRange: string
  numDays: number
  selectedDates: string[]
  onDatesChange: (dates: string[]) => void
}

export function useDateInteraction({
  startRange,
  endRange,
  numDays,
  selectedDates,
  onDatesChange,
}: UseDateInteractionProps) {
  const allTripDates = useMemo(() => {
    const start = parseISO(startRange)
    const end = parseISO(endRange)
    const datesInInterval = eachDayOfInterval({ start, end })
    const dateStrings = datesInInterval.map(formatDateString)
    return dateStrings
  }, [startRange, endRange])

  const dateRangeStart = parseISO(startRange)
  const dateRangeEnd = parseISO(endRange)
  const dateRange = { start: dateRangeStart, end: dateRangeEnd }

  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates])

  const {
    rangeStart,
    toggleDateSelection,
    markAllAs,
  } = useDateRangeSelection({ dateRange, allTripDates, selectedDatesSet, onDatesChange })

  const unavailableDates = allTripDates.filter((date) => !selectedDatesSet.has(date))

  const availableRanges = groupDatesIntoRanges(selectedDates, DATE_STATUS.available)
  const unavailableRanges = groupDatesIntoRanges(unavailableDates, DATE_STATUS.unavailable)
  const compatibleWindowsCount = countCompatibleWindows(availableRanges, numDays)

  const {
    selectedRangeIds,
    hasSelectedRanges,
    toggleRangeSelection,
    deleteSelectedRanges,
  } = useRangeSelection({
    availableRanges,
    unavailableRanges,
    selectedDatesSet,
    onDatesChange,
  })

  return {
    selectedDatesSet,
    selectedRangeIds,
    rangeStart,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    handleDateClick: toggleDateSelection,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
  }
}

interface UseDateRangeSelectionProps {
  dateRange: { start: Date; end: Date }
  allTripDates: string[]
  selectedDatesSet: Set<string>
  onDatesChange: (dates: string[]) => void
}

function useDateRangeSelection({ dateRange, allTripDates, selectedDatesSet, onDatesChange }: UseDateRangeSelectionProps) {
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

interface UseRangeSelectionProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  selectedDatesSet: Set<string>
  onDatesChange: (dates: string[]) => void
}

function useRangeSelection({
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

function expandRangeToDates(range: DateRange): string[] {
  const rangeStart = parseISO(range.start)
  const rangeEnd = parseISO(range.end)
  const datesInRange = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
  const dateStrings = datesInRange.map(formatDateString)
  return dateStrings
}

function addDateStringsToSet(dateStringSet: Set<string>, dateStrings: string[]): Set<string> {
  const updatedSet = new Set(dateStringSet)
  for (const dateString of dateStrings) {
    updatedSet.add(dateString)
  }
  return updatedSet
}

function removeDateStringsFromSet(dateStringSet: Set<string>, dateStrings: string[]): Set<string> {
  const updatedSet = new Set(dateStringSet)
  for (const dateString of dateStrings) {
    updatedSet.delete(dateString)
  }
  return updatedSet
}

function countCompatibleWindows(ranges: DateRange[], minDays: number): number {
  const rangesLongEnough = ranges.filter((range) => {
    const isLongEnough = range.days >= minDays
    return isLongEnough
  })

  const totalWindows = rangesLongEnough.reduce((windowCount, range) => {
    const windowsInRange = range.days - minDays + 1
    return windowCount + windowsInRange
  }, 0)

  return totalWindows
}

export { DATE_STATUS }
export type { DateStatus }
