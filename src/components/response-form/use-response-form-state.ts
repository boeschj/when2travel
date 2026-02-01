import { useState, useMemo, useCallback } from 'react'
import { eachDayOfInterval, parseISO, format, isWithinInterval } from 'date-fns'
import { groupDatesIntoRanges } from '@/lib/utils'
import type { DateRange, ResponseFormData } from '@/lib/types'

const DATE_FORMAT = 'yyyy-MM-dd'

interface UseResponseFormStateProps {
  startRange: string
  endRange: string
  numDays: number
  initialName?: string
  initialDates?: string[]
}

export function useResponseFormState({
  startRange,
  endRange,
  numDays,
  initialName = '',
  initialDates = []
}: UseResponseFormStateProps) {
  const [name, setName] = useState(initialName)

  const dateRange = useMemo(() => ({
    start: parseISO(startRange),
    end: parseISO(endRange)
  }), [startRange, endRange])

  const allTripDates = useMemo(() => {
    return eachDayOfInterval(dateRange).map(d => formatDate(d))
  }, [dateRange])

  const {
    selectedDates,
    setSelectedDates,
    rangeStart,
    handleDateClick,
    markAllAs,
    resetDateSelection
  } = useDateSelection({ dateRange, allTripDates, initialDates })

  const availableRanges = useMemo(
    () => groupDatesIntoRanges(Array.from(selectedDates), 'available'),
    [selectedDates]
  )

  const unavailableDates = useMemo(() => {
    return allTripDates.filter(date => !selectedDates.has(date))
  }, [allTripDates, selectedDates])

  const unavailableRanges = useMemo(
    () => groupDatesIntoRanges(unavailableDates, 'unavailable'),
    [unavailableDates]
  )

  const compatibleWindowsCount = useMemo(() => {
    return countCompatibleWindows(availableRanges, numDays)
  }, [availableRanges, numDays])

  const {
    selectedRangeIds,
    hasSelectedRanges,
    toggleRangeSelection,
    deleteSelectedRanges,
    resetRangeSelection
  } = useRangeSelection({
    availableRanges,
    unavailableRanges,
    setSelectedDates
  })

  const isDirty = useMemo(() => {
    const nameChanged = name !== initialName
    const datesChanged = hasSetChanged(selectedDates, new Set(initialDates))
    return nameChanged || datesChanged
  }, [name, selectedDates, initialName, initialDates])

  const getFormData = useCallback((): ResponseFormData => ({
    name: name.trim(),
    availableDates: Array.from(selectedDates).sort()
  }), [name, selectedDates])

  const reset = useCallback(() => {
    setName(initialName)
    resetDateSelection()
    resetRangeSelection()
  }, [initialName, resetDateSelection, resetRangeSelection])

  return {
    name,
    setName,
    selectedDates,
    selectedRangeIds,
    rangeStart,
    availableRanges,
    unavailableRanges,
    compatibleWindowsCount,
    hasSelectedRanges,
    isDirty,
    handleDateClick,
    toggleRangeSelection,
    deleteSelectedRanges,
    markAllAs,
    getFormData,
    reset
  }
}

// --- Sub-hooks ---

interface UseDateSelectionProps {
  dateRange: { start: Date; end: Date }
  allTripDates: string[]
  initialDates: string[]
}

function useDateSelection({ dateRange, allTripDates, initialDates }: UseDateSelectionProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    () => new Set(initialDates)
  )
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  const handleDateClick = useCallback((date: Date) => {
    if (!isWithinInterval(date, dateRange)) return

    const dateStr = formatDate(date)
    const isClickingRangeStart = rangeStart !== null && formatDate(rangeStart) === dateStr

    if (isClickingRangeStart) {
      setRangeStart(null)
      return
    }

    if (selectedDates.has(dateStr)) {
      setSelectedDates(prev => removeDatesFromSet(prev, [dateStr]))
      setRangeStart(null)
      return
    }

    const isStartingNewRange = rangeStart === null

    if (isStartingNewRange) {
      setRangeStart(date)
      setSelectedDates(prev => addDatesToSet(prev, [dateStr]))
      return
    }

    const start = rangeStart < date ? rangeStart : date
    const end = rangeStart < date ? date : rangeStart
    const rangeDates = eachDayOfInterval({ start, end }).map(formatDate)

    setSelectedDates(prev => addDatesToSet(prev, rangeDates))
    setRangeStart(null)
  }, [rangeStart, dateRange, selectedDates])

  const markAllAs = useCallback((status: 'available' | 'unavailable') => {
    setRangeStart(null)
    if (status === 'available') {
      setSelectedDates(new Set(allTripDates))
    } else {
      setSelectedDates(new Set())
    }
  }, [allTripDates])

  const resetDateSelection = useCallback(() => {
    setSelectedDates(new Set(initialDates))
    setRangeStart(null)
  }, [initialDates])

  return { selectedDates, setSelectedDates, rangeStart, handleDateClick, markAllAs, resetDateSelection }
}

interface UseRangeSelectionProps {
  availableRanges: DateRange[]
  unavailableRanges: DateRange[]
  setSelectedDates: React.Dispatch<React.SetStateAction<Set<string>>>
}

function useRangeSelection({
  availableRanges,
  unavailableRanges,
  setSelectedDates
}: UseRangeSelectionProps) {
  const [selectedRangeIds, setSelectedRangeIds] = useState<Set<string>>(new Set())

  const totalRangeCount = availableRanges.length + unavailableRanges.length
  const isSingleFullRange = totalRangeCount === 1 && selectedRangeIds.size === 1
  const hasSelectedRanges = selectedRangeIds.size > 0 && !isSingleFullRange

  const toggleRangeSelection = useCallback((rangeId: string) => {
    setSelectedRangeIds(prev => {
      const next = new Set(prev)
      if (next.has(rangeId)) {
        next.delete(rangeId)
      } else {
        next.add(rangeId)
      }
      return next
    })
  }, [])

  const deleteSelectedRanges = useCallback(() => {
    const allRangesSelected = selectedRangeIds.size === totalRangeCount

    if (allRangesSelected) {
      setSelectedDates(new Set())
      setSelectedRangeIds(new Set())
      return
    }

    setSelectedDates(prev => {
      let next = new Set(prev)

      for (const rangeId of selectedRangeIds) {
        const availableRange = availableRanges.find(r => r.id === rangeId)
        if (availableRange) {
          next = removeDatesFromSet(next, expandRangeToDates(availableRange))
        }

        const unavailableRange = unavailableRanges.find(r => r.id === rangeId)
        if (unavailableRange) {
          next = addDatesToSet(next, expandRangeToDates(unavailableRange))
        }
      }

      return next
    })
    setSelectedRangeIds(new Set())
  }, [selectedRangeIds, totalRangeCount, availableRanges, unavailableRanges, setSelectedDates])

  const resetRangeSelection = useCallback(() => {
    setSelectedRangeIds(new Set())
  }, [])

  return { selectedRangeIds, hasSelectedRanges, toggleRangeSelection, deleteSelectedRanges, resetRangeSelection }
}

// --- Pure helpers ---

function formatDate(date: Date): string {
  return format(date, DATE_FORMAT)
}

function expandRangeToDates(range: DateRange): string[] {
  return eachDayOfInterval({
    start: parseISO(range.start),
    end: parseISO(range.end)
  }).map(formatDate)
}

function addDatesToSet(set: Set<string>, dates: string[]): Set<string> {
  const next = new Set(set)
  for (const date of dates) {
    next.add(date)
  }
  return next
}

function removeDatesFromSet(set: Set<string>, dates: string[]): Set<string> {
  const next = new Set(set)
  for (const date of dates) {
    next.delete(date)
  }
  return next
}

function countCompatibleWindows(ranges: DateRange[], minDays: number): number {
  return ranges
    .filter(range => range.days >= minDays)
    .reduce((total, range) => total + (range.days - minDays + 1), 0)
}

function hasSetChanged(current: Set<string>, initial: Set<string>): boolean {
  if (current.size !== initial.size) return true
  for (const item of current) {
    if (!initial.has(item)) return true
  }
  return false
}
